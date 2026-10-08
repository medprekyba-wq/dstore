"use server";

import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a review 
export async function createReview(data: {
  name: string;
  email: string;
  comment: string;
  ratings: number;
  productSlug: string;
}) {
  // check if user is authenticated
  const { name, email, comment, ratings, productSlug } = data;

  try {
    // Check if the user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        AND: [
          {
            email,
          },
          {
            productSlug,
          },
        ],
      },
    });

    console.log(existingReview, "existingReview")

    if (existingReview) {
      return errorResponse(400, "You have already reviewed this product");
    }

    // Create a new review if no existing review is found
    const review = await prisma.review.create({
      data: {
        productSlug,
        name,
        email,
        comment,
        ratings,
      },
    });

    revalidateTag("reviews", { expire: 0 });
    return successResponse(200, "Review created successfully", review);
  } catch (err: any) {
    console.error('error creating review', err?.stack || err);
    return errorResponse(500, "Failed to create review");
  }
}

// delete a review 
export async function deleteReview(reviewId: string) {
  // check if user is authenticated
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!reviewId) {
      return errorResponse(400, "Review ID is required");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidateTag("reviews", { expire: 0 });
    return successResponse(200, "Review deleted successfully");
  } catch (err: any) {
    console.error('error deleting review', err?.stack || err);
    return errorResponse(500, "Failed to delete review");
  }
};

// update a review 
export async function updateReview(reviewId: string, data: {
  name: string;
  email: string;
  comment: string;
  ratings: number;
  isApproved: boolean;
  productSlug: string;
}) {
  // check if user is authenticated
  // const session = await authenticate();
  // if (!session) return errorResponse(401, "Unauthorized");
  if (!reviewId) {
    return errorResponse(400, "Review ID is required");
  }

  const { name, email, comment, ratings, isApproved, productSlug } = data;


  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        name,
        email,
        comment,
        ratings,
        isApproved,
        productSlug
      },
    });

    revalidateTag("reviews", { expire: 0 });

    return successResponse(200, "Review updated successfully", updatedReview);
  } catch (err: any) {
    console.error('error updating review', err?.stack || err);
    return errorResponse(500, "Failed to update review");
  }
}