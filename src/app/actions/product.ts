"use server";

import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag, updateTag } from "next/cache";

// ======================================================
// TYPES
// ======================================================

type VariantOptionInput = {
  id?: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  position: number;
};

type VariantGroupInput = {
  id?: string;
  name: string;
  showName: boolean;
  position: number;
  options: VariantOptionInput[];
};

type AdditionalInformationInput = {
  name: string;
  description: string;
};

type AttributeValueInput = {
  id: string;
  title: string;
};

type CustomAttributeInput = {
  attributeName: string;
  attributeValues: AttributeValueInput[];
};

// ======================================================
// GENERAL HELPERS
// ======================================================

function getOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseJsonField<T>(
  formData: FormData,
  key: string,
  fallback: T,
): T {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return JSON.parse(value) as T;
}

// ======================================================
// VARIANT HELPERS
// ======================================================

function normalizeVariantGroups(
  groups: VariantGroupInput[],
): VariantGroupInput[] {
  return groups.map((group, groupIndex) => {
    const name = String(group.name || "").trim();

    if (!name) {
      throw new Error("Each variant group must have a name");
    }

    if (!Array.isArray(group.options) || group.options.length === 0) {
      throw new Error(
        `Variant group "${name}" must contain at least one option`,
      );
    }

    const options = group.options.map((option, optionIndex) => {
      const optionName = String(option.name || "").trim();

      if (!optionName) {
        throw new Error(
          `All options in variant group "${name}" must have a name`,
        );
      }

      const numericAdjustment = Number(option.priceAdjustment);

      if (!Number.isFinite(numericAdjustment)) {
        throw new Error(
          `Invalid price adjustment for option "${optionName}"`,
        );
      }

      return {
        ...(option.id ? { id: option.id } : {}),
        name: optionName,
        priceAdjustment: numericAdjustment,
        isDefault: Boolean(option.isDefault),
        position: optionIndex,
      };
    });

    // Guarantee exactly one default option per group.
    const defaultIndexes = options
      .map((option, index) => (option.isDefault ? index : -1))
      .filter((index) => index >= 0);

    if (defaultIndexes.length === 0) {
      options[0].isDefault = true;
    } else if (defaultIndexes.length > 1) {
      const firstDefaultIndex = defaultIndexes[0];

      options.forEach((option, index) => {
        option.isDefault = index === firstDefaultIndex;
      });
    }

    return {
      ...(group.id ? { id: group.id } : {}),
      name,
      showName: group.showName ?? true,
      position: groupIndex,
      options,
    };
  });
}

// ======================================================
// TIPTAP IMAGE HELPERS
// ======================================================

function extractImageUrls(html?: string | null) {
  if (!html) return new Set<string>();

  const urls = new Set<string>();
  const imageRegex =
    /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(html)) !== null) {
    if (match[1]) {
      urls.add(match[1]);
    }
  }

  return urls;
}

function getRichTextImageUrls(
  description?: string | null,
  features?: string | null,
  body?: string | null,
) {
  return new Set([
    ...extractImageUrls(description),
    ...extractImageUrls(features),
    ...extractImageUrls(body),
  ]);
}

// ======================================================
// UPLOAD TIPTAP IMAGE
// ======================================================

export async function uploadTiptapImage(formData: FormData) {
  try {
    const session = await authenticate();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return {
        success: false,
        message: "No image provided",
      };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        message: "Invalid image file",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: "Image must be smaller than 10 MB",
      };
    }

    const imageUrl = await uploadImageToCloudinary(
      file,
      "products/descriptions",
    );

    return {
      success: true,
      url: imageUrl,
    };
  } catch (error: any) {
    console.error(
      "Tiptap image upload error:",
      error?.stack || error,
    );

    return {
      success: false,
      message:
        error?.message || "Failed to upload image",
    };
  }
}

// ======================================================
// CREATE PRODUCT
// ======================================================

