import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismaDB";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { revalidateTag } from "next/cache";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        billing: {
          path: ["email"],
          equals: session.user.email,
        },
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shipToDifferentAddress, couponDiscount, couponCode, products, ...orderData } = body;

    // Start a transaction to ensure atomic updates
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          products,
          couponDiscount,
        },
      });

      // Update product quantity
      for (const item of products) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          select: { quantity: true },
        });

        if (!product || product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for product: ${item.name}`);
        }

        await tx.product.update({
          where: { id: item.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // If a coupon was applied, update its redemption count
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
        });
        if (!coupon) {
          throw new Error("Invalid coupon code");
        }
        if (coupon.timesRedemed >= coupon.maxRedemptions) {
          throw new Error("Coupon has reached its maximum redemptions");
        }
        await tx.coupon.update({
          where: { code: couponCode },
          data: {
            timesRedemed: { increment: 1 },
          },
        });
      }

      return newOrder;
    });
    // Send order confirmation email (wrapped in try-catch to prevent email failures from affecting order creation)
    if (order.id) {
      try {
        await sendOrderConfirmationEmail({
          to: orderData.billing.email,
          orderNumber: order.id,
          customerName: orderData.billing?.firstName + " " + orderData.billing?.lastName || "Customer",
          orderDate: new Date().toLocaleDateString(),
          totalAmount: order.totalAmount,
          orderItems: products.map((product: any) => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
          })),
          shippingAddress: {
            name: orderData?.shipping?.email || orderData.billing?.email,
            address: orderData?.shipping?.address?.street || orderData.billing?.address?.street,
            city: orderData?.shipping?.town || orderData.billing?.town,
            country: orderData?.shipping?.country || orderData.billing?.country,
          },
        });
      } catch (emailError: any) {
        // Log email error but don't fail the order creation
        console.error("Failed to send order confirmation email:", emailError?.message || emailError);
        // Order was created successfully, so we still return success
      }
    }

    revalidateTag("orders", { expire: 0 });
    return sendSuccessResponse(200, "Order created successfully", order);
  } catch (err: any) {
    console.log(err?.stack || err);
    return sendErrorResponse(500, err.message || "Internal Server Error");
  }
}

