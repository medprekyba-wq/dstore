import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all header settings
export const getHeaderSettings = async () => {
  "use cache";
  cacheTag("header-setting");
  return await prisma.headerSetting.findFirst();
};