export async function createProduct(formData: FormData) {
  try {
    const session = await authenticate();

    if (!session) {
      return errorResponse(401, "Unauthorized");
    }

    // --------------------------------------------------
    // Basic fields
    // --------------------------------------------------

    const title =
      (formData.get("title") as string | null)?.trim() || "";

    const price = Number(
      formData.get("price") as string,
    );

    const discountedPriceRaw = getOptionalString(
      formData,
      "discountedPrice",
    );

    const discountedPrice =
      discountedPriceRaw !== null
        ? Number(discountedPriceRaw)
        : null;

    const categoryIdRaw =
      (formData.get("categoryId") as string | null) || "";

    const categoryId = Number(categoryIdRaw);

    const slug =
      (formData.get("slug") as string | null)?.trim() || "";

    const sku = getOptionalString(formData, "sku");

    const shortDescription =
      (
        formData.get(
          "shortDescription",
        ) as string | null
      )?.trim() || "";

    const quantity = Number.parseInt(
      (formData.get("quantity") as string) || "",
      10,
    );

    const description =
      getOptionalString(formData, "description");

    const body =
      getOptionalString(formData, "body");

    const features =
      getOptionalString(formData, "features");

    const manufacturer =
      getOptionalString(formData, "manufacturer");

    // --------------------------------------------------
    // JSON fields
    // --------------------------------------------------

    const tags = parseJsonField<string[]>(
      formData,
      "tags",
      [],
    );

    const offers = parseJsonField<string[]>(
      formData,
      "offers",
      [],
    );

    const additionalInformation =
      parseJsonField<AdditionalInformationInput[]>(
        formData,
        "additionalInformation",
        [],
      );

    const customAttributes =
      parseJsonField<CustomAttributeInput[]>(
        formData,
        "customAttributes",
        [],
      );

    const rawVariantGroups =
      parseJsonField<VariantGroupInput[]>(
        formData,
        "variantGroups",
        [],
      );

    const variantGroups =
      normalizeVariantGroups(rawVariantGroups);

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (
      !title ||
      !slug ||
      !shortDescription ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return errorResponse(
        400,
        "Missing or invalid required fields",
      );
    }

    if (
      discountedPrice !== null &&
      (!Number.isFinite(discountedPrice) ||
        discountedPrice < 0 ||
        discountedPrice > price)
    ) {
      return errorResponse(
        400,
        "Invalid discounted price",
      );
    }

    // --------------------------------------------------
    // Product images
    // --------------------------------------------------

    const imageFiles = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File);

    if (imageFiles.length === 0) {
      return errorResponse(
        400,
        "At least one image is required",
      );
    }

    // --------------------------------------------------
    // Create product + relational data
    // --------------------------------------------------

    const product = await prisma.product.create({
      data: {
        title,
        price,
        discountedPrice,
        categoryId,
        tags,
        description,
        shortDescription,
        offers,
        slug,
        sku,
        body,
        features,
        manufacturer,
        quantity,

        variantGroups: {
          create: variantGroups.map((group) => ({
            name: group.name,
            showName: group.showName,
            position: group.position,

            options: {
              create: group.options.map((option) => ({
                name: option.name,
                priceAdjustment:
                  option.priceAdjustment,
                isDefault: option.isDefault,
                position: option.position,
              })),
            },
          })),
        },

        additionalInformation: {
          create: additionalInformation.map((info) => ({
            name: info.name,
            description: info.description,
          })),
        },

        customAttributes: {
          create: customAttributes.map((attr) => ({
            attributeName: attr.attributeName,

            attributeValues: {
              create: attr.attributeValues.map(
                (value) => ({
                  id: value.id,
                  title: value.title,
                }),
              ),
            },
          })),
        },
      },
    });

    // --------------------------------------------------
    // Upload product images
    // --------------------------------------------------

    for (const file of imageFiles) {
      const imageUrl =
        await uploadImageToCloudinary(
          file,
          "products",
        );

      await prisma.productImage.create({
        data: {
          image: imageUrl,
          productId: product.id,
        },
      });
    }

    // --------------------------------------------------
    // Cache
    // --------------------------------------------------

    revalidateTag("products", {
      expire: 0,
    });

    return successResponse(
      201,
      "Product created successfully",
      {
        ...product,
        price: product.price.toNumber(),
        discountedPrice:
          product.discountedPrice?.toNumber() ?? null,
      },
    );
  } catch (error: any) {
    console.error(
      "Error creating product:",
      error?.stack || error,
    );

    return errorResponse(
      500,
      error?.message || "Internal server error",
    );
  }
}

