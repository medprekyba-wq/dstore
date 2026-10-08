import Breadcrumb from "@/components/Common/Breadcrumb";
import { prisma } from "@/lib/prismaDB";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TrackingPage from "./_components/TrackingPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  return {
    title: `Track Order ${trackId}`,
    description: `Track your order with tracking ID ${trackId}`,
  };
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-2" />}>
      <AsyncTrackingContent paramsPromise={params} />
    </Suspense>
  );
}

async function getTrackedOrder(trackId: string, orderSuffix: string) {
  "use cache";
  cacheLife('seconds')
  cacheTag(`track-${trackId}`);

  const orders = await prisma.order.findMany({
    where: { id: { endsWith: orderSuffix } },
    include: {
      user: { select: { name: true, email: true } },
      trackings: { orderBy: { createdAt: "desc" } },
    },
    take: 1,
  });

  if (!orders.length) return null;

  const order = orders[0];
  const billing: any = order.billing || {};

  let trackings = order.trackings.map((t: any) => ({
    ...t,
    status: t.status.toLowerCase() === "processing" ? "Confirmed" : t.status,
    message:
      t.status.toLowerCase() === "processing" &&
      t.message === "Order status updated to processing"
        ? "Your order has been confirmed and is being prepared"
        : t.message,
    createdAt: t.createdAt.toISOString(),
  }));

  const hasOrderPlaced = trackings.some(
    (t) =>
      t.status.toLowerCase() === "order placed" ||
      t.status.toLowerCase() === "pending",
  );

  if (!hasOrderPlaced) {
    trackings.push({
      id: "fallback-initial",
      status: "Order Placed",
      message: "Your order has been placed successfully",
      location: "Online",
      createdAt: order.createdAt.toISOString(),
    });
  }

  // Ensure descending sort (newest first)
  trackings.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    orderId: order.id,
    trackingId: trackId.toUpperCase(),
    date: new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    status: order.shippingStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    billing,
    userName:
      order.user?.name ||
      (billing?.firstName
        ? `${billing.firstName} ${billing.lastName || ""}`.trim()
        : "Guest"),
    userEmail: order.user?.email || billing?.email,
    products: (order.products as any[]) || [],
    trackings,
  };
}

async function AsyncTrackingContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ trackId: string }>;
}) {
  const { trackId } = await paramsPromise;

  // Parse trackId: CC-{LAST8}-{CITY3}
  const parts = trackId.split("-");
  if (parts.length < 3 || parts[0] !== "CC") {
    notFound();
  }

  const orderSuffix = parts
    .slice(1, parts.length - 1)
    .join("-")
    .toLowerCase();

  const trackingData = await getTrackedOrder(trackId, orderSuffix);

  if (!trackingData) {
    notFound();
  }

  return (
    <>
      <Breadcrumb
        title="Track Order"
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Track Order",
            href: `/track/${trackId}`,
          },
        ]}
      />
      <TrackingPage data={trackingData} />
    </>
  );
}
