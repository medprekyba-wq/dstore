
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { structuredAlgoliaHtmlData } from "@/algolia/crawlIndex";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopDetails from "@/components/ShopDetails";
import RecentlyViewedItems from "@/components/ShopDetails/RecentlyViewd";

import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/get-api-data/product";

import { getSiteName } from "@/get-api-data/seo-setting";
import { IProductByDetails } from "@/types/product";

// ======================================================
// TYPES
// ======================================================

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// ======================================================
// STATIC PARAMS
// ======================================================

export async function generateStaticParams() {
  const products = await getAllProducts();

  return products
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      slug: product.slug,
    }));
}

// ======================================================
// METADATA
// ======================================================

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  // Ensure siteName is always a string
  const siteName =
    (await getSiteName()) ?? "Online Store";

  const siteURL = process.env.SITE_URL;

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "The requested product could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    product.shortDescription?.slice(0, 160) ||
    `View ${product.title} at ${siteName}.`;

  const canonicalUrl = siteURL
    ? `${siteURL.replace(/\/$/, "")}/products/${product.slug}`
    : `/products/${product.slug}`;

  const image =
    product.productImages?.[0]?.image ?? "";

  return {
    title: `${product.title || "Product"} | ${siteName}`,

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

      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title: `${product.title} | ${siteName}`,
      description,
      url: canonicalUrl,
      siteName,

      ...(image && {
        images: [
          {
            url: image,
            width: 1800,
            height: 1600,
            alt: product.title || siteName,
          },
        ],
      }),

      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${siteName}`,
      description,

      ...(image && {
        images: [image],
      }),
    },
  };
}

// ======================================================
// PRODUCT DETAILS PAGE
// ======================================================

const ProductDetails = async ({ params }: Props) => {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // ====================================================
  // RELATED PRODUCTS
  // ====================================================

  const recentProducts = await getRelatedProducts(
    product.category?.title ?? "",
    product.tags ?? [],
    product.id,
    product.title
  );

  // ====================================================
  // PRODUCT IMAGES
  // ====================================================

  const mainImage =
    product.productImages?.[0]?.image ?? "";

  const thumbnails =
    product.productImages?.map((image) => ({
      image: image.image,
    })) ?? [];

  // ====================================================
  // PRODUCT VARIANTS
  // ====================================================

  const variantGroups =
    product.variantGroups?.map((group) => ({
      id: group.id,
      name: group.name,

      // FIX: Required by VariantGroup type
      showName: group.showName,

      position: group.position,

      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,

        priceAdjustment: Number(
          option.priceAdjustment
        ),

        isDefault: option.isDefault,
        position: option.position,
      })),
    })) ?? [];

  // ====================================================
  // ALGOLIA INDEXING
  // ====================================================

  const siteURL =
    process.env.SITE_URL?.replace(/\/$/, "") ?? "";

  await structuredAlgoliaHtmlData({
    type: "products",

    title: product.title,

    htmlString:
      product.shortDescription ?? "",

    pageUrl:
      `${siteURL}/products/${product.slug}`,

    imageURL: mainImage,

    price: Number(product.price),

    discountedPrice:
      product.discountedPrice != null
        ? Number(product.discountedPrice)
        : null,

    category:
      product.category?.title ?? "",

    id: product.id,

    thumbnails,

    previewImage: mainImage
      ? {
          image: mainImage,
        }
      : null,

    variantGroups,
  });

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Shop",
            href: "/shop",
          },
          {
            label: product.title ?? "",
            href: `/products/${product.slug}`,
          },
        ]}
      />

      <ShopDetails
        product={product as IProductByDetails}
      />

      <RecentlyViewedItems
        products={recentProducts}
      />
    </main>
  );
};

export default ProductDetails;
