"use server";

import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// status update
export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "processing" | "delivered" | "cancel"
) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!orderId) {
      return errorResponse(400, "Order ID is required");
    }

    // **Find the existing orderItem**
    const orderItem = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderItem) {
      return errorResponse(404, "Order not found");
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

    return successResponse(
      200,
      "Order status updated successfully",
      updatedOrder
    );
  } catch (error: any) {
    console.error("Error updating order status:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};
