import { prisma } from "@/lib/prismaDB";
import { cacheLife, cacheTag } from "next/cache";

// get all privacy policies
export const getTermsConditions = async () => {
  "use cache";
  cacheLife("weeks")
  cacheTag("terms-condition");
  return await prisma.termsConditions.findMany({
    orderBy: { updatedAt: "desc" },
  });
};
