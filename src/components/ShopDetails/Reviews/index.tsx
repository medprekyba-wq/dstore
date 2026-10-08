import { IProductByDetails } from "@/types/product";
import { useEffect, useState } from "react";
import ReviewItem from "./ReviewItem";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  // Add more fields as per your API response
}

const Reviews = ({ product }: { product: IProductByDetails }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  useEffect(() => {
    if (product?.slug) {
      fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productSlug: product.slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          setReviews(data.review || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching reviews:", error);
          setError("Failed to load reviews.");
          setLoading(false);
        });
    }
  }, [product?.slug]);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div className="max-w-[570px] w-full">
        <h2 className="text-xl font-medium text-dark mb-9">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"} for
          this product
        </h2>

        <div className="flex flex-col gap-6">
          {reviews.slice(0, visibleCount).map((review, i) => (
            <ReviewItem review={review} key={i} />
          ))}
        </div>

        {visibleCount < reviews.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="inline-flex font-medium text-white bg-dark py-2 px-6 rounded-md hover:bg-blue duration-200"
            >
              Show More
            </button>
          </div>
        )}
      </div>

      {/* <AddReviews productSlug={product.slug} /> */}
    </>
  );
};

export default Reviews;
