import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";
import { cacheTag } from "next/cache";

// ======================================================
// SHARED PRISMA SELECTS
// ======================================================

const variantGroupsSelect = {
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
} satisfies Prisma.Product$variantGroupsArgs;

const productListSelect = {
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
  variantGroups: variantGroupsSelect,
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
} satisfies Prisma.ProductSelect;

type VariantGroupWithOptions = {
  id: string;
  name: string;
  showName: boolean;
  position: number;
  options: {
    id: string;
    name: string;
    priceAdjustment: Prisma.Decimal;
    isDefault: boolean;
    position: number;
  }[];
};

const serializeVariantGroups = (
  variantGroups: VariantGroupWithOptions[]
) =>
  variantGroups.map((group) => ({
    ...group,
    options: group.options.map((option) => ({
      ...option,
      priceAdjustment: option.priceAdjustment.toNumber(),
    })),
  }));

type ProductWithReviewCount = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

function serializeListProduct<
  T extends ProductWithReviewCount
>(product: T) {
  const { _count, ...item } = product;

  return {
    ...item,
    reviews: _count.reviews,
    price: item.price.toNumber(),
    discountedPrice:
      item.discountedPrice != null
        ? item.discountedPrice.toNumber()
        : null,
    variantGroups: serializeVariantGroups(
      item.variantGroups
    ),
  };
}

// ======================================================
// GET PRODUCT ID AND TITLE
// ======================================================

export const getProductsIdAndTitle = async () => {
  "use cache";

  cacheTag("products");

  return prisma.product.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });
};

// ======================================================
// GET NEW ARRIVALS
// ======================================================

export const getNewArrivalsProduct = async () => {
  "use cache";

  cacheTag("products");

  const products = await prisma.product.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: productListSelect,
    take: 8,
  });

  return products.map(serializeListProduct);
};

// ======================================================
// GET BEST SELLING PRODUCTS
// ======================================================

export const getBestSellingProducts = async () => {
  "use cache";

  cacheTag("products");

  const products = await prisma.product.findMany({
    select: productListSelect,
    orderBy: {
      reviews: {
        _count: "desc",
      },
    },
    take: 6,
  });

  return products.map(serializeListProduct);
};

// ======================================================
// GET LATEST PRODUCTS
// ======================================================

