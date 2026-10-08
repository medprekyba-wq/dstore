import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all privacy policies
export const getPrivacyPolicies = async () => {
  "use cache";
  cacheTag("privacy-policy");
  return await prisma.privacyPolicy.findMany({
    orderBy: { updatedAt: "desc" },
  });
};
