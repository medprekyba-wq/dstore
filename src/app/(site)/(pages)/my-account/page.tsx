import RecentOrders from "@/app/(studio)/admin/_components/RecentOrders";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import UserDashboardStats from "./_components/UserDashboardStats";

export default async function MyAccountPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white animate-pulse" />}>
      <AsyncMyAccountContent />
    </Suspense>
  );
}

async function AsyncMyAccountContent() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER") {
    return redirect("/admin/dashboard");
  }

  let orders: any[] = [];
  if (session?.user?.id) {
    const orConditions: any[] = [{ userId: session.user.id }];
    if (session.user.email) {
      orConditions.push({
        billing: { path: ["email"], equals: session.user.email },
      });
    }

    orders = await prisma.order.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.shippingStatus === "pending"
  ).length;
  const processingOrders = orders.filter(
    (o) => o.shippingStatus === "processing"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.shippingStatus === "delivered"
  ).length;

  const dashboardStates = {
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
  };

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    shippingStatus: o.shippingStatus,
    products: Array.isArray(o.products) ? o.products : null,
  }));

  return (
    <div className="flex flex-col w-full">
      <div className="w-full">
        <UserDashboardStats dashboardStates={dashboardStates} />
      </div>

      <div className="w-full">
        <RecentOrders orders={recentOrders} viewAllLink="/my-account/orders" />
      </div>
    </div>
  );
}
