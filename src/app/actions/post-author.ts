"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a post author
export async function createPostAuthor(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const bio = formData.get("bio") as string | undefined;
    const description = formData.get("description") as string | undefined;

    if (!name || !slug || !file) {
      return errorResponse(400, "Name, slug and image fields are required");
    }

    // Check if the post-author already exists (case-insensitive)
    const existingPostAuthor = await prisma.postAuthor.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
      },
    });

    if (existingPostAuthor) {
      return errorResponse(400, "Post Author slug already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file);

    // Save post-author to database
    const postAuthorItem = await prisma.postAuthor.create({
      data: {
        name,
        slug,
        image: imageUrl,
        bio,
        description,
      },
    });

    if (!postAuthorItem) {
      return errorResponse(500, "Failed to create post author");
    }

    revalidateTag("postAuthors", { expire: 0 });
    return successResponse(200, "Post author created successfully");
  } catch (error: any) {
    console.error("Error creating post-author:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// update post author
export async function updatePostAuthor(postAuthorId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");


    if (!postAuthorId) {
      return errorResponse(400, "Post Author ID is required");
    }

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const bio = formData.get("bio") as string | undefined;
    const description = formData.get("description") as string | undefined;

    if (!name || !slug || !file) {
      return errorResponse(400, "Name, slug and image fields are required");
    }

    // **Find the existing postAuthorItem**
    const postAuthorItem = await prisma.postAuthor.findUnique({
      where: { id: postAuthorId },
    });

    if (!postAuthorItem) {
      return errorResponse(404, "Post author not found");
    }

    let imageUrl = postAuthorItem?.image; // Default to existing image

    if (file) {
      if (file instanceof File) {
        // **Delete old image only if it exists**
        if (postAuthorItem.image) {
          try {
            await deleteImageFromCloudinary(postAuthorItem.image);
          } catch (err) {
            console.error("Error deleting old image from Cloudinary:", err);
          }
        }

        // **Upload new image**
        imageUrl = await uploadImageToCloudinary(file, "post-author");
      }
    }

    // **Update post-author in database**
    const updatedPostAuthor = await prisma.postAuthor.update({
      where: { id: postAuthorId },
      data: {
        name,
        slug,
        image: imageUrl,
        bio,
        description,
      },
    });

    revalidateTag("postAuthors", { expire: 0 });

    return successResponse(200, "Post Author updated successfully", updatedPostAuthor);
  } catch (error: any) {
    console.error("Error updating post-author:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// delete post author
export async function deletePostAuthor(postAuthorId: number) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!postAuthorId) {
      return errorResponse(400, "Post author ID is required");
    }

    // **Find the existing postAuthorItem**
    const postAuthorItem = await prisma.postAuthor.findUnique({
      where: { id: postAuthorId },
    });

    if (!postAuthorItem) {
      return errorResponse(404, "Post author not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(postAuthorItem.image);

    // Delete Post author from database
    await prisma.postAuthor.delete({ where: { id: postAuthorId } });

    revalidateTag("postAuthors", { expire: 0 });
    return successResponse(200, "Post author deleted successfully");
  } catch (error: any) {
    console.error("Error deleting post author:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}