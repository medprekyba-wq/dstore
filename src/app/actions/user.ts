"use server";

import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// update user

export async function updateUser(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    const fname = formData.get("firstName") as string;
    const lname = formData.get("lastName") as string;
    const image = formData.get("image") as File;

    // Fetch current user from DB
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) return errorResponse(404, "User not found");

    let newImageUrl = currentUser?.image;

    // Handle image upload if image is provided and it's a new file
    if (image && image instanceof File) {
      if (currentUser.image) {
        // delete previous image from Cloudinary
        await deleteImageFromCloudinary(currentUser.image);
      }
      const uploaded = await uploadImageToCloudinary(image);
      newImageUrl = uploaded;
    }

    const fullName = `${fname} ${lname}`.trim();
    console.log(fullName, 'full name');

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        image: newImageUrl,
      },
    });

    revalidateTag("user", { expire: 0 });

    return successResponse(200, "User updated successfully", user);
  } catch (err: any) {
    console.error("Error updating user:", err?.stack || err);
    return errorResponse(500, "Failed to update user");
  }
}


// delete a user
export async function deleteUser(userId: string) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!userId) return errorResponse(400, "User ID is required");

    // **Check if user exists**
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) return errorResponse(404, "User not found");


    // **Delete user**
    await prisma.user.delete({
      where: { id: userId },
    })
    revalidateTag(`users`, { expire: 0 });
    return successResponse(200, "User deleted successfully");
  } catch (error: any) {
    console.error("Error deleting user:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};