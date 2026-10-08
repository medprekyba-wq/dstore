import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prismaDB";

const BASE_URL = "https://www.diagnostore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const productUrls: MetadataRoute.Sitemap = products.map(
    (product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const categoryUrls: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [
    ...staticUrls,
    ...categoryUrls,
    ...productUrls,
  ];
}
