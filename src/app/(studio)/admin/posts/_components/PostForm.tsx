"use client";
import { createPost, updatePost } from "@/app/actions/post";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { generateSlug } from "@/utils/slugGenerate";
import { Post } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";
import QuillEditor from "../../_components/QuillEditor";

interface PostInput {
  title: string;
  metadata?: string;
  slug?: string;
  authorId: number | string;
  categoryId: number | string;
  tags: string[];
  mainImage: {
    image: File | null | string;
  };
  body: string;
}

type PostProps = {
  postCategories: {
    id: number;
    slug: string;
    title: string;
    img: string | null;
  }[]; // List of post categories
  authors: {
    name: string;
    id: number;
    slug: string;
    image: string;
  }[]; // List of authors
  postItem?: Post | null; // Existing author for editing
};

export default function PostForm({
  postItem,
  authors,
  postCategories,
}: PostProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PostInput>({
    defaultValues: {
      title: postItem?.title || "",
      metadata: postItem?.metadata || "",
      slug: postItem?.slug || "",
      authorId: postItem?.authorId || "",
      categoryId: postItem?.categoryId || "",
      tags: postItem?.tags || [],
      mainImage: {
        image: postItem?.mainImage || null,
      },
      body: postItem?.body || "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: PostInput) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.metadata) formData.append("metadata", data.metadata);
      if (data.slug) {
        formData.append("slug", data.slug);
      } else {
        formData.append("slug", generateSlug(data.title));
      }
      formData.append("authorId", data.authorId.toString());
      formData.append("categoryId", data.categoryId.toString());
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("body", data.body);
      if (data.mainImage.image) {
        formData.append("mainImage", data.mainImage.image);
      } else {
        toast.error("Main Image is required*");
        setIsLoading(false);
        return;
      }
      let result;
      if (postItem) {
        result = await updatePost(postItem.id, formData);
      } else {
        result = await createPost(formData);
      }
      if (result?.success) {
        toast.success(`Post ${postItem ? "updated" : "created"} successfully`);
        reset();
        router.push("/admin/posts");
      } else {
        toast.error(result?.message || "Failed to upload post");
      }
    } catch (error: any) {
      console.error("Error uploading post", error);
      toast.error(error?.message || "Failed to upload post");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when postItem is changed
  useEffect(() => {
    if (postItem) {
      reset({
          title: postItem?.title || "",
          metadata: postItem?.metadata || "",
          slug: postItem?.slug || "",
          authorId: postItem?.authorId || "",
          categoryId: postItem?.categoryId || "",
          tags: postItem?.tags || [],
          mainImage: {
            image: postItem?.mainImage || null,
          },
          body: postItem?.body || "",
      });
    }
  }, [postItem, reset]);

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

        {/* metadata Input */}
        <Controller
          control={control}
          name="metadata"
          rules={{ required: false }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Meta Description"
                type="text"
                error={!!fieldState.error}
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
          name="mainImage"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Main Image (Recommended Size 750 × 400)"
              images={postItem?.mainImage ? [postItem.mainImage] : []}
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

        {/* Tags (comma separated) field */}
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <InputGroup
              label="Tags (comma separated)"
              type="text"
              {...field}
              onChange={(e) =>
                setValue(
                  "tags",
                  (e.target as HTMLInputElement).value.split(",")
                )
              }
            />
          )}
        />

        {/* category field */}
        <div>
          <label
            htmlFor="categoryId"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Category <span className="text-red">*</span>
          </label>
          <select
            {...register("categoryId", { required: "Category is required" })}
            id="categoryId"
            className={cn(
              "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0",
              { "border-red-500": errors.categoryId }
            )}
          >
            <option value="">Select a category</option>
            {postCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-red mt-1.5">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* author field */}
        <div>
          <label
            htmlFor="authorId"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Author <span className="text-red">*</span>
          </label>
          <select
            {...register("authorId", { required: "Author is required" })}
            id="authorId"
            className={cn(
              "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0",
              { "border-red-500": errors.authorId }
            )}
          >
            <option value="">Select a author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors.authorId && (
            <p className="text-sm text-red mt-1.5">{errors.authorId.message}</p>
          )}
        </div>

        {/* Quill Editor for Body */}
        <Controller
          control={control}
          name="body"
          rules={{
            required: "Body is required",
            validate: (value) =>
              value.trim() === "" || value === "<p><br></p>"
                ? "Body is required"
                : true,
          }}
          render={({ field, fieldState }) => (
            <QuillEditor
              label="Body"
              required
              value={field.value}
              onChange={field.onChange}
              errMsg={fieldState.error?.message}
            />
          )}
        />
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex  items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading }
        )}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : postItem ? "Update Post" : "Save Post"}
      </button>
    </form>
  );
}
