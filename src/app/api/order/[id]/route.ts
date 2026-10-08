import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { NextRequest } from "next/server";


// UPDATE ORDER
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is authenticated
    const session = await authenticate();
    if (!session) return sendErrorResponse(401, "Unauthorized");

    const { id: orderId } = await params;

    if (!orderId) {
      return sendErrorResponse(400, "Order ID is required");
    }

    // Parse request body
    const body = await request.json();

    // Validate if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return sendErrorResponse(404, "Order not found");
    }

    // Update order with provided fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        billing: body.billing ? body.billing : existingOrder.billing,
        shipping: body.shipping ? body.shipping : existingOrder.shipping,
        shippingMethod: body.shippingMethod || existingOrder.shippingMethod,
        paymentMethod: body.paymentMethod || existingOrder.paymentMethod,
        notes: body.notes || existingOrder.notes,
        couponDiscount: body.couponDiscount ?? existingOrder.couponDiscount,
        totalAmount: body.totalAmount ?? existingOrder.totalAmount,
        paymentStatus: body.paymentStatus || existingOrder.paymentStatus,
        shippingStatus: body.shippingStatus || existingOrder.shippingStatus,
      },
    });

    return sendSuccessResponse(200, "Order updated successfully", updatedOrder);

  } catch (error: any) {
    console.error("Error updating order:", error?.stack);
    return sendErrorResponse(500, error?.message || "Internal server error");
  }
}

// DELETE ORDER
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return sendErrorResponse(401, "Unauthorized");

    const { id: orderId } = await params;

    if (!orderId) {
      return sendErrorResponse(400, "Order ID is required");
    }

    // **Find the existing orderItem**
    const orderItem = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderItem) {
      return sendErrorResponse(404, "Order not found");
    }

    // Delete order from database
    await prisma.order.delete({ where: { id: orderId } });

    return sendSuccessResponse(200, "Order deleted successfully");

  } catch (error: any) {
    console.error("Error deleting Order:", error?.stack);
    return sendErrorResponse(500, error?.message || "Internal server error");
  }
}