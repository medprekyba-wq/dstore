import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prismaDB";
import { sendAdminPaymentConfirmationEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe webhook] Signing secret is missing");

    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch {
    console.error("[Stripe webhook] Invalid signature");

    return NextResponse.json(
      { error: "Invalid Stripe signature" },
      { status: 400 }
    );
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.warn("[Stripe webhook] Missing order ID:", {
        paymentIntentId: paymentIntent.id,
      });

      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const expectedAmount = Math.round(order.totalAmount * 100);

    if (
      paymentIntent.currency !== "usd" ||
      paymentIntent.amount !== expectedAmount ||
      paymentIntent.amount_received !== expectedAmount
    ) {
      throw new Error(`Payment amount mismatch: ${orderId}`);
    }

    const updated = await prisma.order.updateMany({
      where: {
        id: orderId,
        paymentStatus: "pending",
      },
      data: {
        paymentStatus: "paid",
      },
    });

    if (updated.count === 1) {
      console.log("[Stripe webhook] Order marked paid:", orderId);

      // Attempt notification only for the first transition to paid.
      // Duplicate webhook deliveries do not send another email.
      try {
        await sendAdminPaymentConfirmationEmail({
          orderNumber: String(order.orderNumber),
          totalAmount: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id,
        });

        console.log(
          "[Stripe webhook] Administrator notification sent:",
          orderId
        );
      } catch (emailError) {
        // Keep the successful payment update even if email fails.
        console.error(
          "[Stripe webhook] Administrator notification failed:",
          {
            orderId,
            error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown email error",
          }
        );
      }
    } else {
      const savedOrder = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          paymentStatus: true,
        },
      });

      if (savedOrder?.paymentStatus !== "paid") {
        throw new Error(`Order was not marked paid: ${orderId}`);
      }
    }

    revalidateTag("orders", { expire: 0 });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe webhook] Processing failed:", error);

    return NextResponse.json(
      { error: "Unable to process webhook" },
      { status: 500 }
    );
  }
}