"use client";
import { createPostAuthor, updatePostAuthor } from "@/app/actions/post-author";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { generateSlug } from "@/utils/slugGenerate";
import { PostAuthor } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface AuthorInput {
  name: string;
  slug?: string;
  authorImage: {
    image: File | null | string;
  };
  bio?: string;
  description?: string;
}

type AuthorProps = {
  authorItem?: PostAuthor | null; // Existing author for editing
};

export default function PostAuthorForm({ authorItem }: AuthorProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
    reset,
  } = useForm<AuthorInput>({
    defaultValues: {
      name: authorItem?.name || "",
      slug: authorItem?.slug || "",
      authorImage: {
        image: authorItem?.image || null,
      },
      bio: authorItem?.bio || "",
      description: authorItem?.description || "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: AuthorInput) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.slug) {
        formData.append("slug", data.slug);
      } else {
        formData.append("slug", generateSlug(data.name));
      }

      if (data.authorImage.image) {
        formData.append("image", data.authorImage.image);
      } else {
        toast.error("Author Image is required*");
        setIsLoading(false);
        return;
      }
      if (data.bio) formData.append("bio", data.bio);
      if (data.description) formData.append("description", data.description);

      let result;
      if (authorItem) {
        result = await updatePostAuthor(authorItem.id, formData);
      } else {
        result = await createPostAuthor(formData);
      }
      if (result?.success) {
        toast.success(
          `Post Author ${authorItem ? "updated" : "created"} successfully`,
        );
        reset();
        router.push("/admin/post-authors");
      } else {
        toast.error(result?.message || "Failed to upload post author");
      }
    } catch (error: any) {
      console.error("Error uploading post author:", error);
      toast.error(error?.message || "Failed to upload post author");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when postAuthorItem is changed
  useEffect(() => {
    if (authorItem) {
      reset({
        name: authorItem?.name || "",
        slug: authorItem?.slug || "",
        authorImage: {
          image: authorItem?.image || null,
        },
        bio: authorItem?.bio || "",
        description: authorItem?.description || "",
      });
    }
  }, [authorItem, reset]);

  
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
                error={!!fieldState.error}
                errorMessage="Name is required"
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
          name="authorImage"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Author Image (Recommended Size 48x48)"
              images={authorItem?.image ? [authorItem.image] : []}
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

        {/* bio */}
        <div>
          <label htmlFor="bio" className="block mb-1.5 text-sm text-gray-6">
            Bio
          </label>

          <textarea
            {...register("bio", {
              required: false,
            })}
            id="bio"
            rows={5}
            placeholder="Type your bio"
            className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3   focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
          />

          {errors.bio && (
            <p className="mt-1 text-sm text-red">{errors.bio.message}</p>
          )}
        </div>

        {/* description */}
        <div>
          <label
            htmlFor="description"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Description
          </label>

          <textarea
            {...register("description", {
              required: false,
            })}
            id="description"
            rows={5}
            placeholder="Type your description"
            className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3   focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex mt-1.5 items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5  rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : authorItem ? "Update Author" : "Save Author"}
      </button>
    </form>
  );
}
