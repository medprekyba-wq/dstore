import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


// ======================================================
// GET ALL CATEGORIES
// ======================================================

export const getCategories = async () => {
  "use cache";

  cacheTag("categories");

  return await prisma.category.findMany({
    orderBy: [
      {
        parentId: "asc",
      },
      {
        title: "asc",
      },
    ],

    include: {
      // Parent category
      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,
        },
      },

      // Direct children
      children: {
        orderBy: {
          title: "asc",
        },

        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          img: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,

          // Level 3 children
          children: {
            orderBy: {
              title: "asc",
            },

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
          },
        },
      },
    },
  });
};


// ======================================================
// GET CATEGORY BY SLUG
// ======================================================

export const getCategoryBySlug = async (
  slug: string
) => {
  "use cache";

  cacheTag("categories");

  return await prisma.category.findUnique({
    where: {
      slug,
    },

    include: {
      // Parent category
      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,

          // Parent's parent
          parent: {
            select: {
              id: true,
              title: true,
              slug: true,
              parentId: true,
            },
          },
        },
      },

      // Direct children
      children: {
        orderBy: {
          title: "asc",
        },

        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          img: true,
          parentId: true,

          // Level 3
          children: {
            orderBy: {
              title: "asc",
            },

            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              img: true,
              parentId: true,
            },
          },
        },
      },
    },
  });
};


// ======================================================
// GET CATEGORY BY ID
// ======================================================

export const getCategoryById = async (
  id: number
) => {
  "use cache";

  cacheTag("categories");

  return await prisma.category.findUnique({
    where: {
      id,
    },

    include: {
      // Parent category
      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,

          // Parent's parent
          parent: {
            select: {
              id: true,
              title: true,
              slug: true,
              parentId: true,
            },
          },
        },
      },

      // Direct children
      children: {
        orderBy: {
          title: "asc",
        },

        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          img: true,
          parentId: true,

          // Level 3 children
          children: {
            orderBy: {
              title: "asc",
            },

            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              img: true,
              parentId: true,
            },
          },
        },
      },
    },
  });
};