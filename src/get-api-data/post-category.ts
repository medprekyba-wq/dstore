import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


// get post authors
export const getPostCategory = async () => {
  "use cache";
  cacheTag("postCategories");
  return await prisma.postCategory.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      img: true,
    },
  });
};