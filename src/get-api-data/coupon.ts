import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


// get coupons

export const getCoupons = async () => {
  "use cache";
  cacheTag("coupons");
  return await prisma.coupon.findMany({
    orderBy: { updatedAt: "desc" },
  });
};


export const getSingleCoupon = async (couponId: string) => {
  "use cache";
  cacheTag(`coupon-${couponId}`);
  return await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },
  });
};
