import { Metadata } from "next";
import { Suspense } from "react";

import ShopWithSidebar from "@/components/ShopWithSidebar";
import {
  getAllProducts,
  getShopData,
} from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata =
  async (): Promise<Metadata> => {
    const siteName =
      await getSiteName();

    return {
      title: `Shop With Sidebar Page | ${siteName}`,
      description: `This is Shop With Sidebar Page for ${siteName}`,
    };
  };

type PageProps = {
  searchParams: Promise<{
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

const ShopWithSidebarPage = async ({
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
            label:
              "Shop With Sidebar",
            href: "/shop-with-sidebar",
          },
        ]}
        seoHeading={true}
      />

      <Suspense
        fallback={
          <div className="h-screen bg-gray-2" />
        }
      >
        <AsyncShopWithSidebar
          searchParamsPromise={
            searchParams
          }
        />
      </Suspense>
    </main>
  );
};

const AsyncShopWithSidebar =
  async ({
    searchParamsPromise,
  }: {
    searchParamsPromise:
      PageProps["searchParams"];
  }) => {
    const params =
      await searchParamsPromise;

    const normalizedParams = {
      category:
        params.category || undefined,

      sizes:
        params.sizes || undefined,

      colors:
        params.colors || undefined,

      minPrice:
        params.minPrice || undefined,

      maxPrice:
        params.maxPrice || undefined,

      sort:
        params.sort || undefined,
    };

    const [
      shopData,
      allProducts,
    ] = await Promise.all([
      getShopData(
        normalizedParams
      ),

      getAllProducts(),
    ]);

    const componentKey = [
      normalizedParams.category ||
        "",
      normalizedParams.sizes ||
        "",
      normalizedParams.colors ||
        "",
      normalizedParams.minPrice ||
        "",
      normalizedParams.maxPrice ||
        "",
      normalizedParams.sort ||
        "",
    ].join("|");

    return (
      <ShopWithSidebar
        key={componentKey}
        searchParams={
          normalizedParams
        }
        data={{
          ...shopData,
          allProducts,
        }}
      />
    );
  };

export default ShopWithSidebarPage;