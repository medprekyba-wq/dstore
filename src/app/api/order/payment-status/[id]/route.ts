import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";


// status update
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return sendErrorResponse(401, "Unauthorized");

    const { id: orderId } = await params;

    if (!orderId) {
      return sendErrorResponse(400, "Order ID is required");
    }
    // Parse request body
    const body = await request.json();
    const { status } = body;

    // **Find the existing orderItem**
    const orderItem = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderItem) {
      return sendErrorResponse(404, "Order not found");
    }

    // Update order with provided fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status
      },
    });

    revalidateTag("orders", { expire: 0 });
    return sendSuccessResponse(200, "Payment status updated successfully", updatedOrder);

  } catch (error: any) {
    console.error("Error updating order status:", error);
    return sendErrorResponse(500, error?.message || "Internal server error");
  }
}