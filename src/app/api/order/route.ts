import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@/utils/sendResponse";

class OrderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderConflictError";
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        billing: {
          path: ["email"],
          equals: session.user.email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      billing,
      shipping,
      shippingMethod,
      paymentMethod,
      notes,
      couponDiscount,
      couponCode,
      products,
      totalAmount,
      paymentIntentId,
    } = body;

    const session = await getServerSession(authOptions);

    if (
      !billing ||
      typeof billing.email !== "string" ||
      !billing.email.trim() ||
      !shippingMethod ||
      typeof paymentMethod !== "string" ||
      !paymentMethod
    ) {
      return sendErrorResponse(400, "Missing order details");
    }

    if (!Array.isArray(products) || products.length === 0) {
      return sendErrorResponse(400, "Your cart is empty");
    }

    if (
      typeof totalAmount !== "number" ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return sendErrorResponse(400, "Invalid order total");
    }

    if (
      couponDiscount != null &&
      (typeof couponDiscount !== "number" ||
        !Number.isFinite(couponDiscount) ||
        couponDiscount < 0)
    ) {
      return sendErrorResponse(400, "Invalid coupon discount");
    }

    if (couponCode != null && typeof couponCode !== "string") {
      return sendErrorResponse(400, "Invalid coupon code");
    }

    const productIds = new Set<string>();

    for (const item of products) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !item.id ||
        typeof item.name !== "string" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        typeof item.price !== "number" ||
        !Number.isFinite(item.price) ||
        item.price < 0
      ) {
        return sendErrorResponse(400, "Invalid cart item");
      }

      if (productIds.has(item.id)) {
        return sendErrorResponse(400, "Duplicate cart item");
      }

      productIds.add(item.id);
    }

    const isCashOnDelivery = paymentMethod === "cod";

    if (isCashOnDelivery && paymentIntentId) {
      return sendErrorResponse(
        400,
        "Cash on Delivery cannot include a Stripe payment"
      );
    }

    if (!isCashOnDelivery) {
      if (
        typeof paymentIntentId !== "string" ||
        !paymentIntentId
      ) {
        return sendErrorResponse(
          400,
          "Stripe payment reference is required"
        );
      }

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (
        paymentIntent.currency !== "usd" ||
        paymentIntent.amount !== Math.round(totalAmount * 100) ||
        paymentIntent.metadata.orderId ||
        ![
          "requires_payment_method",
          "requires_confirmation",
        ].includes(paymentIntent.status)
      ) {
        return sendErrorResponse(
          400,
          "Invalid or already-used Stripe payment"
        );
      }
    }

    // A conflict throws inside the transaction, rolling back
    // all stock, coupon, and order changes from this attempt.
    const order = await prisma.$transaction(async (tx) => {
      for (const item of products) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.id,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count !== 1) {
          throw new OrderConflictError(
            `Insufficient quantity or unavailable product: ${item.name}`
          );
        }
      }

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: {
            code: couponCode,
          },
        });

        if (!coupon) {
          throw new OrderConflictError("Invalid coupon code");
        }

        if (coupon.timesRedemed >= coupon.maxRedemptions) {
          throw new OrderConflictError(
            "Coupon has reached its maximum redemptions"
          );
        }

        const updatedCoupon = await tx.coupon.updateMany({
          where: {
            code: couponCode,
            timesRedemed: {
              lt: coupon.maxRedemptions,
            },
          },
          data: {
            timesRedemed: {
              increment: 1,
            },
          },
        });

        if (updatedCoupon.count !== 1) {
          throw new OrderConflictError(
            "Coupon has reached its maximum redemptions"
          );
        }
      }

      return tx.order.create({
        data: {
          billing,
          ...(shipping != null ? { shipping } : {}),
          shippingMethod,
          paymentMethod,
          notes: typeof notes === "string" ? notes : null,
          couponDiscount: couponDiscount ?? null,
          products,
          totalAmount,
          userId: session?.user?.id || null,
          paymentStatus: "pending",
        },
      });
    });

    if (!isCashOnDelivery) {
      try {
        await stripe.paymentIntents.update(
          paymentIntentId,
          {
            metadata: {
              orderId: order.id,
            },
          },
          {
            idempotencyKey: `attach-order-${order.id}`,
          }
        );
      } catch (error) {
        console.error("Failed to link payment to order:", {
          orderId: order.id,
          paymentIntentId,
          error,
        });

        revalidateTag("orders", { expire: 0 });

        // The order exists. Do not encourage another submission.
        return NextResponse.json(
          {
            success: false,
            message:
              "Your pending order was saved, but payment initialization failed. Please contact support before placing another order.",
            data: {
              id: order.id,
            },
          },
          { status: 502 }
        );
      }
    }

    // Confirms order creation, not payment.
    try {
      const customerName =
        [billing.firstName, billing.lastName]
          .filter(Boolean)
          .join(" ") || "Customer";

      const deliveryAddress = shipping ?? billing;

      const deliveryName =
        [deliveryAddress.firstName, deliveryAddress.lastName]
          .filter(Boolean)
          .join(" ") || customerName;

      await sendOrderConfirmationEmail({
        to: billing.email,
        orderNumber: String(order.orderNumber),
        customerName,
        orderDate: new Date().toLocaleDateString(),
        totalAmount: order.totalAmount,
        orderItems: products.map(
          (product: {
            name: string;
            quantity: number;
            price: number;
          }) => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
          })
        ),
        shippingAddress: {
          name: deliveryName,
          address:
            deliveryAddress.address?.street ||
            billing.address?.street ||
            "",
          city: deliveryAddress.town || billing.town || "",
          country:
            deliveryAddress.country || billing.country || "",
        },
      });
    } catch (emailError) {
      console.error(
        "Failed to send order confirmation email:",
        emailError
      );
    }

    revalidateTag("orders", { expire: 0 });

    return sendSuccessResponse(
      200,
      "Order created successfully",
      order
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    if (error instanceof OrderConflictError) {
      return sendErrorResponse(409, error.message);
    }

    return sendErrorResponse(
      500,
      "Unable to create order. Please try again."
    );
  }
}