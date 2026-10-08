"use server";
import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import {
  errorResponse,
  successResponse,
} from "@/lib/response";
import { revalidateTag } from "next/cache";
// ======================================================
// HELPERS
// ======================================================
/**
 * Returns the level of an existing category.
 *
 * Level 1 => parentId = null
 * Level 2 => parent is Level 1
 * Level 3 => parent is Level 2
 */
async function getCategoryLevel(
  categoryId: number
): Promise<number> {
  let level = 1;
  let currentCategoryId: number | null =
    categoryId;
  // Protection against a broken/cyclic hierarchy
  const visited = new Set<number>();
  while (currentCategoryId) {
    if (visited.has(currentCategoryId)) {
      throw new Error(
        "Invalid category hierarchy: circular relationship detected"
      );
    }
    visited.add(currentCategoryId);
    const category: { parentId: number | null } | null =
      await prisma.category.findUnique({
        where: {
          id: currentCategoryId,
        },
        select: {
          parentId: true,
        },
      });
    if (!category) {
      throw new Error(
        "Parent category not found"
      );
    }
    if (category.parentId === null) {
      break;
    }
    level++;
    currentCategoryId =
      category.parentId;
  }
  return level;
}
/**
 * Checks whether assigning parentId to categoryId
 * would create a circular relationship.
 *
 * Example that must be prevented:
 *
 * Medical
 * └── Instruments
 *
 * Then editing Medical and assigning
 * Instruments as its parent.
 */
