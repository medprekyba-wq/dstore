import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { authenticate } from "@/lib/auth";

// Update a review
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  // check if user is authenticated
  const session = await authenticate();
  if (!session) return sendErrorResponse(401, "Unauthorized");

  const { id: reviewId } = await params;

  if (!reviewId) {
    return sendErrorResponse(400, "Review ID is required");
  }

  const body = await req.json();
  const { name, email, comment, ratings, isApproved, productSlug } = body;


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

    return sendSuccessResponse(200, "Review updated successfully", updatedReview);
  } catch (err: any) {
    console.error(err?.stack || err);
    return sendErrorResponse(500, "Failed to update review");
  }
}
