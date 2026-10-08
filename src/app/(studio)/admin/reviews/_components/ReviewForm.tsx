"use client";
import { createReview, updateReview } from "@/app/actions/review";
import { StarIcon } from "@/assets/icons";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { Review } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ReviewInput {
  name: string;
  email: string;
  comment: string;
  ratings: number;
  productSlug: string;
  isApproved?: boolean;
}

type ReviewProps = {
  reviewItem?: Review | null; // Existing author for editing
};

export default function ReviewForm({ reviewItem }: ReviewProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewInput>({
    defaultValues: {
      name: reviewItem?.name || "", // Prefill name if editing
      email: reviewItem?.email || "", // Prefill email
      comment: reviewItem?.comment || "", // Prefill comment
      ratings: reviewItem?.ratings || 0, // Prefill ratings
      productSlug: reviewItem?.productSlug || "", // Prefill productID
      isApproved: reviewItem?.isApproved || false, // Prefill isApproved
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const onSubmit = async (data: ReviewInput) => {
    setIsLoading(true);
    try {
      let result;
      if (reviewItem) {
        result = await updateReview(reviewItem.id, {
          ...data,
          productSlug: data.productSlug,
          isApproved: data.isApproved ?? false,
        });
      } else {
        result = await createReview({
          ...data,
          productSlug: data.productSlug,
        });
      }
      if (result?.success) {
        toast.success(
          `Review ${reviewItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/reviews");
      } else {
        toast.error(result?.message || "Failed to upload review");
      }
    } catch (error: any) {
      console.error("Error uploading review:", error);
      toast.error(error?.message || "Failed to upload review");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when reviewItem is changed
  useEffect(() => {
    if (reviewItem) {
      reset({
        name: reviewItem?.name || "",
        email: reviewItem?.email || "",
        comment: reviewItem?.comment || "",
        ratings: reviewItem?.ratings || 0,
        productSlug: reviewItem?.productSlug || "",
        isApproved: reviewItem?.isApproved || false,
      });
    }
  }, [reviewItem, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Title Input */}
        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Name"
                type="text"
                required
                readOnly={reviewItem ? true : false}
                error={!!fieldState.error}
                errorMessage="Name is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />
        {/* email Input */}
        <Controller
          control={control}
          name="email"
          rules={{
            required: true,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "invalid email address",
            },
          }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Email"
                type="email"
                readOnly={reviewItem ? true : false}
                required
                error={!!fieldState.error}
                errorMessage="Email is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />
        {/* Ratings Input with Stars */}
        <Controller
          control={control}
          name="ratings"
          rules={{
            required: "Ratings is required",
            validate: (value) => value > 0,
          }}
          render={({ field }) => (
            <div className="w-full">
              <div className="flex items-center gap-3">
                <label className="block text-sm text-gray-6">
                  Rating <span className="text-red">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    index += 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        // onClick={() => {
                        //   setValue("ratings", index, { shouldValidate: true });
                        // }}
                        // onMouseEnter={() => setHover(index)}
                        // onMouseLeave={() => setHover(field.value)}
                        disabled={reviewItem ? true : false}
                        className={`cursor-${reviewItem ? "not-allowed" : "pointer"}`}
                      >
                        <span
                          className={`${
                            index <= (hover || field.value)
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
              {errors.ratings && (
                <p className="text-sm text-red mt-1.5">Rating is required</p>
              )}
            </div>
          )}
        />

        {/* bio */}
        <div>
          <label htmlFor="comment" className="block mb-1.5 text-sm text-gray-6">
            Comment <span className="text-red">*</span>
          </label>

          <textarea
            {...register("comment", {
              required: "Comment is required",
            })}
            id="comment"
            rows={5}
            readOnly={reviewItem ? true : false}
            placeholder="Type your comment"
            className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3   focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
          />

          {errors.comment && (
            <p className="mt-1 text-sm text-red">{errors.comment.message}</p>
          )}
        </div>

        {/* product field */}
        <Controller
          control={control}
          name="productSlug"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Product Slug"
                type="text"
                placeholder="Enter your product slug"
                readOnly={reviewItem ? true : false}
                required
                error={!!fieldState.error}
                errorMessage="Product slug is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Toggle isApproved */}
        <Controller
          control={control}
          name="isApproved"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <span className="block text-sm text-gray-6">Approved:</span>
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`relative w-10 h-6 rounded-full transition-all duration-300 ${
                  field.value ? "bg-blue" : "bg-gray-4"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 transform ${
                    field.value ? "translate-x-full" : "translate-x-0"
                  }`}
                ></span>
              </button>
              <span className="text-sm font-normal text-gray-6">
                {field.value ? "Yes" : "No"}
              </span>
            </div>
          )}
        />
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex text-sm items-center gap-2 font-normal text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : reviewItem ? "Update review" : "Save review"}
      </button>
    </form>
  );
}
