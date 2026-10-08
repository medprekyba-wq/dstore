"use client";
import {
  createPostCategory,
  updatePostCategory,
} from "@/app/actions/post-category";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { generateSlug } from "@/utils/slugGenerate";
import { PostCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";


interface PostCategoryInput {
  title: string;
  slug?: string;
  categoryImage?: {
    image: File | null | string;
  };
  description?: string;
}

type PostCategoryProps = {
  postCategoryItem?: PostCategory | null; // Existing post category for editing
};

export default function PostCategoryForm({
  postCategoryItem,
}: PostCategoryProps) {
  const { handleSubmit, control, reset } = useForm<PostCategoryInput>({
    defaultValues: {
      title: postCategoryItem?.title || "",
      slug: postCategoryItem?.slug || "",
      description: postCategoryItem?.description || "",
      categoryImage: { image: postCategoryItem?.img || null },
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: PostCategoryInput) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.slug) {
        formData.append("slug", data.slug);
      } else {
        formData.append("slug", generateSlug(data.title));
      }

      if (data.categoryImage?.image) {
        formData.append("image", data.categoryImage.image);
      }
      if (data?.description) {
        formData.append("description", data.description);
      }
      let result;
      if (postCategoryItem) {
        result = await updatePostCategory(postCategoryItem.id, formData);
      } else {
        result = await createPostCategory(formData);
      }

      if (result?.success) {
        toast.success(
          `Post category ${
            postCategoryItem ? "updated" : "created"
          } successfully`
        );
        reset();
        router.push("/admin/post-categories");
      } else {
        toast.error(result?.message || "Failed to upload post-category");
      }
    } catch (error: any) {
      console.error("Error uploading post-category:", error);
      toast.error(error?.message || "Failed to upload post-category");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when postCategoryItem is changed
  useEffect(() => {
    if (postCategoryItem) {
      reset({
        title: postCategoryItem?.title || "",
        slug: postCategoryItem?.slug || "",
        description: postCategoryItem?.description || "",
        categoryImage: { image: postCategoryItem?.img || null },
      });
    }
  }, [postCategoryItem, reset]);

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
          name="categoryImage"
          rules={{
            required: false,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Category Image (Recommended Size 120x120)"
              images={postCategoryItem?.img ? [postCategoryItem.img] : []}
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

        {/* post category date Input */}
        <Controller
          control={control}
          name="description"
          rules={{ required: false }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Description"
                type="text"
                error={!!fieldState.error}
                errorMessage="Description is required"
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
          "inline-flex items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg  ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading }
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : postCategoryItem
          ? "Update Post Category"
          : "Save Post Category"}
      </button>
    </form>
  );
}
