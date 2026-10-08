"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a hero banner
export async function createHeroBanner(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const productSlug = formData.get("productSlug") as string;
    const subtitle = formData.get("subtitle") as string;

    if (!file || !productSlug || !subtitle || !slug) {
      return errorResponse(400, "File, productSlug, subtitle and slug are required");
    }

    const existingProductItem = await prisma.product.findFirst({
      where: {
        slug: {
          equals: productSlug,
          mode: "insensitive",
        },
      },
    });

    if (!existingProductItem) {
      return errorResponse(400, "Product not found");
    }

    // Check if the hero already exists (case-insensitive)
    const existingBannerItem = await prisma.heroBanner.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
      },
    });

    if (existingBannerItem) {
      return errorResponse(400, "Hero slug already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file, "hero-banners");

    // Save hero banner to database
    const bannerItem = await prisma.heroBanner.create({
      data: {
        bannerName: title,
        subtitle,
        slug,
        productSlug,
        bannerImage: imageUrl
      },
    });
    revalidateTag("heroBanners", { expire: 0 });
    return successResponse(201, "Hero banner created successfully", bannerItem);
  } catch (error: any) {
    console.error("Error creating hero banner:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// delete a hero banner
export async function deleteHeroBanner(heroBannerId: number) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!heroBannerId) {
      return errorResponse(400, "Hero Banner ID is required");
    }

    // **Find the existing bannerItem**
    const bannerItem = await prisma.heroBanner.findUnique({
      where: { id: heroBannerId },
    });

    if (!bannerItem) {
      return errorResponse(404, "Hero Banner not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(bannerItem.bannerImage);
    // Delete hero banner from database
    await prisma.heroBanner.delete({ where: { id: heroBannerId } });

    revalidateTag("heroBanners", { expire: 0 });
    return successResponse(200, "Hero Banner deleted successfully");
  } catch (error: any) {
    console.error("Error deleting hero banner:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// update a hero banner
export async function updateHeroBanner(heroBannerId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!heroBannerId) {
      return errorResponse(400, "Hero Banner ID is required");
    }

    const title = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const productSlug = formData.get("productSlug") as string;
    const subtitle = formData.get("subtitle") as string;

    if (!file || !productSlug || !subtitle || !slug) {
      return errorResponse(400, "File, productSlug, subtitle and slug are required");
    }

    const existingProductItem = await prisma.product.findFirst({
      where: {
        slug: {
          equals: productSlug,
          mode: "insensitive",
        },
      },
    });

    if (!existingProductItem) {
      return errorResponse(400, "Product not found");
    }

    // **Find the existing bannerItem**
    const bannerItem = await prisma.heroBanner.findUnique({
      where: { id: heroBannerId },
    });

    if (!bannerItem) {
      return errorResponse(404, "Hero Banner not found");
    }

    let imageUrl = bannerItem.bannerImage; // Default to existing image

    if (file instanceof File) {
      // **Delete old image only if it exists**
      if (bannerItem.bannerImage) {
        try {
          await deleteImageFromCloudinary(bannerItem.bannerImage);
        } catch (err) {
          console.error("Error deleting old image from Cloudinary:", err);
        }
      }

      // **Upload new image**
      imageUrl = await uploadImageToCloudinary(file, "hero-banners");
    }

    // **Update hero banner in database**
    const updatedHeroBanner = await prisma.heroBanner.update({
      where: { id: heroBannerId },
      data: {
        bannerName: title,
        subtitle,
        slug,
        productSlug,
        bannerImage: imageUrl
      },
    });

    revalidateTag("heroBanners", { expire: 0 });

    return successResponse(200, "hero Banner updated successfully", updatedHeroBanner);
  } catch (error: any) {
    console.error("Error updating hero banner:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}