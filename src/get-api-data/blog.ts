import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all blogs
export const getBlogs = async () => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });
};


// GET POST CATEGORY
export const getPostCategory = async () => {
  "use cache";
  cacheTag("postCategories");
  const postCategories = await prisma.postCategory.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
  return postCategories.map((item) => ({
    ...item,
    postCounts: item._count.posts,
  }));
};

// GET POST TAGS
export const getPostTags = async () => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findMany({
    select: {
      tags: true,
    },
  });
};

// GET SINGLE BLOG
export const getSingleBlog = async (slug: string) => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findUnique({
    where: {
      slug: slug,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
};

// GET POSTS BY CATEGORY
export const getPostsByCategory = async (slug: string) => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findMany({
    where: {
      category: {
        slug: slug,
      },
    },
  });
};

// GET CATEGORY BY SLUG
export const getPostCategoryBySlug = async (slug: string) => {
  "use cache";
  cacheTag("postCategories");
  return await prisma.postCategory.findUnique({
    where: {
      slug: slug,
    },
  });
};

// GET POST CATEGORIES
export const getPostCategories = async () => {
  "use cache";
  cacheTag("postCategories");
  return await prisma.postCategory.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

// GET POST BY TAG
export const getPostsByTag = async (slug: string) => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findMany({
    where: {
      tags: {
        has: slug,
      },
    },
  });
};
