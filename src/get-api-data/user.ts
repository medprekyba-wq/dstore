
import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

export const getSingleUser = async (email: string) => {
  "use cache";
  cacheTag("user");
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

// get users
export const getUsers = async () => {
  "use cache";
  cacheTag("users");
  return await prisma.user.findMany({
    orderBy: { name: "asc" },
  });
};