export const getLatestProducts = async () => {
  "use cache";

  cacheTag("products");

  const products = await prisma.product.findMany({
    select: productListSelect,
    orderBy: [
      {
        reviews: {
          _count: "desc",
        },
      },
      {
        updatedAt: "desc",
      },
    ],
    take: 3,
  });

  return products.map(serializeListProduct);
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getAllProducts = async (
  orderBy:
    | { updatedAt?: Prisma.SortOrder }
    | {
        reviews: {
          _count: Prisma.SortOrder;
        };
      } = {
    updatedAt: "desc",
  }
) => {
  "use cache";

  cacheTag("products");

  const products = await prisma.product.findMany({
    orderBy,
    select: {
      ...productListSelect,
      tags: true,
      category: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return products.map(serializeListProduct);
};

// ======================================================
// GET PRODUCT BY SLUG
// ======================================================

export const getProductBySlug = async (
  slug: string
) => {
  "use cache";

  cacheTag("products");

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      description: true,
      price: true,
      discountedPrice: true,
      slug: true,
      quantity: true,
      updatedAt: true,
      manufacturer: true,
      features: true,

      category: {
        select: {
          title: true,
          slug: true,
        },
      },

      variantGroups: variantGroupsSelect,

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

      additionalInformation: {
        select: {
          name: true,
          description: true,
        },
      },

      customAttributes: {
        select: {
          attributeName: true,
          attributeValues: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },

      body: true,

      reviews: {
        select: {
          name: true,
          comment: true,
          email: true,
          ratings: true,
        },
      },

      tags: true,
      offers: true,
      sku: true,
    },
  });

  if (!product) {
    return null;
  }

  const { _count, ...item } = product;

  return {
    ...item,
    price: item.price.toNumber(),
    discountedPrice:
      item.discountedPrice != null
        ? item.discountedPrice.toNumber()
        : null,
    variantGroups: serializeVariantGroups(
      item.variantGroups
    ),
    reviews: _count.reviews,
  };
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductById = async (
  productId: string
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      variantGroups: {
        orderBy: {
          position: "asc",
        },
        include: {
          options: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },

      productImages: true,

      additionalInformation: {
        select: {
          name: true,
          description: true,
        },
      },

      customAttributes: {
        select: {
          attributeName: true,
          attributeValues: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    price: product.price.toNumber(),
    discountedPrice:
      product.discountedPrice != null
        ? product.discountedPrice.toNumber()
        : null,
    variantGroups: serializeVariantGroups(
      product.variantGroups
    ),
  };
};

// ======================================================
// GET RELATED PRODUCTS
// ======================================================

export const getRelatedProducts = async (
  category: string,
  tags: string[] | undefined,
  currentProductId: string,
  productTitle: string
) => {
  "use cache";

  cacheTag("products");

  const relatedConditions: Prisma.ProductWhereInput[] =
    [];

  if (category.trim()) {
    relatedConditions.push({
      category: {
        title: {
          contains: category.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  if (tags?.length) {
    relatedConditions.push({
      tags: {
        hasSome: tags,
      },
    });
  }

  if (productTitle.trim()) {
    relatedConditions.push({
      title: {
        contains: productTitle.trim(),
        mode: "insensitive",
      },
    });
  }

  if (relatedConditions.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    select: {
      ...productListSelect,
      tags: true,
      category: {
        select: {
          title: true,
        },
      },
    },

    where: {
      id: {
        not: currentProductId,
      },
      OR: relatedConditions,
    },

    orderBy: {
      updatedAt: "desc",
    },

    take: 8,
  });

  return products.map(serializeListProduct);
};

// ======================================================
// CATEGORY HIERARCHY HELPERS
// ======================================================

type CategoryTreeItem = {
  id: number;
  parentId: number | null;
};

function collectCategoryAndDescendantIds(
  categoryId: number,
  categories: CategoryTreeItem[]
): number[] {
  const ids = new Set<number>();

  const collect = (id: number) => {
    if (ids.has(id)) {
      return;
    }

    ids.add(id);

    const children = categories.filter(
      (category) => category.parentId === id
    );

    children.forEach((child) => {
      collect(child.id);
    });
  };

  collect(categoryId);

  return Array.from(ids);
}

function getCategoryProductCount(
  categoryId: number,
  categories: CategoryTreeItem[],
  directProductCounts: Map<number, number>
): number {
  const categoryIds =
    collectCategoryAndDescendantIds(
      categoryId,
      categories
    );

  return categoryIds.reduce(
    (total, id) =>
      total + (directProductCounts.get(id) ?? 0),
    0
  );
}

// ======================================================
// GET SHOP DATA
// ======================================================

export const getShopData = async (params: {
  category?: string;
  sizes?: string;
  colors?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}) => {
  "use cache";

  cacheTag("products", "categories");

  const {
    category,
    sizes,
    colors,
    minPrice,
    maxPrice,
    sort,
  } = params;

  // ====================================================
  // LOAD CATEGORY HIERARCHY
  // ====================================================

  const allCategories =
    await prisma.category.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        img: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        title: "asc",
      },
    });

  // ====================================================
  // SELECTED CATEGORIES AND DESCENDANTS
  // ====================================================

  const categorySlugs =
    category
      ?.split(",")
      .map((slug) => slug.trim())
      .filter(Boolean) ?? [];

  const selectedCategories =
    categorySlugs.length > 0
      ? allCategories.filter((categoryItem) =>
          categorySlugs.includes(
            categoryItem.slug
          )
        )
      : [];

  const categoryIds = Array.from(
    new Set(
      selectedCategories.flatMap(
        (selectedCategory) =>
          collectCategoryAndDescendantIds(
            selectedCategory.id,
            allCategories
          )
      )
    )
  );

  // ====================================================
  // SIZE AND COLOR FILTERS
  // ====================================================

  const selectedSizes =
    sizes
      ?.split(",")
      .map((size) => size.trim())
      .filter(Boolean) ?? [];

  const selectedColors =
    colors
      ?.split(",")
      .map((color) => color.trim())
      .filter(Boolean) ?? [];

  // ====================================================
  // PRODUCT WHERE CLAUSE
  // ====================================================

  const whereClause: Prisma.ProductWhereInput = {};

  if (categoryIds.length > 0) {
    whereClause.categoryId = {
      in: categoryIds,
    };
  } else if (categorySlugs.length > 0) {
    // Prevent an unknown category from showing
    // all products.
    whereClause.categoryId = {
      in: [],
    };
  }

  const variantFilters:
    Prisma.ProductWhereInput[] = [];

  if (selectedSizes.length > 0) {
    variantFilters.push({
      variantGroups: {
        some: {
          name: {
            equals: "Size",
            mode: "insensitive",
          },
          options: {
            some: {
              name: {
                in: selectedSizes,
              },
            },
          },
        },
      },
    });
  }

  if (selectedColors.length > 0) {
    variantFilters.push({
      variantGroups: {
        some: {
          name: {
            equals: "Color",
            mode: "insensitive",
          },
          options: {
            some: {
              name: {
                in: selectedColors,
              },
            },
          },
        },
      },
    });
  }

  if (variantFilters.length > 0) {
    whereClause.AND = variantFilters;
  }

  // ====================================================
  // PRICE FILTERS
  // ====================================================

  const minimumPrice =
    minPrice?.trim() !== undefined &&
    minPrice.trim() !== ""
      ? Number(minPrice)
      : undefined;

  const maximumPrice =
    maxPrice?.trim() !== undefined &&
    maxPrice.trim() !== ""
      ? Number(maxPrice)
      : undefined;

  if (
    (minimumPrice !== undefined &&
      Number.isFinite(minimumPrice)) ||
    (maximumPrice !== undefined &&
      Number.isFinite(maximumPrice))
  ) {
    whereClause.price = {
      gte:
        minimumPrice !== undefined &&
        Number.isFinite(minimumPrice)
          ? minimumPrice
          : undefined,

      lte:
        maximumPrice !== undefined &&
        Number.isFinite(maximumPrice)
          ? maximumPrice
          : undefined,
    };
  }

  // ====================================================
  // SORTING
  // ====================================================

  let productOrderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] = {
    createdAt: "desc",
  };

  if (sort === "popular") {
    productOrderBy = {
      reviews: {
        _count: "desc",
      },
    };
  }

  // ====================================================
  // LOAD PRODUCTS AND SHOP STATISTICS
  // ====================================================

  const [
    products,
    allProductsCount,
    highestPrice,
    categoryProductCounts,
  ] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: productOrderBy,
      select: productListSelect,
    }),

    prisma.product.count(),

    prisma.product.aggregate({
      _max: {
        price: true,
      },
    }),

    prisma.product.groupBy({
      by: ["categoryId"],
      _count: {
        id: true,
      },
    }),
  ]);

  // ====================================================
  // FORMAT PRODUCTS
  // ====================================================

  const transformedProducts = products.map(
    serializeListProduct
  );

  // ====================================================
  // DIRECT CATEGORY PRODUCT COUNTS
  // ====================================================

  const directProductCounts =
    new Map<number, number>();

  categoryProductCounts.forEach((item) => {
    if (item.categoryId !== null) {
      directProductCounts.set(
        item.categoryId,
        item._count.id
      );
    }
  });

  // ====================================================
  // CATEGORIES WITH DESCENDANT PRODUCT COUNTS
  // ====================================================

  const categories = allCategories.map(
    (categoryItem) => ({
      ...categoryItem,

      directProductCount:
        directProductCounts.get(
          categoryItem.id
        ) ?? 0,

      productCount: getCategoryProductCount(
        categoryItem.id,
        allCategories,
        directProductCounts
      ),
    })
  );

  // ====================================================
  // RETURN SHOP DATA
  // ====================================================

  return {
    products: transformedProducts,
    categories,
    allProductsCount,
    highestPrice:
      highestPrice._max.price?.toNumber() ?? 0,
  };
};