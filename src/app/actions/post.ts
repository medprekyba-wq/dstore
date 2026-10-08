"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a post author
export async function createPost(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const metadata = formData.get("metadata") as string | undefined;
    const authorId = formData.get("authorId") as string;
    const categoryId = formData.get("categoryId") as string;
    const file = formData.get("mainImage") as File;
    const tags = JSON.parse(formData.get("tags") as string || "[]");
    const body = formData.get("body") as string;

    if (!title || !slug || !authorId || !categoryId || !file || !body) {
      return errorResponse(400, "Missing required fields");
    }

    // Check if the post-author already exists (case-insensitive)
    const existingPost = await prisma.post.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
      },
    });

    if (existingPost) {
      return errorResponse(400, "Post slug already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file);

    // Save post to database
    const postItem = await prisma.post.create({
      data: {
        title,
        slug,
        metadata,
        authorId: parseInt(authorId),
        categoryId: parseInt(categoryId),
        mainImage: imageUrl,
        tags,
        body,
      },
    });

    if (!postItem) {
      return errorResponse(500, "Failed to create post");
    }

    revalidateTag("posts", { expire: 0 });
    return successResponse(200, "Post created successfully");
  } catch (error: any) {
    console.error("Error creating post:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// delete a post
export async function deletePost(postId: string) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    // **Find the existing postItem**
    const postItem = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postItem) {
      return errorResponse(404, "Post not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(postItem.mainImage);

    // Delete Post from database
    await prisma.post.delete({ where: { id: postId } });

    revalidateTag("posts", { expire: 0 });
    return successResponse(200, "Post deleted successfully");
  } catch (error: any) {
    console.error("Error deleting post:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// update a post
export async function updatePost(postId: string, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const metadata = formData.get("metadata") as string | undefined;
    const authorId = formData.get("authorId") as string;
    const categoryId = formData.get("categoryId") as string;
    const file = formData.get("mainImage") as File;
    const tags = JSON.parse(formData.get("tags") as string || "[]");
    const body = formData.get("body") as string;

    if (!title || !slug || !authorId || !categoryId || !file || !body) {
      return errorResponse(400, "Missing required fields");
    }

    // **Find the existing postItem**
    const postItem = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postItem) {
      return errorResponse(404, "Post not found");
    }

    let imageUrl = postItem.mainImage; // Default to existing image

    if (file) {
      if (file instanceof File) {
        // **Delete old image only if it exists**
        if (postItem.mainImage) {
          try {
            await deleteImageFromCloudinary(postItem.mainImage);
          } catch (err) {
            console.error("Error deleting old image from Cloudinary:", err);
          }
        }

        // **Upload new image**
        imageUrl = await uploadImageToCloudinary(file, "posts");
      }
    }

    // **Update post in database**
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        metadata,
        authorId: parseInt(authorId),
        categoryId: parseInt(categoryId),
        mainImage: imageUrl,
        tags,
        body,
      },
    });

    revalidateTag("posts", { expire: 0 });

    return successResponse(200, "Post updated successfully", updatedPost);
  } catch (error: any) {
    console.error("Error updating post:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}
