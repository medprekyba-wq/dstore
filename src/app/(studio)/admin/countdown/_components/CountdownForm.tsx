"use client";
import { createCountdown, updateCountdown } from "@/app/actions/countdown";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { Countdown } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface CountdownInput {
  title: string;
  subtitle: string;
  countdownImage: {
    image: File | null | string;
  };
  slug?: string;
  countdownDate: Date;
  productSlug: string;
}

type CountdownProps = {
  countdownItem?: Countdown | null; // Existing coupon for editing
};

export default function CountdownForm({ countdownItem }: CountdownProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    reset,
  } = useForm<CountdownInput>({
    defaultValues: {
      title: countdownItem?.title || "", // Prefill title if editing
      subtitle: countdownItem?.subtitle || "", // Prefill subtitle if editing
      slug: countdownItem?.slug || "", // Prefill slug if editing
      productSlug: countdownItem?.productSlug || "", // Prefill slug if editing
      countdownDate: countdownItem?.countdownDate || undefined, // Prefill date if editing
      countdownImage: { image: countdownItem?.countdownImage || null }, // Prefill image if editing
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: CountdownInput) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title || "");
      formData.append("subtitle", data.subtitle);
      formData.append("slug", data.slug || "");

      formData.append("productSlug", data.productSlug);
      if (data.countdownImage.image) {
        formData.append("image", data.countdownImage.image);
      } else {
        toast.error("Countdown Image is required");
        setIsLoading(false);
        return;
      }
      if (data.countdownDate) {
        // Convert to Date object if it's not already, then call toISOString
        const countdownDate =
          data.countdownDate instanceof Date
            ? data.countdownDate
            : new Date(data.countdownDate);
        formData.append("countdownDate", countdownDate.toISOString());
      } else {
        toast.error("Countdown Date is required");
        setIsLoading(false);
        return;
      }
      let result;
      if (countdownItem) {
        result = await updateCountdown(countdownItem.id, formData);
      } else {
        result = await createCountdown(formData);
      }
      if (result?.success) {
        toast.success(
          `Countdown ${countdownItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/countdown");
      } else {
        toast.error(result?.message || "Failed to upload countdown");
      }
    } catch (error: any) {
      console.error("Error uploading countdown:", error);
      toast.error(error?.message || "Failed to upload countdown");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when countdown is changed
  useEffect(() => {
    if (countdownItem) {
      reset({
        title: countdownItem?.title || "",
        subtitle: countdownItem?.subtitle || "",
        slug: countdownItem?.slug || "",
        productSlug: countdownItem?.productSlug || "",
        countdownDate: countdownItem?.countdownDate || undefined,
        countdownImage: { image: countdownItem?.countdownImage || null },
      });
    }
  }, [countdownItem, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Title Input */}
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Title"
                type="text"
                placeholder="Enter your title"
                required
                error={!!fieldState.error}
                errorMessage="Title is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* subtitle Input */}
        <Controller
          control={control}
          name="subtitle"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Subtitle"
                type="text"
                placeholder="Enter your subtitle"
                required
                error={!!fieldState.error}
                errorMessage="Subtitle is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* slug Input */}
        <Controller
          control={control}
          name="slug"
          rules={{ required: false }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Slug"
                type="text"
                placeholder="sample-slug"
                error={!!fieldState.error}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* banner image */}
        <Controller
          control={control}
          name="countdownImage"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Countdown Image (Recommended Size 65 × 75)"
              images={
                countdownItem?.countdownImage
                  ? [countdownItem.countdownImage]
                  : []
              }
              setImages={(files) =>
                field.onChange({ image: files?.[0] || null })
              }
              showTitle={false}
              required={true}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

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

        {/* countdown date Input */}
        <Controller
          control={control}
          name="countdownDate"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Countdown Date"
                type="date"
                required
                error={!!fieldState.error}
                errorMessage="Countdown Date is required"
                name={field.name}
                value={
                  field.value
                    ? new Date(field.value).toISOString().split("T")[0]
                    : ""
                }
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex mt-1.5 items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : countdownItem
            ? "Update Countdown"
            : "Save Countdown"}
      </button>
    </form>
  );
}
