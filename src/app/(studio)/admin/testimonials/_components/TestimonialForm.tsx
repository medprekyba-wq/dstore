"use client";
import {
  createTestimonial,
  updateTestimonial,
} from "@/app/actions/testimonial";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { Testimonial } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface TestimonialInput {
  author: string;
  designation?: string;
  rating: number;
  avatar: {
    image: File | null | string;
  };
  content: string;
}

type Props = {
  testimonialItem?: Testimonial | null;
};

export default function TestimonialForm({ testimonialItem }: Props) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    reset,
  } = useForm<TestimonialInput>({
    defaultValues: {
      author: testimonialItem?.author || "",
      designation: testimonialItem?.designation || "",
      rating: testimonialItem?.rating || 5,
      avatar: {
        image: testimonialItem?.avatar || null,
      },
      content: testimonialItem?.content || "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: TestimonialInput) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("author", data.author);
      if (data.designation) formData.append("designation", data.designation);
      formData.append("rating", data.rating.toString());
      formData.append("content", data.content);

      if (data.avatar.image instanceof File) {
        formData.append("avatar", data.avatar.image);
      } else if (typeof data.avatar.image === "string") {
        formData.append("avatar", data.avatar.image);
      }

      let result;
      if (testimonialItem) {
        result = await updateTestimonial(testimonialItem.id, formData);
      } else {
        result = await createTestimonial(formData);
      }

      if (result?.success) {
        toast.success(
          `Testimonial ${testimonialItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to save testimonial");
      }
    } catch (error: any) {
      console.error("Error saving testimonial", error);
      toast.error(error?.message || "Failed to save testimonial");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when testimonialItem is changed
  useEffect(() => {
    if (testimonialItem) {
      reset({
        author: testimonialItem?.author || "",
        designation: testimonialItem?.designation || "",
        rating: testimonialItem?.rating || 5,
        avatar: {
          image: testimonialItem?.avatar || null,
        },
        content: testimonialItem?.content || "",
      });
    }
  }, [testimonialItem, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        <Controller
          control={control}
          name="author"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Author Name"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Author is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="designation"
          render={({ field }) => (
            <div className="w-full">
              <InputGroup
                label="Designation (e.g., Serial Entrepreneur)"
                type="text"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        <div className="w-full">
          <label className="block mb-1.5 text-sm text-gray-6">
            Rating (1-5) <span className="text-red">*</span>
          </label>
          <input
            {...register("rating", { valueAsNumber: true, min: 1, max: 5 })}
            type="number"
            min="1"
            max="5"
            className={cn(
              "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11 focus:border-blue focus:outline-0 w-full py-2.5 px-4 duration-200 focus:ring-0",
              { "border-red-500": errors.rating },
            )}
          />
          {errors.rating && (
            <p className="text-sm text-red mt-1.5">
              Rating must be between 1 and 5.
            </p>
          )}
        </div>

        <Controller
          control={control}
          name="avatar"
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Avatar Image"
              images={
                typeof field.value.image === "string" ? [field.value.image] : []
              }
              setImages={(files) =>
                field.onChange({ image: files?.[0] || null })
              }
              showTitle={false}
              required={false}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="content"
          rules={{ required: "Review content is required" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <label className="block mb-1.5 text-sm text-gray-6">
                Testimonial Content <span className="text-red">*</span>
              </label>
              <textarea
                rows={5}
                {...field}
                className={cn(
                  "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 focus:border-blue focus:outline-0 w-full py-2.5 px-4 duration-200 focus:ring-0 resize-none",
                  { "border-red-500": fieldState.error },
                )}
                placeholder="Write the review content here..."
              ></textarea>
              {fieldState.error && (
                <p className="text-sm text-red mt-1.5">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : testimonialItem
            ? "Update Testimonial"
            : "Save Testimonial"}
      </button>
    </form>
  );
}
