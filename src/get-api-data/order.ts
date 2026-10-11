import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all orders
export const getOrders = async () => {
  "use cache";
  cacheTag("orders");

  const orders = await prisma.order.findMany({
    orderBy: {
       orderNumber: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      billing: true,
      shipping: true,
      totalAmount: true,
      paymentMethod: true,
      paymentStatus: true,
      products: true,
      userId: true,
      updatedAt: true,
      shippingStatus: true,
      shippingMethod: true,
      couponDiscount: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      createdAt: true,
    },
  });

  return orders;
};