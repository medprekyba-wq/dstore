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

    // Create a meaningful message based on the status
    let message = `Order status updated to ${status}`;
    let location = "Online";

    switch (status) {
      case "pending":
        message = "Your order is pending confirmation.";
        break;
      case "processing":
        message = "Your order is being packed and prepared for dispatch.";
        location = "Fulfillment Center";
        break;
      case "delivered":
        message = "Your order has been delivered successfully.";
        location = "Delivery Address";
        break;
      case "cancel":
        message = "Your order has been cancelled.";
        break;
      default:
        break;
    }

    // Update order with provided fields AND create a tracking event in a transaction
    const [updatedOrder, newTracking] = await prisma.$transaction([
      prisma.order.update({
         where: { id: orderId },
         data: {
           shippingStatus: status
         },
      }),
      prisma.orderTracking.create({
        data: {
          orderId: orderId,
          status: status,
          message: message,
          location: location,
        }
      })
    ]);

    revalidateTag("orders", { expire: 0 });
    return sendSuccessResponse(200, "Order status updated successfully", updatedOrder);

  } catch (error: any) {
    console.error("Error updating order status:", error);
    return sendErrorResponse(500, error?.message || "Internal server error");
  }
}