// ======================================================
// DELETE PRODUCT
// ======================================================

export async function deleteProduct(
  productId: string,
) {
  try {
    const session = await authenticate();

    if (!session) {
      return errorResponse(
        401,
        "Unauthorized",
      );
    }

    if (!productId) {
      return errorResponse(
        400,
        "Product ID is required",
      );
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        include: {
          variantGroups: {
            include: {
              options: true,
            },
          },
          productImages: true,
          customAttributes: true,
          additionalInformation: true,
        },
      });

    if (!existingProduct) {
      return errorResponse(
        404,
        "Product not found",
      );
    }

    // --------------------------------------------------
    // Delete product images from Cloudinary
    // --------------------------------------------------

    for (const image of existingProduct.productImages) {
      try {
        await deleteImageFromCloudinary(
          image.image,
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting image from Cloudinary:",
          cloudinaryError,
        );
      }
    }

    // --------------------------------------------------
    // Delete rich-text images from Cloudinary
    // --------------------------------------------------

    const richTextImageUrls =
      getRichTextImageUrls(
        existingProduct.description,
        existingProduct.features,
        existingProduct.body,
      );

    for (const imageUrl of richTextImageUrls) {
      try {
        await deleteImageFromCloudinary(
          imageUrl,
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting rich-text image from Cloudinary:",
          imageUrl,
          cloudinaryError,
        );
      }
    }

    // --------------------------------------------------
    // Delete DB relations and product
    // --------------------------------------------------

    await prisma.$transaction(async (tx) => {
      // Variant options are deleted automatically through
      // ProductVariantGroup -> ProductVariantOption onDelete: Cascade.
      await tx.productVariantGroup.deleteMany({
        where: {
          productId,
        },
      });

      const customAttributes =
        await tx.customAttribute.findMany({
          where: {
            productId,
          },
          select: {
            id: true,
          },
        });

      if (customAttributes.length > 0) {
        await tx.attributeValue.deleteMany({
          where: {
            attributeId: {
              in: customAttributes.map(
                (attribute) => attribute.id,
              ),
            },
          },
        });
      }

      await tx.customAttribute.deleteMany({
        where: {
          productId,
        },
      });

      await tx.additionalInformation.deleteMany({
        where: {
          productId,
        },
      });

      await tx.productImage.deleteMany({
        where: {
          productId,
        },
      });

      await tx.product.delete({
        where: {
          id: productId,
        },
      });
    });

    revalidateTag("products", {
      expire: 0,
    });

    return successResponse(
      200,
      "Product and related data deleted successfully",
    );
  } catch (error: any) {
    console.error(
      "Error deleting product:",
      error?.stack || error,
    );

    return errorResponse(
      500,
      error?.message || "Internal server error",
    );
  }
}

// ======================================================
// UPDATE PRODUCT
// ======================================================

