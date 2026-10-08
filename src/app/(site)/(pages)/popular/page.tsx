import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getAllProducts } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { Suspense } from "react";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Shop Popular Page | ${site_name}`,
    description: `This is Shop Popular Page for ${site_name}`,
  };
};

type PageProps = {
  searchParams: Promise<{
    sort: string;
  }>;
};

async function PopularProducts({ searchParams }: PageProps) {
  const { sort } = await searchParams;

  const orderBy =
    sort === "popular"
      ? { reviews: { _count: Prisma.SortOrder.desc } }
      : { updatedAt: Prisma.SortOrder.desc };

  const products = await getAllProducts(orderBy);

  return (
    <ShopWithoutSidebar
      key={sort}
      shopData={products}
      searchParams={{ sort }}
    />
  );
}

const ShopWithoutSidebarPage = ({ searchParams }: PageProps) => {
  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Popular", href: "/popular?sort=popular" },
        ]}
        seoHeading={true}
      />
      <Suspense fallback={<ProductsSkeleton />}>
        <PopularProducts searchParams={searchParams} />
      </Suspense>
    </main>
  );
};

// skeleton while products load
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-64 bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export default ShopWithoutSidebarPage;