"use client";

import {
  createCategory,
  updateCategory,
} from "@/app/actions/category";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { errorDialog } from "@/utils/confirmDialog";
import { Category } from "@prisma/client";
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
} from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";

interface CategoryInput {
  title: string;
  slug: string;
  desc: string;
  image: File | null | string;
  parentId: string;
}

type CategoryWithHierarchy = Pick<
  Category,
  | "id"
  | "title"
  | "slug"
  | "img"
  | "parentId"
>;

type EditableCategory =
  CategoryWithHierarchy & {
    description?: string | null;
  };

type CategoryProps = {
  category?: EditableCategory;
  categories: CategoryWithHierarchy[];
};

export default function CategoryForm({
  category,
  categories,
}: CategoryProps) {
  const {
    handleSubmit,
    control,
    watch,
    register,
    reset,
  } = useForm<CategoryInput>({
    defaultValues: {
      title: category?.title || "",
      slug: category?.slug || "",
      desc: category?.description || "",
      image: category?.img || null,
      parentId: category?.parentId
        ? String(category.parentId)
        : "",
    },
  });

  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const imageFile = watch("image");

  // =====================================================
  // CATEGORY HIERARCHY
  // =====================================================

  const getChildren = (
    parentId: number
  ) =>
    categories.filter(
      (item) =>
        item.parentId === parentId
    );

  /*
   * Returns all descendant IDs of a category.
   * Used in edit mode to prevent selecting
   * the category itself or one of its descendants
   * as parent.
   */
  const getDescendantIds = (
    categoryId: number
  ) => {
    const result =
      new Set<number>();

    const collectChildren = (
      parentId: number
    ) => {
      const children =
        getChildren(parentId);

      children.forEach(
        (child) => {
          if (
            !result.has(child.id)
          ) {
            result.add(
              child.id
            );

            collectChildren(
              child.id
            );
          }
        }
      );
    };

    collectChildren(
      categoryId
    );

    return result;
  };

  /*
   * Available categories for parent selection.
   *
   * In edit mode:
   * - remove current category
   * - remove all descendants
   */
  const availableCategories =
    useMemo(() => {
      if (!category) {
        return categories;
      }

      const descendantIds =
        getDescendantIds(
          category.id
        );

      return categories.filter(
        (item) =>
          item.id !==
            category.id &&
          !descendantIds.has(
            item.id
          )
      );
    }, [categories, category]);

  // Level 1
  const level1Categories =
    availableCategories.filter(
      (item) =>
        item.parentId === null
    );

  const getAvailableChildren = (
    parentId: number
  ) =>
    availableCategories.filter(
      (item) =>
        item.parentId ===
        parentId
    );

  /*
   * Parent selector intentionally shows:
   *
   * Level 1 -> new category becomes Level 2
   * Level 2 -> new category becomes Level 3
   *
   * Level 3 is NOT shown as parent.
   */

  // =====================================================
  // SUBMIT
  // =====================================================

  const onSubmit = async (
    data: CategoryInput
  ) => {
    setIsLoading(true);

    try {
      const formData =
        new FormData();

      const slugified =
        data.slug
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          )
          .replace(
            /[^a-z0-9-]/g,
            ""
          );

      formData.append(
        "title",
        data.title.trim()
      );

      formData.append(
        "slug",
        slugified
      );

      formData.append(
        "desc",
        data.desc || ""
      );

      // Parent category
      if (data.parentId) {
        formData.append(
          "parentId",
          data.parentId
        );
      }

      // Image
      if (
        data.image instanceof
        File
      ) {
        formData.append(
          "image",
          data.image
        );
      } else if (
        typeof data.image ===
        "string"
      ) {
        formData.append(
          "image",
          data.image
        );
      }

      // Extra image validation
      if (
        !data.image &&
        !category?.img
      ) {
        return errorDialog(
          "Image is required"
        );
      }

      let result;

      if (category) {
        result =
          await updateCategory(
            category.id,
            formData
          );
      } else {
        result =
          await createCategory(
            formData
          );
      }

      if (result?.success) {
        toast.success(
          `Category ${
            category
              ? "updated"
              : "created"
          } successfully`
        );

        reset();

        router.push(
          "/admin/categories"
        );
      } else {
        toast.error(
          result?.message ||
            "Failed to save category"
        );
      }
    } catch (error: any) {
      console.error(
        "Error saving category:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to save category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // EDIT MODE RESET
  // =====================================================

  useEffect(() => {
    if (category) {
      reset({
        title:
          category.title || "",

        slug:
          category.slug || "",

        desc:
          category.description ||
          "",

        image:
          category.img ||
          null,

        parentId:
          category.parentId
            ? String(
                category.parentId
              )
            : "",
      });
    }
  }, [category, reset]);

  // =====================================================
  // FORM
  // =====================================================

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
    >
      <div className="flex flex-col gap-5 mb-5">

        {/* TITLE */}
        <Controller
          control={control}
          name="title"
          rules={{
            required:
              "Title is required",
          }}
          render={({
            field,
            fieldState,
          }) => (
            <div className="w-full">
              <InputGroup
                label="Title"
                type="text"
                required
                error={
                  !!fieldState.error
                }
                errorMessage={
                  fieldState.error
                    ?.message
                }
                name={
                  field.name
                }
                value={
                  field.value ?? ""
                }
                onChange={
                  field.onChange
                }
              />
            </div>
          )}
        />

        {/* SLUG */}
        <Controller
          control={control}
          name="slug"
          rules={{
            required:
              "Slug is required",
          }}
          render={({
            field,
            fieldState,
          }) => (
            <div className="w-full">
              <InputGroup
                label="Slug"
                type="text"
                required
                error={
                  !!fieldState.error
                }
                errorMessage={
                  fieldState.error
                    ?.message
                }
                name={
                  field.name
                }
                value={
                  field.value ?? ""
                }
                onChange={
                  field.onChange
                }
              />
            </div>
          )}
        />

        {/* PARENT CATEGORY */}
        <div>
          <label
            htmlFor="parentId"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Parent Category
          </label>

          <select
            id="parentId"
            {...register(
              "parentId"
            )}
            className="rounded-lg border border-gray-3 h-11 focus:border-blue focus:outline-0 w-full py-2.5 px-4 duration-200 focus:ring-0"
          >
            <option value="">
              Main category
            </option>

            {level1Categories.map(
              (level1) => {
                const level2Categories =
                  getAvailableChildren(
                    level1.id
                  );

                return (
                  <Fragment
                    key={
                      level1.id
                    }
                  >
                    {/* LEVEL 1 */}
                    <option
                      value={
                        level1.id
                      }
                    >
                      {
                        level1.title
                      }
                    </option>

                    {/* LEVEL 2 */}
                    {level2Categories.map(
                      (
                        level2
                      ) => (
                        <option
                          key={
                            level2.id
                          }
                          value={
                            level2.id
                          }
                        >
                          └─{" "}
                          {
                            level2.title
                          }
                        </option>
                      )
                    )}
                  </Fragment>
                );
              }
            )}
          </select>

          <p className="mt-1.5 text-xs text-gray-500">
            Main category creates
            Level 1. Selecting a
            Level 1 category creates
            Level 2. Selecting a
            Level 2 category creates
            Level 3.
          </p>
        </div>

        {/* DESCRIPTION */}
        <div className="rounded-[10px]">
          <label
            htmlFor="desc"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Description
          </label>

          <textarea
            {...register(
              "desc"
            )}
            id="desc"
            rows={5}
            placeholder="Category description"
            className="w-full px-4 py-3 duration-200 border rounded-lg resize-none placeholder:font-normal placeholder:text-sm border-gray-3 placeholder:text-dark-5 outline-hidden focus:border-blue"
          />
        </div>

        {/* IMAGE */}
        <Controller
          control={control}
          name="image"
          rules={{
            required:
              category?.img
                ? false
                : "Image is required",
          }}
          render={({
            field,
            fieldState,
          }) => (
            <ImageUpload
              label="Category Image (Recommended: 80x70)"
              images={
                imageFile
                  ? [
                      imageFile,
                    ]
                  : category?.img
                    ? [
                        category.img,
                      ]
                    : null
              }
              setImages={(
                files
              ) =>
                field.onChange(
                  files?.[0] ||
                    null
                )
              }
              required
              error={
                !!fieldState.error
              }
              errorMessage={
                fieldState.error
                  ?.message
              }
            />
          )}
        />
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-4 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
          {
            "opacity-80 pointer-events-none":
              isLoading,
          }
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : category
            ? "Update Category"
            : "Save Category"}
      </button>
    </form>
  );
}