async function wouldCreateCycle(
  categoryId: number,
  parentId: number
): Promise<boolean> {
  let currentParentId:
    | number
    | null = parentId;
  const visited = new Set<number>();
  while (currentParentId) {
    if (currentParentId === categoryId) {
      return true;
    }
    if (visited.has(currentParentId)) {
      return true;
    }
    visited.add(currentParentId);
    const parent: { parentId: number | null } | null =
      await prisma.category.findUnique({
        where: {
          id: currentParentId,
        },
        select: {
          parentId: true,
        },
      });
    if (!parent) {
      return false;
    }
    currentParentId =
      parent.parentId;
  }
  return false;
}
// ======================================================
// CREATE CATEGORY
// ======================================================
export async function createCategory(
  formData: FormData
) {
  try {
    // Authentication
    const session = await authenticate();
    if (!session) {
      return errorResponse(
        401,
        "Unauthorized"
      );
    }
    // --------------------------------------------------
    // Form data
    // --------------------------------------------------
    const title =
      (formData.get("title") as string)?.trim();
    const slug =
      (formData.get("slug") as string)?.trim();
    const file =
      formData.get("image");
    const desc =
      (formData.get("desc") as string) || "";
    const parentIdRaw =
      formData.get("parentId");
    const parentId =
      typeof parentIdRaw === "string" &&
      parentIdRaw.trim() !== ""
        ? Number(parentIdRaw)
        : null;
    // --------------------------------------------------
    // Validation
    // --------------------------------------------------
    if (!title || !slug) {
      return errorResponse(
        400,
        "Title and slug are required"
      );
    }
    if (!(file instanceof File)) {
      return errorResponse(
        400,
        "Category image is required"
      );
    }
    if (
      parentId !== null &&
      (!Number.isInteger(parentId) ||
        parentId <= 0)
    ) {
      return errorResponse(
        400,
        "Invalid parent category"
      );
    }
    // --------------------------------------------------
    // Check title
    // --------------------------------------------------
    const existingCategory =
      await prisma.category.findFirst({
        where: {
          title: {
            equals: title,
            mode: "insensitive",
          },
        },
      });
    if (existingCategory) {
      return errorResponse(
        400,
        "Category title already exists"
      );
    }
    // --------------------------------------------------
    // Check slug
    // --------------------------------------------------
    const existingSlug =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });
    if (existingSlug) {
      return errorResponse(
        400,
        "Category slug already exists"
      );
    }
    // --------------------------------------------------
    // Validate hierarchy
    // --------------------------------------------------
    if (parentId !== null) {
      const parentCategory =
        await prisma.category.findUnique({
          where: {
            id: parentId,
          },
          select: {
            id: true,
            title: true,
            parentId: true,
          },
        });
      if (!parentCategory) {
        return errorResponse(
          400,
          "Parent category not found"
        );
      }
      /*
       * If parent is:
       *
       * Level 1 -> new category becomes Level 2
       * Level 2 -> new category becomes Level 3
       * Level 3 -> new category would become Level 4 => reject
       */
      const parentLevel =
        await getCategoryLevel(parentId);
      if (parentLevel >= 3) {
        return errorResponse(
          400,
          "Maximum category depth is 3 levels"
        );
      }
    }
    // --------------------------------------------------
    // Upload image
    // --------------------------------------------------
    const imageUrl =
      await uploadImageToCloudinary(
        file,
        "categories"
      );
    // --------------------------------------------------
    // Create category
    // --------------------------------------------------
    const category =
      await prisma.category.create({
        data: {
          title,
          slug,
          description: desc,
          img: imageUrl,
          parentId,
        },
      });
    revalidateTag(
      "categories",
      { expire: 0 }
    );
    return successResponse(
      201,
      "Category created successfully",
      category
    );
  } catch (error: any) {
    console.error(
      "Error creating category:",
      error?.stack || error
    );
    return errorResponse(
      500,
      error?.message ||
        "Internal server error"
    );
  }
}
// ======================================================
// DELETE CATEGORY
// ======================================================
export async function deleteCategory(
  categoryId: number
) {
  try {
    // Authentication
    const session = await authenticate();
    if (!session) {
      return errorResponse(
        401,
        "Unauthorized"
      );
    }
    if (!categoryId) {
      return errorResponse(
        400,
        "Category ID is required"
      );
    }
    // --------------------------------------------------
    // Find category
    // --------------------------------------------------
    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
          title: true,
          img: true,
          _count: {
            select: {
              children: true,
              products: true,
            },
          },
        },
      });
    if (!category) {
      return errorResponse(
        404,
        "Category not found"
      );
    }
    // --------------------------------------------------
    // Do not delete category with children
    // --------------------------------------------------
    if (
      category._count.children > 0
    ) {
      return errorResponse(
        400,
        "This category has subcategories. Delete or move the subcategories first."
      );
    }
    /*
     * Optional but recommended:
     * do not delete categories containing products.
     *
     * Otherwise Product.categoryId may cause
     * relation problems depending on your Prisma schema.
     */
    if (
      category._count.products > 0
    ) {
      return errorResponse(
        400,
        "This category contains products. Move the products to another category first."
      );
    }
    // --------------------------------------------------
    // Delete category image
    // --------------------------------------------------
    if (category.img) {
      try {
        await deleteImageFromCloudinary(
          category.img
        );
      } catch (error) {
        console.error(
          "Error deleting category image from Cloudinary:",
          error
        );
      }
    }
    // --------------------------------------------------
    // Delete category
    // --------------------------------------------------
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    revalidateTag(
      "categories",
      { expire: 0 }
    );
    return successResponse(
      200,
      "Category deleted successfully"
    );
  } catch (error: any) {
    console.error(
      "Error deleting category:",
      error?.stack || error
    );
    return errorResponse(
      500,
      error?.message ||
        "Internal server error"
    );
  }
}
// ======================================================
// UPDATE CATEGORY
// ======================================================
export async function updateCategory(
  categoryId: number,
  formData: FormData
) {
  try {
    // Authentication
    const session = await authenticate();
    if (!session) {
      return errorResponse(
        401,
        "Unauthorized"
      );
    }
    if (!categoryId) {
      return errorResponse(
        400,
        "Category ID is required"
      );
    }
    // --------------------------------------------------
    // Form data
    // --------------------------------------------------
    const title =
      (formData.get("title") as string)?.trim();
    const slug =
      (formData.get("slug") as string)?.trim();
    const file =
      formData.get("image");
    const desc =
      (formData.get("desc") as string) || "";
    const parentIdRaw =
      formData.get("parentId");
    const parentId =
      typeof parentIdRaw === "string" &&
      parentIdRaw.trim() !== ""
        ? Number(parentIdRaw)
        : null;
    // --------------------------------------------------
    // Validation
    // --------------------------------------------------
    if (!title || !slug) {
      return errorResponse(
        400,
        "Title and slug are required"
      );
    }
    if (
      parentId !== null &&
      (!Number.isInteger(parentId) ||
        parentId <= 0)
    ) {
      return errorResponse(
        400,
        "Invalid parent category"
      );
    }
    // --------------------------------------------------
    // Existing category
    // --------------------------------------------------
    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });
    if (!category) {
      return errorResponse(
        404,
        "Category not found"
      );
    }
    // --------------------------------------------------
    // Cannot use itself as parent
    // --------------------------------------------------
    if (parentId === categoryId) {
      return errorResponse(
        400,
        "A category cannot be its own parent"
      );
    }
    // --------------------------------------------------
    // Validate parent
    // --------------------------------------------------
    if (parentId !== null) {
      const parentCategory =
        await prisma.category.findUnique({
          where: {
            id: parentId,
          },
          select: {
            id: true,
            parentId: true,
          },
        });
      if (!parentCategory) {
        return errorResponse(
          400,
          "Parent category not found"
        );
      }
      // Check for circular hierarchy
      const createsCycle =
        await wouldCreateCycle(
          categoryId,
          parentId
        );
      if (createsCycle) {
        return errorResponse(
          400,
          "Invalid parent category. This would create a circular category hierarchy."
        );
      }
      // Parent cannot already be Level 3
      const parentLevel =
        await getCategoryLevel(
          parentId
        );
      if (parentLevel >= 3) {
        return errorResponse(
          400,
          "Maximum category depth is 3 levels"
        );
      }
    }
    // --------------------------------------------------
    // IMPORTANT:
    // Check children when moving category deeper
    // --------------------------------------------------
    /*
     * Example:
     *
     * Level 1 Medical
     * └ Level 2 Instruments
     *    └ Level 3 Scissors
     *
     * If Medical were moved under another Level 1,
     * Scissors would become Level 4.
     *
     * So we must validate the complete subtree.
     */
    const children =
      await prisma.category.findMany({
        where: {
          parentId: categoryId,
        },
        select: {
          id: true,
        },
      });
    if (
      children.length > 0 &&
      parentId !== null
    ) {
      const parentLevel =
        await getCategoryLevel(
          parentId
        );
      /*
       * Moving a category that already has children:
       *
       * parent Level 1 =>
       * current category becomes Level 2
       * children become Level 3 => OK
       *
       * parent Level 2 =>
       * current becomes Level 3
       * children become Level 4 => NOT OK
       */
      if (parentLevel >= 2) {
        return errorResponse(
          400,
          "This category has subcategories and cannot be moved here because it would create more than 3 category levels."
        );
      }
    }
    // --------------------------------------------------
    // Check duplicate title
    // --------------------------------------------------
    const existingTitle =
      await prisma.category.findFirst({
        where: {
          id: {
            not: categoryId,
          },
          title: {
            equals: title,
            mode: "insensitive",
          },
        },
      });
    if (existingTitle) {
      return errorResponse(
        400,
        "Category title already exists"
      );
    }
    // --------------------------------------------------
    // Check duplicate slug
    // --------------------------------------------------
    const existingSlug =
      await prisma.category.findFirst({
        where: {
          id: {
            not: categoryId,
          },
          slug,
        },
      });
    if (existingSlug) {
      return errorResponse(
        400,
        "Category slug already exists"
      );
    }
    // --------------------------------------------------
    // Image
    // --------------------------------------------------
    let imageUrl =
      category.img;
    if (file instanceof File) {
      // Upload new image FIRST
      const newImageUrl =
        await uploadImageToCloudinary(
          file,
          "categories"
        );
      /*
       * Delete old image after the new one
       * has uploaded successfully.
       *
       * This is safer than deleting the old
       * image before upload.
       */
      if (category.img) {
        try {
          await deleteImageFromCloudinary(
            category.img
          );
        } catch (error) {
          console.error(
            "Error deleting old category image:",
            error
          );
        }
      }
      imageUrl =
        newImageUrl;
    }
    // --------------------------------------------------
    // Update category
    // --------------------------------------------------
    const updatedCategory =
      await prisma.category.update({
        where: {
          id: categoryId,
        },
        data: {
          title,
          slug,
          description: desc,
          img: imageUrl,
          parentId,
        },
      });
    revalidateTag(
      "categories",
      { expire: 0 }
    );
    return successResponse(
      200,
      "Category updated successfully",
      updatedCategory
    );
  } catch (error: any) {
    console.error(
      "Error updating category:",
      error?.stack || error
    );
    return errorResponse(
      500,
      error?.message ||
        "Internal server error"
    );
  }
}