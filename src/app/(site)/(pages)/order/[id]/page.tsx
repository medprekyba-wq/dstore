import Breadcrumb from "@/components/Common/Breadcrumb";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import InvoiceDetails from "./_components/InvoiceDetails";

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-2" />}>
      <AsyncOrderInvoiceContent paramsPromise={params} />
    </Suspense>
  );
}

async function getInvoiceData(id: string) {
  "use cache";
  cacheLife('seconds')
  cacheTag(`invoice-${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  const headerSettingData = await getHeaderSettings();

  if (!order) {
    return null;
  }

  // Typecast json fields
  const billing: any = order.billing || {};
  const user: any = order.user || {};

  // Determine user data
  const userName =
    user?.name ||
    (billing?.firstName
      ? billing?.firstName + " " + (billing?.lastName || "")
      : "Guest User");
  const userEmail = user?.email || billing?.email;
  const paymentMethod = order.paymentMethod || "COD";
  const status = order.shippingStatus || "Pending";
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Since order items are stored as JSON in the schema, we assert type
  const products: any[] = (order.products as any[]) || [];

  return {
    id: order.id,
    date,
    userName,
    userEmail,
    billing,
    paymentMethod,
    status,
    products,
    shippingCost:
      Object.keys(order.shippingMethod || {}).length > 0
        ? (order.shippingMethod as any).price
        : 0,
    discount: order.couponDiscount || 0,
    totalAmount: order.totalAmount || 0,
    logo: headerSettingData?.headerLogo || null,
    storeName: headerSettingData?.headerLogo ? undefined : "CozyCommerce",
  };
}

async function AsyncOrderInvoiceContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const invoiceData = await getInvoiceData(id);

  if (!invoiceData) {
    notFound();
  }

  return (
    <main>
      <Breadcrumb
        title="Order Invoice"
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Order Invoice",
            href: "#",
          },
        ]}
      />
      <InvoiceDetails data={invoiceData} />
    </main>
  );
}
