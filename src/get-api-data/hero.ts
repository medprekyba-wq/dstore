import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


// get hero banners
export const getHeroBanners = async () => {
  "use cache";
  cacheTag("heroBanners");
  const heroBanners = await prisma.heroBanner.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      product: {
        select: {
          price: true,
          discountedPrice: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return heroBanners.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: item.product.price.toNumber(),
      discountedPrice: item.product.discountedPrice
        ? item.product.discountedPrice.toNumber()
        : null,
    },
  }));
};

// get hero sliders
export const getHeroSliders = async () => {
  "use cache";
  cacheTag("heroSliders");
  const heroSliders = await prisma.heroSlider.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      product: {
        select: {
          price: true,
          discountedPrice: true,
          title: true,
          slug: true,
          shortDescription: true,
        },
      },
    },
  });

  return heroSliders.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: item.product.price.toNumber(),
      discountedPrice: item.product.discountedPrice
        ? item.product.discountedPrice.toNumber()
        : null,
    },
  }));
};


// single hero banner
export const getSingleHeroBanner = async (id: number) => {
  "use cache";
  cacheTag(`single-hero-banner-${id}`);
  return await prisma.heroBanner.findUnique({
    where: {
      id: id,
    },
  });
};
