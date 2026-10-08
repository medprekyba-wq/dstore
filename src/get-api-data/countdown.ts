import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


export const getCountdowns = async () => {
  "use cache";
  cacheTag("countdowns");
  return await prisma.countdown.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      product: {
        select: {
          title: true,
        },
      },
    },
  });
};