import type { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import {
  getCategories,
  getCategoryBySlug,
} from "@/get-api-data/category";
import { getSiteName } from "@/get-api-data/seo-setting";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";
import { Suspense } from "react";

// ======================================================
// TYPES
// ======================================================

type Params = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    date?: string;
    sort?: string;
  }>;
};

type BreadcrumbItem = {
  label: string;
  href: string;
};

type CategoryTreeItem = {
  id: number;
  parentId: number | null;
};

// ======================================================
// CATEGORY TREE HELPER
// ======================================================

function collectCategoryAndDescendantIds(
  categoryId: number,
  categories: CategoryTreeItem[]
): number[] {
  const ids = new Set<number>();

  const collect = (id: number) => {
    if (ids.has(id)) return;

    ids.add(id);

    const children = categories.filter(
      (category) => category.parentId === id
    );

    children.forEach((child) => collect(child.id));
  };

  collect(categoryId);

  return Array.from(ids);
}

// ======================================================
// STATIC PARAMS
// ======================================================

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// ======================================================
// METADATA
// ======================================================

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const categoryData =
    await getCategoryBySlug(decodedSlug);

  const siteURL = process.env.SITE_URL;

  // Ensure siteName is always a string
  const siteName =
    (await getSiteName()) ?? "Online Store";

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description: "No product category has been found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = categoryData.description
    ? categoryData.description.slice(0, 136)
    : "";

  const canonicalUrl = siteURL
    ? `${siteURL.replace(/\/$/, "")}/categories/${categoryData.slug}`
    : `/categories/${categoryData.slug}`;

  return {
    title: `${categoryData.title} | ${siteName}`,
    description,

    authors: [
      {
        name: siteName,
      },
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      nocache: true,

      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title: `${categoryData.title} | ${siteName}`,
      description,
      url: canonicalUrl,
      siteName,

      images: categoryData.img
        ? [
            {
              url: categoryData.img,
              width: 1800,
              height: 1600,
              alt: categoryData.title,
            },
          ]
        : [],

      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${categoryData.title} | ${siteName}`,
      description,
      creator: siteName,
      images: categoryData.img
        ? [categoryData.img]
        : [],
    },
  };
}

// ======================================================
// PAGE
// ======================================================

const CategoryPage = ({
  params,
  searchParams,
}: Params) => {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-gray-2" />
      }
    >
      <AsyncCategoryContent
        paramsPromise={params}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
};

// ======================================================
// ASYNC CONTENT
// ======================================================

async function AsyncCategoryContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Params["params"];
  searchParamsPromise: Params["searchParams"];
}) {
  const { slug } = await paramsPromise;
  const decodedSlug = decodeURIComponent(slug);

  const { date, sort } = await searchParamsPromise;

  // ====================================================
  // LOAD CURRENT CATEGORY
  // ====================================================

  const categoryData = await prisma.category.findUnique({
    where: {
      slug: decodedSlug,
    },

    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,

      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,

          parent: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!categoryData) {
    return (
      <main>
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Category not found",
              href: "/categories",
            },
          ]}
          seoHeading={true}
        />

        <div className="py-20 text-center text-gray-500">
          Category not found
        </div>
      </main>
    );
  }

  // ====================================================
  // LOAD CATEGORY TREE
  // ====================================================

  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      parentId: true,
    },
  });

  const categoryIds = collectCategoryAndDescendantIds(
    categoryData.id,
    allCategories
  );

  // ====================================================
  // SORTING
  // ====================================================

  const orderBy:
    Prisma.ProductOrderByWithRelationInput[] = [];

  if (date) {
    orderBy.push({
      updatedAt:
        date === "desc"
          ? Prisma.SortOrder.desc
          : Prisma.SortOrder.asc,
    });
  }

  if (sort === "popular") {
    orderBy.push({
      reviews: {
        _count: Prisma.SortOrder.desc,
      },
    });
  }

  if (orderBy.length === 0) {
    orderBy.push({
      updatedAt: Prisma.SortOrder.desc,
    });
  }

  // ====================================================
  // PRODUCTS
  // ====================================================

  const products = await prisma.product.findMany({
    where: {
      categoryId: {
        in: categoryIds,
      },
    },

    orderBy,

    select: {
      id: true,
      title: true,
      shortDescription: true,
      price: true,
      discountedPrice: true,
      slug: true,
      quantity: true,
      updatedAt: true,
      manufacturer: true,
      features: true,

      // FIX: Include showName in variantGroups
      variantGroups: {
        orderBy: {
          position: "asc",
        },

        select: {
          id: true,
          name: true,
          showName: true,
          position: true,

          options: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              name: true,
              priceAdjustment: true,
              isDefault: true,
              position: true,
            },
          },
        },
      },

      productImages: {
        select: {
          id: true,
          image: true,
        },
      },

      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true,
            },
          },
        },
      },
    },
  });

  // ====================================================
  // FORMAT PRODUCTS
  // ====================================================

  const formattedProducts = products.map(
    ({ _count, ...item }) => ({
      ...item,

      reviews: _count.reviews,

      price: item.price.toNumber(),

      discountedPrice:
        item.discountedPrice != null
          ? item.discountedPrice.toNumber()
          : null,

      variantGroups: item.variantGroups.map((group) => ({
        ...group,

        options: group.options.map((option) => ({
          ...option,
          priceAdjustment:
            option.priceAdjustment.toNumber(),
        })),
      })),
    })
  );

  // ====================================================
  // BREADCRUMBS
  // ====================================================

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  if (categoryData.parent?.parent) {
    breadcrumbItems.push({
      label: categoryData.parent.parent.title,
      href: `/categories/${categoryData.parent.parent.slug}`,
    });
  }

  if (categoryData.parent) {
    breadcrumbItems.push({
      label: categoryData.parent.title,
      href: `/categories/${categoryData.parent.slug}`,
    });
  }

  breadcrumbItems.push({
    label: categoryData.title,
    href: `/categories/${categoryData.slug}`,
  });

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main>
      <Breadcrumb
        items={breadcrumbItems}
        seoHeading={true}
      />

      <ShopWithoutSidebar
        shopData={formattedProducts}
        searchParams={{
          date: date ?? "",
          sort: sort ?? "",
        }}
      />
    </main>
  );
}

export default CategoryPage;