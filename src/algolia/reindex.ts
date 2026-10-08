import "server-only";

import { getBlogs } from "@/get-api-data/blog";
import { getAllProducts } from "@/get-api-data/product";
import algoliasearch from "algoliasearch";
import { structuredAlgoliaHtmlData } from "./crawlIndex";

// ======================================================
// ALGOLIA CONFIGURATION
// ======================================================

const appID =
  process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";

const apiKEY =
  process.env.ALGOLIA_WRITE_API_KEY ?? "";

const INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ??
  "products";

// ======================================================
// ALGOLIA CLIENT
// ======================================================

const client =
  appID && apiKEY
    ? algoliasearch(appID, apiKEY)
    : null;

const index = client
  ? client.initIndex(INDEX)
  : null;

// ======================================================
// BUILD CHECK
// ======================================================

const isProductionBuild = () =>
  process.env.NEXT_PHASE ===
  "phase-production-build";

// ======================================================
// REINDEX PRODUCTS AND BLOGS
// ======================================================

export const reindexAllProducts = async () => {
  if (isProductionBuild()) {
    console.log(
      "Skipping Algolia indexing during production build.",
    );
    return {
      success: false,
      indexed: 0,
    };
  }

  if (!index) {
    console.warn(
      "Algolia credentials are missing. Reindex skipped.",
    );

    return {
      success: false,
      indexed: 0,
    };
  }

  try {
    // ----------------------------------------------
    // FETCH PRODUCTS AND BLOGS
    // ----------------------------------------------

    const products = await getAllProducts();
    const blogs = await getBlogs();

    console.log(
      `Found ${products.length} products and ${blogs.length} blogs`,
    );

    // ----------------------------------------------
    // CLEAR EXISTING ALGOLIA INDEX
    // ----------------------------------------------

    console.log("Clearing Algolia index...");

    await index.clearObjects();

    console.log("Index cleared successfully");

    let indexed = 0;

    // ----------------------------------------------
    // INDEX PRODUCTS
    // ----------------------------------------------

    for (const product of products) {
      console.log(
        `Indexing product: ${product.title}`,
      );

      const mainImage =
        product.productImages?.[0]?.image ?? "";

      const thumbnails =
        product.productImages?.map((image) => ({
          image: image.image,
        })) ?? [];

      const result =
        await structuredAlgoliaHtmlData({
          type: "products",

          title: product.title ?? "",

          htmlString:
            product.shortDescription ?? "",

          pageUrl:
            `${process.env.SITE_URL ?? ""}/products/${product.slug}`,

          imageURL: mainImage,

          price: Number(product.price) || 0,

          discountedPrice:
            product.discountedPrice != null
              ? Number(product.discountedPrice)
              : null,

          reviews: Number(product.reviews ?? 0),

          id: product.id ?? "",

          thumbnails,

          previewImage: mainImage
            ? { image: mainImage }
            : null,
        });

      if (result) {
        indexed++;
      }
    }

    // ----------------------------------------------
    // INDEX BLOGS
    // ----------------------------------------------

    for (const blog of blogs) {
      console.log(
        `Indexing blog: ${blog.title}`,
      );

      const result =
        await structuredAlgoliaHtmlData({
          type: "blogs",

          title: blog.title ?? "",

          htmlString: blog.metadata ?? "",

          pageUrl:
            `${process.env.SITE_URL ?? ""}/blog/${blog.slug}`,

          imageURL: blog.mainImage ?? "",
        });

      if (result) {
        indexed++;
      }
    }

    console.log(
      `Re-indexing complete. ${indexed} records indexed.`,
    );

    return {
      success:
        indexed === products.length + blogs.length,
      indexed,
    };
  } catch (error) {
    console.error(
      "Error during Algolia re-indexing:",
      error,
    );

    return {
      success: false,
      indexed: 0,
    };
  }
};
