import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

export const getReviews = async (productSlug: string) => {
  "use cache";
  cacheTag("reviews");
  const reviews = await prisma.review.findMany({
    where: {
      AND: [
        {
          productSlug: productSlug,
        },
        {
          isApproved: true,
        },
      ],
    },
  });
  return {
    reviews,
    avgRating:
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review?.ratings, 0) /
          reviews.length
        : 0,
    totalRating: reviews.length,
  };
};