export async function updateProduct(
  productId: string,
  formData: FormData,
) {
  try {
    const session = await authenticate();

    if (!session) {
      return errorResponse(
        401,
        "Unauthorized",
      );
    }

    // --------------------------------------------------
    // Basic fields
    // --------------------------------------------------

    const title =
      (formData.get("title") as string | null)?.trim() || "";

    const price = Number(
      formData.get("price") as string,
    );

    const discountedPriceRaw = getOptionalString(
      formData,
      "discountedPrice",
    );

    const discountedPrice =
      discountedPriceRaw !== null
        ? Number(discountedPriceRaw)
        : null;

    const categoryIdRaw =
      (formData.get("categoryId") as string | null) || "";

    const categoryId = Number(categoryIdRaw);

    const slug =
      (formData.get("slug") as string | null)?.trim() || "";

    const sku = getOptionalString(formData, "sku");

    const shortDescription =
      (
        formData.get(
          "shortDescription",
        ) as string | null
      )?.trim() || "";

    const quantity = Number.parseInt(
      (formData.get("quantity") as string) || "",
      10,
    );

    const description =
      getOptionalString(formData, "description");

    const body =
      getOptionalString(formData, "body");

    const features =
      getOptionalString(formData, "features");

    const manufacturer =
      getOptionalString(formData, "manufacturer");

    // --------------------------------------------------
    // JSON fields
    // --------------------------------------------------

    const tags = parseJsonField<string[]>(
      formData,
      "tags",
      [],
    );

    const offers = parseJsonField<string[]>(
      formData,
      "offers",
      [],
    );

    const additionalInformation =
      parseJsonField<AdditionalInformationInput[]>(
        formData,
        "additionalInformation",
        [],
      );

    const customAttributes =
      parseJsonField<CustomAttributeInput[]>(
        formData,
        "customAttributes",
        [],
      );

    const rawVariantGroups =
      parseJsonField<VariantGroupInput[]>(
        formData,
        "variantGroups",
        [],
      );

    const variantGroups =
      normalizeVariantGroups(rawVariantGroups);

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (
      !productId ||
      !title ||
      !slug ||
      !shortDescription ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return errorResponse(
        400,
        "Missing or invalid required fields",
      );
    }

    if (
      discountedPrice !== null &&
      (!Number.isFinite(discountedPrice) ||
        discountedPrice < 0 ||
        discountedPrice > price)
    ) {
      return errorResponse(
        400,
        "Invalid discounted price",
      );
    }

    // --------------------------------------------------
    // Check product
    // --------------------------------------------------

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        include: {
          variantGroups: {
            include: {
              options: true,
            },
          },
          productImages: true,
          additionalInformation: true,
          customAttributes: true,
        },
      });

    if (!existingProduct) {
      return errorResponse(
        404,
        "Product not found",
      );
    }

    // ==================================================
    // TIPTAP / RICH-TEXT IMAGES
    // ==================================================

    const oldRichTextImageUrls =
      getRichTextImageUrls(
        existingProduct.description,
        existingProduct.features,
        existingProduct.body,
      );

    const newRichTextImageUrls =
      getRichTextImageUrls(
        description,
        features,
        body,
      );

    const removedRichTextImageUrls = [
      ...oldRichTextImageUrls,
    ].filter(
      (url) => !newRichTextImageUrls.has(url),
    );

    // ==================================================
    // PRODUCT IMAGES
    // ==================================================

    const imageFiles = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File);

    const existingImages = formData
      .getAll("existingImages")
      .filter(
        (image): image is string =>
          typeof image === "string",
      );

    const imagesToDelete =
      existingProduct.productImages.filter(
        (image) =>
          !existingImages.includes(
            image.image,
          ),
      );

    // --------------------------------------------------
    // Delete removed product images from Cloudinary
    // --------------------------------------------------

    for (const image of imagesToDelete) {
      try {
        await deleteImageFromCloudinary(
          image.image,
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting image from Cloudinary:",
          cloudinaryError,
        );
      }
    }

    // --------------------------------------------------
    // Upload new product images before DB transaction
    // --------------------------------------------------

    const uploadedImageUrls: string[] = [];

    for (const file of imageFiles) {
      const imageUrl =
        await uploadImageToCloudinary(
          file,
          "products",
        );

      uploadedImageUrls.push(imageUrl);
    }

    // ==================================================
    // DATABASE UPDATE
    // ==================================================

    const updatedProduct =
      await prisma.$transaction(async (tx) => {
        // ------------------------------------------------
        // Variant groups
        // ------------------------------------------------
        // Delete/recreate is deliberate here. It keeps the
        // admin update logic simple and avoids synchronizing
        // nested group/option IDs manually.

        await tx.productVariantGroup.deleteMany({
          where: {
            productId,
          },
        });

        for (const group of variantGroups) {
          await tx.productVariantGroup.create({
            data: {
              name: group.name,
              showName: group.showName,
              position: group.position,
              productId,

              options: {
                create: group.options.map(
                  (option) => ({
                    name: option.name,
                    priceAdjustment:
                      option.priceAdjustment,
                    isDefault:
                      option.isDefault,
                    position:
                      option.position,
                  }),
                ),
              },
            },
          });
        }

        // ------------------------------------------------
        // Product images
        // ------------------------------------------------

        if (imagesToDelete.length > 0) {
          await tx.productImage.deleteMany({
            where: {
              id: {
                in: imagesToDelete.map(
                  (image) => image.id,
                ),
              },
            },
          });
        }

        for (const imageUrl of uploadedImageUrls) {
          await tx.productImage.create({
            data: {
              image: imageUrl,
              productId,
            },
          });
        }

        // ------------------------------------------------
        // Additional information
        // ------------------------------------------------

        await tx.additionalInformation.deleteMany({
          where: {
            productId,
          },
        });

        if (additionalInformation.length > 0) {
          await tx.additionalInformation.createMany({
            data: additionalInformation.map(
              (info) => ({
                name: info.name,
                description:
                  info.description,
                productId,
              }),
            ),
          });
        }

        // ------------------------------------------------
        // Custom attributes
        // ------------------------------------------------

        const existingCustomAttributes =
          await tx.customAttribute.findMany({
            where: {
              productId,
            },
            select: {
              id: true,
            },
          });

        if (
          existingCustomAttributes.length > 0
        ) {
          await tx.attributeValue.deleteMany({
            where: {
              attributeId: {
                in: existingCustomAttributes.map(
                  (attribute) =>
                    attribute.id,
                ),
              },
            },
          });
        }

        await tx.customAttribute.deleteMany({
          where: {
            productId,
          },
        });

        for (const attr of customAttributes) {
          const createdAttribute =
            await tx.customAttribute.create({
              data: {
                attributeName:
                  attr.attributeName,
                productId,
              },
            });

          if (
            Array.isArray(
              attr.attributeValues,
            ) &&
            attr.attributeValues.length > 0
          ) {
            await tx.attributeValue.createMany({
              data: attr.attributeValues.map(
                (value) => ({
                  id: value.id,
                  title: value.title,
                  attributeId:
                    createdAttribute.id,
                }),
              ),
            });
          }
        }

        // ------------------------------------------------
        // Main product
        // ------------------------------------------------

        return tx.product.update({
          where: {
            id: productId,
          },

          data: {
            title,
            price,
            discountedPrice,
            categoryId,
            tags,
            description,
            shortDescription,
            offers,
            slug,

            // Sending null lets an admin clear an existing SKU.
            sku,

            body,
            features,
            manufacturer,
            quantity,
          },
        });
      });

    // ==================================================
    // DELETE REMOVED TIPTAP IMAGES
    // ==================================================

    for (const imageUrl of removedRichTextImageUrls) {
      try {
        await deleteImageFromCloudinary(
          imageUrl,
        );
      } catch (cloudinaryError) {
        console.error(
          "Error deleting removed Tiptap image from Cloudinary:",
          imageUrl,
          cloudinaryError,
        );
      }
    }

    // ==================================================
    // CACHE
    // ==================================================

    updateTag("products");

    return successResponse(
      200,
      "Product updated successfully",
      {
        ...updatedProduct,
        price:
          updatedProduct.price.toNumber(),
        discountedPrice:
          updatedProduct.discountedPrice?.toNumber() ??
          null,
      },
    );
  } catch (error: any) {
    console.error(
      "Error updating product:",
      error?.stack || error,
    );

    return errorResponse(
      500,
      error?.message ||
        "Internal server error",
    );
  }
}
