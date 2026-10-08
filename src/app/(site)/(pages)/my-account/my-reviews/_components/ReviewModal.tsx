"use client";

import { createReview, updateReview } from "@/app/actions/review";
import { StarIcon, XIcon } from "@/assets/icons";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  product: {
    slug: string;
    title: string;
    review?: any;
  };
  onSubmitSuccess?: () => void;
};

const ReviewModal = ({ isOpen, closeModal, product, onSubmitSuccess }: PropsType) => {
  const [rating, setRating] = useState(product?.review?.ratings || 5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const [comment, setComment] = useState(product?.review?.comment || "");

  useEffect(() => {
    if (product?.review) {
      setRating(product.review.ratings);
      setComment(product.review.comment);
    } else {
      setRating(5);
      setComment("");
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!comment || !session?.user?.name || !session?.user?.email) {
        toast.error("Please fill all the fields");
        setLoading(false);
        return;
      }

      if (product.review) {
        // Edit Review
        const result = await updateReview(product.review.id || "", {
          name: session.user.name,
          email: session.user.email,
          comment,
          ratings: rating,
          isApproved: false, // reset approval on edit if needed
          productSlug: product.slug,
        });
        if (result?.success) {
          toast.success("Review updated successfully");
          onSubmitSuccess?.();
          closeModal();
        } else {
          toast.error(result?.message || "Failed to update review");
        }
      } else {
        // Create Review
        const result = await createReview({
          name: session.user.name,
          email: session.user.email,
          comment,
          ratings: rating,
          productSlug: product.slug,
        });
        if (result?.success) {
          toast.success("Review submitted for approval");
          onSubmitSuccess?.();
          closeModal();
        } else {
          toast.error(result?.message || "Failed to submit review");
        }
      }
    } catch (error) {
      console.log(error, "error in review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-dark/70 p-4">
      <div className="w-full max-w-[550px] bg-white rounded-xl shadow-3 relative p-6 sm:p-8">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-dark-5 hover:text-dark ease-in duration-200"
        >
          <XIcon />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="font-medium text-xl text-dark mb-6">
            {product.review ? "Edit Review" : "Write a Review"} for{" "}
            <span className="text-blue">{product.title}</span>
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium">Your Rating*</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => {
                const starIndex = index + 1;
                return (
                  <button
                    type="button"
                    key={starIndex}
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHover(starIndex)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <StarIcon
                      className={`w-5 h-5 cursor-pointer ${
                        starIndex <= (hover || rating)
                          ? "text-[#FBB040] fill-[#FBB040]"
                          : "text-gray-5"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block mb-2 text-sm text-gray-6">
              Your Review*
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              id="comment"
              rows={5}
              required
              placeholder="Tell us what you think..."
              className="w-full px-4 py-3 duration-200 border rounded-lg border-gray-3 outline-none focus:border-blue"
            ></textarea>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 text-sm font-medium text-white duration-200 ease-out rounded-lg bg-blue hover:bg-blue-dark disabled:opacity-50"
          >
            {loading ? "Submitting..." : product.review ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
