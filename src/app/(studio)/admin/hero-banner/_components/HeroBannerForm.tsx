"use client";
import { createHeroBanner, updateHeroBanner } from "@/app/actions/hero-banner";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { HeroBanner } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface HeroBannerInput {
  bannerName?: string;
  subtitle: string;
  bannerImage: {
    image: File | null | string;
  };
  slug?: string;
  productSlug: string;
}

type HeroBannerProps = {
  bannerItem?: HeroBanner | null; // Existing coupon for editing
};

export default function HeroBannerForm({ bannerItem }: HeroBannerProps) {
  const { handleSubmit, control, reset } = useForm<HeroBannerInput>({
    defaultValues: {
      bannerName: bannerItem?.bannerName || "", // Prefill title if editing
      subtitle: bannerItem?.subtitle || "", // Prefill subtitle if editing
      slug: bannerItem?.slug || "", // Prefill slug
      productSlug: bannerItem?.productSlug || "",
      bannerImage: bannerItem?.bannerImage
        ? { image: bannerItem.bannerImage }
        : { image: null }, // New image will be stored here
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: HeroBannerInput) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.bannerName || "");
      formData.append("subtitle", data.subtitle);
      if (data.slug) {
        formData.append("slug", data.slug);
      } else {
        formData.append("slug", data.productSlug);
      }
      formData.append("productSlug", data.productSlug);
      if (data.bannerImage.image) {
        formData.append("image", data.bannerImage.image);
      } else {
        toast.error("Banner Image is required");
        setIsLoading(false);
        return;
      }
      let result;
      if (bannerItem) {
        result = await updateHeroBanner(bannerItem.id, formData);
      } else {
        result = await createHeroBanner(formData);
      }
      if (result?.success) {
        toast.success(
          `Hero-banner ${bannerItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/hero-banner");
      } else {
        toast.error(result?.message || "Failed to upload hero-banner");
      }
    } catch (error: any) {
      console.error("Error uploading hero-banner:", error);
      toast.error(error?.message || "Failed to upload hero-banner");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when bannerItem is changed
  useEffect(() => {
    if (bannerItem) {
      reset({
        bannerName: bannerItem?.bannerName || "", // Prefill title if editing
        subtitle: bannerItem?.subtitle || "", // Prefill subtitle if editing
        slug: bannerItem?.slug || "", // Prefill slug
        productSlug: bannerItem?.productSlug || "",
        bannerImage: bannerItem?.bannerImage
          ? { image: bannerItem.bannerImage }
          : { image: null }, // New image will be stored here
      });
    }
  }, [bannerItem, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Banner Name Input */}
        <Controller
          control={control}
          name="bannerName"
          rules={{ required: false }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Banner Name"
                type="text"
                error={!!fieldState.error}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />
        {/* Subtitle */}
        <Controller
          control={control}
          name="subtitle"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Subtitle"
                type="text"
                error={!!fieldState.error}
                required
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
          render={({ field }) => (
            <div className="w-full">
              <InputGroup
                label="Slug"
                type="text"
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
          name="bannerImage"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Banner Image (Recommended: 255x315)"
              images={bannerItem?.bannerImage ? [bannerItem.bannerImage] : []}
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
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex items-center gap-2 font-base text-sm text-white bg-blue py-3 px-5 font-normal rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : bannerItem
            ? "Update Banner"
            : "Save Hero Banner"}
      </button>
    </form>
  );
}
