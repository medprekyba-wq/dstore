"use server";

import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

type OrderStatus = "pending" | "processing" | "delivered" | "cancel";

async function checkAdmin() {
  const session = await authenticate();

  if (!session?.user?.id) {
    return {
      authorized: false as const,
      status: 401,
      message: "Unauthorized",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    return {
      authorized: false as const,
      status: 403,
      message: "Administrator access required",
    };
  }

  return {
    authorized: true as const,
  };
}

// Update shipping status and create a tracking event.
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  try {
    const authorization = await checkAdmin();

    if (!authorization.authorized) {
      return errorResponse(
        authorization.status,
        authorization.message
      );
    }

    if (typeof orderId !== "string" || !orderId.trim()) {
      return errorResponse(400, "Order ID is required");
    }

    const validStatuses: OrderStatus[] = [
      "pending",
      "processing",
      "delivered",
      "cancel",
    ];

    if (!validStatuses.includes(status)) {
      return errorResponse(400, "Invalid order status");
    }

    const trackingDetails: Record<
      OrderStatus,
      { message: string; location: string }
    > = {
      pending: {
        message: "Your order is pending confirmation.",
        location: "Online",
      },
      processing: {
        message: "Your order is being packed and prepared for dispatch.",
        location: "Fulfillment Center",
      },
      delivered: {
        message: "Your order has been delivered successfully.",
        location: "Delivery Address",
      },
      cancel: {
        message: "Your order has been cancelled.",
        location: "Online",
      },
    };

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        return null;
      }

      // Avoid duplicate tracking entries for an unchanged status.
      if (order.shippingStatus === status) {
        return order;
      }

      const updated = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          shippingStatus: status,
        },
      });

      await tx.orderTracking.create({
        data: {
          orderId,
          status,
          message: trackingDetails[status].message,
          location: trackingDetails[status].location,
        },
      });

      return updated;
    });

    if (!updatedOrder) {
      return errorResponse(404, "Order not found");
    }

    revalidateTag("orders", { expire: 0 });

    return successResponse(
      200,
      "Order status updated successfully",
      updatedOrder
    );
  } catch (error) {
    console.error("Error updating order status:", error);

    return errorResponse(500, "Unable to update order status");
  }
};

// Permanently delete an order and its tracking records.
export const deleteOrder = async (orderId: string) => {
  try {
    const authorization = await checkAdmin();

    if (!authorization.authorized) {
      return errorResponse(
        authorization.status,
        authorization.message
      );
    }

    if (typeof orderId !== "string" || !orderId.trim()) {
      return errorResponse(400, "Order ID is required");
    }

    const deletedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          orderNumber: true,
        },
      });

      if (!order) {
        return null;
      }

      await tx.orderTracking.deleteMany({
        where: {
          orderId,
        },
      });

      await tx.order.delete({
        where: {
          id: orderId,
        },
      });

      return order;
    });

    if (!deletedOrder) {
      return errorResponse(404, "Order not found");
    }

    revalidateTag("orders", { expire: 0 });

    return successResponse(
      200,
      "Order deleted successfully",
      deletedOrder
    );
  } catch (error) {
    console.error("Error deleting order:", error);

    return errorResponse(500, "Unable to delete order");
  }
};