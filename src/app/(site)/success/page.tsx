import { Metadata } from "next";
import CheckoutSuccess from "./CheckoutSuccess";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Suspense } from "react";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Success Page | ${site_name}`,
    description: `This is Success Page for ${site_name}`,
  };
};

const Success = ({
  searchParams,
}: {
  searchParams: Promise<{ amount: string }>;
}) => {
  return (
    <Suspense fallback={<div className="h-screen bg-white" />}>
      <AsyncSuccessContent searchParamsPromise={searchParams} />
    </Suspense>
  );
};

async function AsyncSuccessContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ amount: string }>;
}) {
  const { amount } = await searchParamsPromise;
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Success",
            href: "/success",
          },
        ]}
      />
      <CheckoutSuccess amount={amount} />
    </main>
  );
}

export default Success;
