import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { authenticate } from "@/lib/auth";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { productSlug } = body;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        AND: [
          {
            productSlug: productSlug,
          },
          {
            isApproved: true,
          },
        ]
      },
    });

    if (!reviews) {
      return NextResponse.json(
        { message: "No reviews found" },
        { status: 200 }
      );
    }

    return NextResponse.json({ review: reviews }, { status: 200 });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// Delete a review
export async function DELETE(req: NextRequest) {
  // check if user is authenticated
  const session = await authenticate();
  if (!session) return sendErrorResponse(401, "Unauthorized");
  const body = await req.json();
  const { id: reviewId } = body;

  if (!reviewId) {
    return sendErrorResponse(400, "Review ID is required");
  }

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidateTag("reviews", { expire: 0 });
    return sendSuccessResponse(200, "Review deleted successfully");
  } catch (err: any) {
    console.error(err?.stack || err);
    return sendErrorResponse(500, "Failed to delete review");
  }
}
