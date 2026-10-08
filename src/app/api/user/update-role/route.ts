import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { authenticate } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  // check if user is authenticated
  const session = await authenticate();
  if (!session) return sendErrorResponse(401, "Unauthorized");

  try {
    const { userId, role } = await req.json();
    if (!userId || !["ADMIN", "USER"].includes(role)) {
      return sendErrorResponse(400, "Missing Fields");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidateTag("users", { expire: 0 });
    return sendSuccessResponse(200, "Role updated successfully");
  } catch (error: any) {
    console.log("Error updating role:", error?.stack || error);
    return sendErrorResponse(500, "Internal Server Error");
  }
}
