import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prismaDB";
import ReviewList from "./_components/ReviewList";

const getReviews = async () => {
  "use cache";
  cacheTag("reviews");
  return await prisma.review.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      ratings: true,
      updatedAt: true,
      product: {
        select: {
          title: true,
        },
      },
    },
  });
};

export default async function ReviewsPage() {
  const reviewData = await getReviews();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border shadow-lg rounded-xl border-gray-3">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Reviews</h2>
      </div>

      <div>
        {reviewData ? (
          reviewData.length > 0 ? (
            <ReviewList reviewData={reviewData} />
          ) : (
            <p className="py-10 font-medium text-center text-red-500">
              No reviews found
            </p>
          )
        ) : (
          <p className="py-10 text-center text-gray-500">Loading reviews...</p>
        )}
      </div>
    </div>
  );
}
