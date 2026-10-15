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
import type { IProductByDetails } from "@/types/product";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = (
  process.env.SITE_URL || "https://www.diagnostore.com"
).replace(/\/+$/, "");

const PRODUCT_CURRENCY = "USD";

// ======================================================
// TYPES
// ======================================================

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// ======================================================
// HELPERS
// ======================================================

function toAbsoluteUrl(value: string): string {
  return new URL(value, `${SITE_URL}/`).href;
}

function toPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const siteName = (await getSiteName()) ?? "Online Store";

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    toPlainText(product.shortDescription ?? "").slice(0, 160) ||
    `View ${product.title} at ${siteName}.`;

  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;

  const imagePath = product.productImages?.[0]?.image;
  const image = imagePath ? toAbsoluteUrl(imagePath) : "";

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
      locale: "en_US",
      type: "website",

      ...(image
        ? {
            images: [
              {
                url: image,
                alt: product.title || siteName,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${siteName}`,
      description,

      ...(image
        ? {
            images: [image],
          }
        : {}),
    },
  };
}

// ======================================================
// PRODUCT DETAILS PAGE
// ======================================================

export default async function ProductDetails({ params }: Props) {
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

  const mainImage = product.productImages?.[0]?.image ?? "";

  const thumbnails =
    product.productImages?.map((image) => ({
      image: image.image,
    })) ?? [];

  const imageUrls = Array.from(
    new Set(
      (product.productImages ?? [])
        .map((item) => item.image)
        .filter((image): image is string => Boolean(image))
        .map(toAbsoluteUrl)
    )
  );

  // ====================================================
  // PRODUCT VARIANTS
  // ====================================================

  const variantGroups =
    product.variantGroups?.map((group) => ({
      id: group.id,
      name: group.name,
      showName: group.showName,
      position: group.position,

      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,
        priceAdjustment: Number(option.priceAdjustment),
        isDefault: option.isDefault,
        position: option.position,
      })),
    })) ?? [];

  // ====================================================
  // ALGOLIA INDEXING
  // ====================================================

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  await structuredAlgoliaHtmlData({
    type: "products",
    title: product.title,
    htmlString: product.shortDescription ?? "",
    pageUrl: productUrl,
    imageURL: mainImage,
    price: Number(product.price),

    discountedPrice:
      product.discountedPrice != null
        ? Number(product.discountedPrice)
        : null,

    category: product.category?.title ?? "",
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
  // GOOGLE PRODUCT STRUCTURED DATA
  // ====================================================

  const currentPrice = Number(
    product.discountedPrice ?? product.price
  );

  const hasValidPrice =
    Number.isFinite(currentPrice) && currentPrice >= 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,

    name: product.title,
    url: productUrl,

    description:
      toPlainText(product.shortDescription ?? "") ||
      product.title,

    ...(imageUrls.length > 0
      ? {
          image: imageUrls,
        }
      : {}),

    ...(hasValidPrice
      ? {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: PRODUCT_CURRENCY,
            price: currentPrice.toFixed(2),

            availability:
              Number(product.quantity) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",

            itemCondition: "https://schema.org/NewCondition",

            seller: {
              "@type": "Organization",
              name: "DiagnoStore Ltd.",
            },
          },
        }
      : {}),
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main>
      <script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

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

      <ShopDetails product={product as IProductByDetails} />

      <RecentlyViewedItems products={recentProducts} />
    </main>
  );
}