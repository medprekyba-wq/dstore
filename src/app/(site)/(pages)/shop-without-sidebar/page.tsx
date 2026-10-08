import Breadcrumb from "@/components/Common/Breadcrumb";
import PreLoader from "@/components/Common/PreLoader";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getAllProducts } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { Suspense } from "react";

export const generateMetadata = async (): Promise<Metadata> => {
  const siteName = await getSiteName();

  return {
    title: `Shop Without Sidebar Page | ${siteName}`,
    description: `This is Shop Without Sidebar Page for ${siteName}`,
  };
};

type PageProps = {
  searchParams: Promise<{
    sort?: string;
  }>;
};

const ShopWithoutSidebarPage = async ({
  searchParams,
}: PageProps) => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Shop Without Sidebar",
            href: "/shop-without-sidebar",
          },
        ]}
        seoHeading={true}
      />

      <Suspense fallback={<PreLoader />}>
        <AsyncShopWithoutSidebar
          searchParamsPromise={searchParams}
        />
      </Suspense>
    </main>
  );
};

const AsyncShopWithoutSidebar = async ({
  searchParamsPromise,
}: {
  searchParamsPromise: PageProps["searchParams"];
}) => {
  const { sort } = await searchParamsPromise;

  const orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] =
    sort === "popular"
      ? {
          reviews: {
            _count: Prisma.SortOrder.desc,
          },
        }
      : {
          updatedAt: Prisma.SortOrder.desc,
        };

  const products =
    await getAllProducts(orderBy);

  return (
    <ShopWithoutSidebar
      key={sort || "default"}
      shopData={products}
      searchParams={{
        sort: sort || "",
      }}
    />
  );
};

export default ShopWithoutSidebarPage;