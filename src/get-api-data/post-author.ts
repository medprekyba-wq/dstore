import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";


// get post authors
export const getPostAuthors = async () => {
  "use cache";
  cacheTag("postAuthors");
  return await prisma.postAuthor.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  });
};