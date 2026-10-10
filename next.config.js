const { PrismaClient } = require("@prisma/client");

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  redirects: async () => {
    const prisma = new PrismaClient();

    try {
      const products = await prisma.product.findMany({
        select: { slug: true },
      });

      // Existing application pages take priority.
      const reservedSlugs = new Set([
        "admin",
        "products",
        "shop",
        "blog",
        "login",
        "register",
        "checkout",
        "cart",
        "account",
        "about",
        "contact",
        "api",
      ]);

      return [
        {
          source: "/admin",
          destination: "/admin/dashboard",
          permanent: true,
        },
        {
          source: "/products",
          destination: "/shop",
          permanent: true,
        },
        {
          source: "/blog/categories",
          destination: "/blog",
          permanent: true,
        },
        {
          source: "/blog/tags",
          destination: "/blog",
          permanent: true,
        },
        ...products
          .filter(({ slug }) => !reservedSlugs.has(slug))
          .map(({ slug }) => ({
            source: `/${slug}`,
            destination: `/products/${slug}`,
            permanent: true,
          })),
      ];
    } finally {
      await prisma.$disconnect();
    }
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

module.exports = nextConfig;