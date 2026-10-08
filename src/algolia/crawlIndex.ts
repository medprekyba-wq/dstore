import "server-only";

import { getAllProducts } from "@/get-api-data/product";
import algoliasearch from "algoliasearch";

// ======================================================
// ALGOLIA CONFIGURATION
// ======================================================

const appID =
  process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";

const apiKEY =
  process.env.ALGOLIA_WRITE_API_KEY ?? "";

const indexName =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ??
  "products";

// ======================================================
// TYPES
// ======================================================

type ProductThumbnail = {
  image: string;
};

type PreviewImage = {
  image: string;
};

type VariantOption = {
  id: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  position: number;
};

type VariantGroup = {
  id: string;
  name: string;
  showName: boolean;
  position: number;
  options: VariantOption[];
};

type StructuredAlgoliaHtmlDataProps = {
  pageUrl?: string;
  htmlString?: string;
  title?: string;
  type?: string;
  imageURL?: string;

  price?: number;
  discountedPrice?: number | null;

  reviews?: number;
  category?: string;

  variantGroups?: VariantGroup[];

  id?: string;
  tags?: string[];

  description?: string | string[];

  thumbnails?: ProductThumbnail[];
  previewImage?: PreviewImage | null;

  additionalInformation?: unknown;
  customAttributes?: unknown;

  status?: boolean;
  offers?: string[];
  updatedAt?: string;
};

type ProductData = Awaited<
  ReturnType<typeof getAllProducts>
>[number];

type OptionalProductFields = {
  category?: {
    title?: string | null;
  } | null;

  tags?: string[] | null;

  description?: string | string[] | null;

  additionalInformation?: unknown;
  customAttributes?: unknown;

  offers?: string[] | null;
  status?: boolean | null;

  updatedAt?: Date | string | null;
};

// ======================================================
// ALGOLIA CLIENT
// ======================================================

const client =
  appID && apiKEY
    ? algoliasearch(appID, apiKEY)
    : null;

const index = client
  ? client.initIndex(indexName)
  : null;

// ======================================================
// HELPERS
// ======================================================

function isProductionBuild() {
  return (
    process.env.NEXT_PHASE ===
    "phase-production-build"
  );
}

function getOptionalFields(
  product: ProductData,
): OptionalProductFields {
  return product as ProductData &
    OptionalProductFields;
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function normalizeDescription(
  value: unknown,
): string | string[] {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return normalizeStringArray(value);
  }

  return "";
}

function normalizeDate(
  value: unknown,
): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date(0).toISOString();
}

// ======================================================
// ADD / UPDATE ALGOLIA RECORD
// ======================================================

async function addToAlgolia(
  data: Record<string, unknown>,
): Promise<boolean> {
  if (!index || isProductionBuild()) {
    return false;
  }

  try {
    await index.saveObject(data);
    return true;
  } catch (error) {
    console.error(
      "Error saving Algolia record:",
      error,
    );

    return false;
  }
}

// ======================================================
// STRUCTURED ALGOLIA DATA
// ======================================================

export const structuredAlgoliaHtmlData = async ({
  pageUrl = "",
  htmlString = "",
  title = "",
  type = "",
  imageURL = "",
  price = 0,
  discountedPrice = null,
  reviews = 0,
  category = "",
  variantGroups = [],
  id = "",
  tags = [],
  description = [],
  thumbnails = [],
  previewImage = null,
  additionalInformation = {},
  customAttributes = {},
  status = true,
  offers = [],
  updatedAt = "",
}: StructuredAlgoliaHtmlDataProps) => {
  if (isProductionBuild()) {
    return null;
  }

  try {
    const plainText = htmlString
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const data = {
      objectID: pageUrl || id,

      id,
      name: title,
      url: pageUrl,

      shortDescription:
        plainText.slice(0, 7000),

      type,
      imageURL,

      updatedAt:
        updatedAt || new Date(0).toISOString(),

      price,
      discountedPrice,
      reviews,
      category,
      variantGroups,
      tags,
      thumbnails,
      previewImage,
      additionalInformation,
      customAttributes,
      status,
      offers,
      description,
    };

    const saved = await addToAlgolia(data);

    return saved ? data : null;
  } catch (error) {
    console.error(
      "Error in structuredAlgoliaHtmlData:",
      error,
    );

    return null;
  }
};

// ======================================================
// REINDEX ALL PRODUCTS
// ======================================================

export async function reindexAllProducts() {
  if (!index || isProductionBuild()) {
    console.warn(
      "Algolia credentials unavailable or production build in progress.",
    );

    return {
      success: false,
      indexed: 0,
    };
  }

  try {
    const products = await getAllProducts();

    let indexed = 0;

    for (const product of products) {
      const optional = getOptionalFields(product);

      // ----------------------------------------------
      // PRODUCT IMAGES
      // ----------------------------------------------

      const productImages =
        product.productImages ?? [];

      const mainImage =
        productImages[0]?.image ?? "";

      const thumbnails =
        productImages.map((image) => ({
          image: image.image,
        }));

      // ----------------------------------------------
      // PRODUCT VARIANTS
      // ----------------------------------------------

      const variantGroups =
        product.variantGroups?.map((group) => ({
          id: group.id,
          name: group.name,
          showName: group.showName,
          position: group.position,

          options:
            group.options?.map((option) => ({
              id: option.id,
              name: option.name,

              priceAdjustment:
                Number(
                  option.priceAdjustment,
                ),

              isDefault:
                option.isDefault,

              position:
                option.position,
            })) ?? [],
        })) ?? [];

      // ----------------------------------------------
      // OPTIONAL PRODUCT DATA
      // ----------------------------------------------

      const category =
        optional.category?.title ?? "";

      const tags =
        normalizeStringArray(optional.tags);

      const description =
        normalizeDescription(
          optional.description,
        );

      const offers =
        normalizeStringArray(
          optional.offers,
        );

      const additionalInformation =
        optional.additionalInformation ?? [];

      const customAttributes =
        optional.customAttributes ?? [];

      const status =
        optional.status ?? true;

      const updatedAt =
        normalizeDate(
          optional.updatedAt,
        );

      // ----------------------------------------------
      // PRODUCT URL
      // ----------------------------------------------

      const pageUrl =
        `/products/${product.slug}`;

      // ----------------------------------------------
      // INDEX PRODUCT
      // ----------------------------------------------

      const result =
        await structuredAlgoliaHtmlData({
          pageUrl,

          htmlString:
            product.shortDescription ?? "",

          title:
            product.title ?? "",

          type: "product",

          imageURL:
            mainImage,

          price:
            Number(product.price),

          discountedPrice:
            product.discountedPrice != null
              ? Number(
                  product.discountedPrice,
                )
              : null,

          reviews:
            Number(product.reviews ?? 0),

          category,
          variantGroups,

          id:
            product.id,

          tags,
          description,
          thumbnails,

          previewImage:
            mainImage
              ? { image: mainImage }
              : null,

          additionalInformation,
          customAttributes,
          status,
          offers,
          updatedAt,
        });

      if (result) {
        indexed++;
      }
    }

    return {
      success:
        indexed === products.length,

      indexed,
    };
  } catch (error) {
    console.error(
      "Error reindexing Algolia products:",
      error,
    );

    return {
      success: false,
      indexed: 0,
    };
  }
}
