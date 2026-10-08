import { prisma } from "@/lib/prismaDB";

export async function getDashboardOrdersAmount() {
  // Today's boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  // Yesterday's boundaries
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = todayStart; // Yesterday ends when today starts

  // This month's boundaries
  const monthStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    1,
  );
  const nextMonthStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth() + 1,
    1,
  );

  // Aggregation queries for sales amount
  const todayOrdersAggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  });

  const yesterdayOrdersAggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: {
        gte: yesterdayStart,
        lt: yesterdayEnd,
      },
    },
  });

  const thisMonthAggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
  });

  const allTimeAggregate = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });

  // Parse the summed amounts (ensure non-null numbers)
  const todayOrdersAmount = todayOrdersAggregate._sum.totalAmount || 0;
  const yesterdayOrdersAmount = yesterdayOrdersAggregate._sum.totalAmount || 0;
  const thisMonthSalesAmount = thisMonthAggregate._sum.totalAmount || 0;
  const allTimeSalesAmount = allTimeAggregate._sum.totalAmount || 0;

  return {
    todayOrdersAmount,
    yesterdayOrdersAmount,
    thisMonthSalesAmount,
    allTimeSalesAmount,
  };
}

export async function getDashboardOrdersStatus() {
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { shippingStatus: "pending" },
  });
  const processingOrders = await prisma.order.count({
    where: { shippingStatus: "processing" },
  });
  const deliveredOrders = await prisma.order.count({
    where: { shippingStatus: "delivered" },
  });

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
  };
}

export async function getDashboardChartData() {
  const monthlyData = await prisma.order.groupBy({
    by: ["createdAt"],
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
    where: {
      paymentStatus: "paid",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  type MonthlyChartData = {
    month: string;
    sales: number;
    orders: number;
    revenue: number;
  };

  const formattedMonthlyData = monthlyData.reduce<MonthlyChartData[]>(
    (acc, order) => {
      const month = order.createdAt.toLocaleString("default", {
        month: "short",
      });

      const existing = acc.find((entry) => entry.month === month);

      if (existing) {
        existing.sales += order._sum.totalAmount ?? 0;
        existing.revenue += order._sum.totalAmount ?? 0; // revenue = sales
        existing.orders += order._count.id;
      } else {
        acc.push({
          month,
          sales: order._sum.totalAmount ?? 0,
          revenue: order._sum.totalAmount ?? 0,
          orders: order._count.id,
        });
      }

      return acc;
    },
    [],
  );

  // --------- Best Selling Product Categories Logic ----------
  type OrderedProduct = { id: string; quantity: number };

  const orders = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    select: { products: true },
  });

  const productCounts: Record<string, number> = {};

  orders.forEach((order) => {
    const products = order.products as OrderedProduct[];
    products.forEach((p) => {
      productCounts[p.id] = (productCounts[p.id] || 0) + p.quantity;
    });
  });

  const productIds = Object.keys(productCounts);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      category: {
        select: { title: true },
      },
    },
  });

  const categoryCounts: Record<string, number> = {};

  products.forEach((product) => {
    const count = productCounts[product.id];
    const category = product.category.title;
    categoryCounts[category] = (categoryCounts[category] || 0) + count;
  });

  return {
    monthlyData: formattedMonthlyData, // contains sales, orders, revenue
    categoryData: Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    })),
  };
}

// get recent order
export async function getRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      totalAmount: true,
      paymentStatus: true,
      shippingStatus: true,
      products: true,
    },
  });

  const allProductIds = new Set<string>();

  // Collect product IDs from all orders
  orders.forEach((order) => {
    const orderProducts = order.products as {
      id: string;
      quantity: number;
    }[];

    orderProducts.forEach((p) => {
      allProductIds.add(p.id);
    });
  });

  // Fetch full product details for those IDs
  const productData = await prisma.product.findMany({
    where: {
      id: {
        in: Array.from(allProductIds),
      },
    },

    select: {
      id: true,
      title: true,

      productImages: {
        select: {
          image: true,
        },
        take: 1,
      },

      category: {
        select: {
          title: true,
        },
      },

      price: true,
      discountedPrice: true,
    },
  });

  // Format orders with full product info and quantity
  const formattedOrders = orders.map((order) => {
    const orderProducts = order.products as {
      id: string;
      quantity: number;
    }[];

    const enrichedProducts = orderProducts
      .map((op) => {
        const product = productData.find(
          (p) => p.id === op.id
        );

        return product
          ? {
              id: product.id,
              title: product.title,

              image:
                product.productImages[0]?.image ||
                null,

              category:
                product.category?.title || "",

              quantity: op.quantity,

              price: product.discountedPrice
                ? product.discountedPrice.toNumber()
                : product.price.toNumber(),
            }
          : null;
      })
      .filter(Boolean);

    return {
      id: order.id,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      products: enrichedProducts,
    };
  });

  return formattedOrders;
}