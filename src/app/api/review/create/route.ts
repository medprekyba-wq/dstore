import { prisma } from '@/lib/prismaDB';
import { sendErrorResponse, sendSuccessResponse } from '@/utils/sendResponse';
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, comment, ratings, productSlug } = body;

  try {
    // Check if the user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        email,
        productSlug,
      },
    });

    if (existingReview) {
      return sendErrorResponse(400, "You have already reviewed this product");
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
    return sendSuccessResponse(200, "Review created successfully", review);
  } catch (err: any) {
    console.error(err?.stack || err);
    return sendErrorResponse(500, "Failed to create review");
  }
}

