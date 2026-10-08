import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all orders
export const getOrders = async () => {
  "use cache";
  cacheTag("orders");
  const orders = await prisma.order.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
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
// get sales report
export const getSalesReport = async () => {
  "use cache";
  cacheTag("orders");
  const salesData = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group and sum by month
  const monthlySales: Record<string, number> = {};

  for (const order of salesData) {
    const monthKey = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
    });

    monthlySales[monthKey] =
      (monthlySales[monthKey] || 0) + Number(order.totalAmount);
  }

  // Format into array
  const formattedData = Object.entries(monthlySales).map(
    ([date, totalSales]) => ({
      date,
      totalSales,
    })
  );

  return formattedData;
};
// get most selling category
export const getMostSellingCategory = async () => {
  "use cache";
  cacheTag("orders");
  // Fetch all paid orders
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
    },
    select: {
      products: true, // JSON field with product details
    },
  });

  // Flatten products and aggregate sales by category
  const categorySales: any = {};

  for (const order of orders) {
    const products = order.products as {
      id: string;
      quantity: number;
      price: number;
    }[];
    for (const product of products) {
      // Fetch the product's category
      const productDetails = await prisma.product.findUnique({
        where: { id: product.id },
        select: { category: true },
      });
      if (productDetails) {
        const category = productDetails.category?.title; // Assuming 'title' is the string property of category
        if (category) {
          const salesAmount = product.price * product.quantity;
          categorySales[category] = (categorySales[category] || 0) + salesAmount;
        }
      }
    }
  }

  // Format data for the pie chart
  const formattedData = Object.entries(categorySales).map(
    ([category, totalSales]) => ({
      category,
      totalSales,
    })
  );

  return formattedData;
};
// get dashboard stats
export async function getDashboardStats() {
  // Customer Count
  const customerCount = await prisma.user.count();

  // Order Count
  const orderCount = await prisma.order.count();

  // Example: Customer Growth (compare this year with last year, for example)
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const currentYearCustomers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });

  const previousYearCustomers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(`${previousYear}-01-01`),
        lt: new Date(`${previousYear + 1}-01-01`),
      },
    },
  });

  const customerGrowth = previousYearCustomers
    ? ((currentYearCustomers - previousYearCustomers) / previousYearCustomers) * 100
    : 0;

  // Example: Order Drop (compare this year with last year, for example)
  const currentYearOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });

  const previousYearOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(`${previousYear}-01-01`),
        lt: new Date(`${previousYear + 1}-01-01`),
      },
    },
  });

  const orderDrop = previousYearOrders
    ? ((currentYearOrders - previousYearOrders) / previousYearOrders) * 100
    : 0;

  return {
    customerCount,
    orderCount,
    customerGrowth,
    orderDrop,
  };
}