"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create post category
export async function createPostCategory(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File | undefined;
    const description = formData.get("description") as string | undefined;

    if (!title || !slug) {
      return errorResponse(400, "Title and slug fields are required");
    }

    // Check if the post-category title already exists (case-insensitive)
    const existingPostCategory = await prisma.postCategory.findFirst({
      where: {
        OR: [
          {
            title: {
              equals: title,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: slug,
              mode: "insensitive",
            },
          },
        ]
      },
    });

    if (existingPostCategory) {
      return errorResponse(400, "Post Category title or slug already exists");
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImageToCloudinary(file);
    }

    // Save post-category to database
    const postCategoryItem = await prisma.postCategory.create({
      data: {
        title,
        slug,
        description,
        img: imageUrl
      },
    });
    revalidateTag("postCategories", { expire: 0 });
    return successResponse(201, "Post Category created successfully", postCategoryItem);
  } catch (error: any) {
    console.error("Error creating post-category:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// update post category
export async function updatePostCategory(postCategoryId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!postCategoryId) {
      return errorResponse(400, "Post Category ID is required");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File | undefined;
    const description = formData.get("description") as string | undefined;

    if (!title || !slug) {
      return errorResponse(400, "Title and slug fields are required");
    }

    // **Find the existing postCategoryItem**
    const postCategoryItem = await prisma.postCategory.findUnique({
      where: { id: Number(postCategoryId) },
    });

    if (!postCategoryItem) {
      return errorResponse(404, "Post category not found");
    }

    let imageUrl = postCategoryItem?.img; // Default to existing image

    if (file) {
      if (file instanceof File) {
        // **Delete old image only if it exists**
        if (postCategoryItem.img) {
          try {
            await deleteImageFromCloudinary(postCategoryItem.img);
          } catch (err) {
            console.error("Error deleting old image from Cloudinary:", err);
          }
        }

        // **Upload new image**
        imageUrl = await uploadImageToCloudinary(file, "post-category");
      }
    }

    // **Update post-category in database**
    const updatedPostCategory = await prisma.postCategory.update({
      where: { id: Number(postCategoryId) },
      data: {
        title,
        slug,
        description,
        img: imageUrl,
      },
    });

    revalidateTag("postCategories", { expire: 0 });

    return successResponse(200, "post-category updated successfully", updatedPostCategory);
  } catch (error: any) {
    console.error("Error updating post-category:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// delete post category
export async function deletePostCategory(id: number) {
  try {
    await prisma.postCategory.delete({
      where: {
        id: id,
      }
    });
    revalidateTag('postCategories', { expire: 0 });
    return successResponse(200, "Post category deleted successfully");
  } catch (error: any) {
    console.log(error?.stack || error, 'error deleting post category');
    return errorResponse(500, error?.message || "Failed to delete post category");
  }
}