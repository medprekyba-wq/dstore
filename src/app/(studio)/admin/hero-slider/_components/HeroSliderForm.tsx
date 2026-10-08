"use client";
import { createHeroSlider, updateHeroSlider } from "@/app/actions/hero-slider";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { HeroSlider } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface HeroSliderInput {
  name: string;
  discount: number;
  slug?: string;
  productSlug: string;
  sliderImage: {
    image: File | null | string;
  };
}

type HeroSliderProps = {
  sliderItem?: HeroSlider | null; // Existing coupon for editing
};

export default function HeroSliderForm({ sliderItem }: HeroSliderProps) {
  const { handleSubmit, control, reset } = useForm<HeroSliderInput>({
    defaultValues: {
      name: sliderItem?.sliderName || "",
      discount: sliderItem?.discountRate || 0,
      slug: sliderItem?.slug || "",
      productSlug: sliderItem?.productSlug || "",
      sliderImage: { image: sliderItem?.sliderImage || null },
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: HeroSliderInput) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.slug) {
        formData.append("slug", data.slug);
      } else {
        formData.append("slug", data.productSlug);
      }
      formData.append("productSlug", data.productSlug);
      formData.append("discount", data.discount.toString());
      if (data.sliderImage.image) {
        formData.append("image", data.sliderImage.image);
      } else {
        toast.error("Slider Image is required");
        setIsLoading(false);
        return;
      }
      let result;
      if (sliderItem) {
        result = await updateHeroSlider(sliderItem.id, formData);
      } else {
        result = await createHeroSlider(formData);
      }
      if (result?.success) {
        toast.success(
          `Hero Slider ${sliderItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/hero-slider");
      } else {
        toast.error(result?.message || "Failed to upload hero-slider");
      }
    } catch (error: any) {
      console.error("Error uploading hero-slider:", error);
      toast.error(error?.message || "Failed to upload hero-slider");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when sliderItem is changed
  useEffect(() => {
    if (sliderItem) {
      reset({
        name: sliderItem?.sliderName || "",
        discount: sliderItem?.discountRate || 0,
        slug: sliderItem?.slug || "",
        productSlug: sliderItem?.productSlug || "",
        sliderImage: { image: sliderItem?.sliderImage || null },
      });
    }
  }, [sliderItem, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Slider Name Input */}
        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Slider Name"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Slider Name is required"
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

        {/* maxRedemptions Input */}
        <Controller
          control={control}
          name="discount"
          rules={{ required: true, validate: (value) => value > 0 }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Discount Rate (%)"
                type="number"
                required
                error={!!fieldState.error}
                errorMessage="Discount Rate is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Slider image */}
        <Controller
          control={control}
          name="sliderImage"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Slider Image (Recommended: 385x480)"
              images={sliderItem?.sliderImage ? [sliderItem.sliderImage] : []}
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
          "inline-flex mt-1.5 items-center gap-2 font-normal  text-white bg-blue py-3 px-5 text-sm rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : sliderItem
            ? "Update Slider"
            : "Save Hero Slider"}
      </button>
    </form>
  );
}
