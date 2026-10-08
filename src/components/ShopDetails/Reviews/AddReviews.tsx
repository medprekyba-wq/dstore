"use client";

import { createReview } from "@/app/actions/review";
import { StarIcon } from "@/assets/icons";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

const AddReviews = ({ productSlug }: any) => {
  const [rating, setRating] = useState(1);
  const [hover, setHover] = useState(1);
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const [state, setState] = useState({
    comment: "",
    name: session?.data?.user?.name || "",
    email: session?.data?.user?.email || "",
    productSlug,
    ratings: rating,
  });

  const handleChange = (e: any) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state.comment === "" || state.name === "" || state.email === "") {
        toast.error("Please fill all the fields");
        setLoading(false);
        return;
      }
      const result = await createReview({
        ...state,
        ratings: rating,
      });
      if (result?.success) {
        toast.success(`Review created successfully wait for admin approval`);
        setState({
          comment: "",
          name: session?.data?.user?.name || "",
          email: session?.data?.user?.email || "",
          productSlug: "",
          ratings: 0,
        });
      } else {
        toast.error(result?.message || "Failed to upload review");
      }
    } catch (error) {
      console.log(error, "error in review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[550px] w-full">
      <form onSubmit={handleSubmit}>
        <h2 className="font-medium text-xl text-dark mb-3.5">Add a Review</h2>

        <p className="mb-6">
          Your email address will not be published. Required fields are marked *
        </p>

        <div className="flex items-center gap-3 mb-7.5">
          <span>Your Rating*</span>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
              index += 1;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <span
                    className={`cursor-pointer ${
                      index <= (hover || rating)
                        ? "text-[#FBB040]"
                        : "text-gray-5"
                    }`}
                  >
                    <StarIcon />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-1 sm:p-6">
          <div className="mb-5">
            <label
              htmlFor="comment"
              className="block mb-1.5 text-sm text-gray-6"
            >
              Comment
            </label>

            <textarea
              onChange={handleChange}
              value={state.comment}
              name="comment"
              id="comment"
              rows={5}
              required
              placeholder="Your review"
              className="w-full px-4 py-3 duration-200 border rounded-lg border-gray-3 placeholder:text-sm placeholder:text-dark-5 outline-hidden focus:border-blue focus:ring-0"
            ></textarea>

            <span className="flex items-center justify-between mt-2.5">
              <span className="text-custom-sm text-dark-4">Maximum</span>
              <span className="text-custom-sm text-dark-4">0/250</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7.5 mb-5.5">
            <div>
              <label
                htmlFor="name"
                className="block mb-1.5 text-sm text-gray-6"
              >
                Name
              </label>

              <input
                onChange={handleChange}
                type="text"
                name="name"
                id="name"
                placeholder="Your name"
                required
                value={state.name}
                readOnly={session?.data?.user?.name ? true : false}
                className="w-full px-4 py-3 duration-200 border rounded-lg border-gray-3 placeholder:text-sm h-11 placeholder:text-dark-5 outline-hidden focus:border-blue focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm text-gray-6"
              >
                Email
              </label>

              <input
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
                placeholder="Your email"
                value={state.email}
                required
                readOnly={session?.data?.user?.email ? true : false}
                className="w-full px-4 py-3 duration-200 border rounded-lg border-gray-3 placeholder:text-sm h-11 placeholder:text-dark-5 outline-hidden focus:border-blue focus:ring-0"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="inline-flex px-5 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-blue hover:bg-blue-dark"
          >
            {loading ? "Loading..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReviews;
