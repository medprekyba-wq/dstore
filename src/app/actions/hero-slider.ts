"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";


// create hero slider
export const createHeroSlider = async (formData: FormData) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const discount = formData.get("discount") as string;
    const productSlug = formData.get("productSlug") as string;

    if (!title || !slug || !file || !productSlug || !discount) {
      return errorResponse(400, "All fields are required");
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
    const existingSliderItem = await prisma.heroSlider.findFirst({
      where: {
        OR: [
          {
            slug: {
              equals: slug,
              mode: "insensitive",
            },
          },
          {
            sliderName: {
              equals: title,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (existingSliderItem) {
      return errorResponse(400, "Hero slug and title already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file, "hero-sliders");

    // Save hero slider to database
    const sliderItem = await prisma.heroSlider.create({
      data: {
        sliderName: title,
        slug,
        productSlug,
        discountRate: Number(discount),
        sliderImage: imageUrl
      },
    });
    revalidateTag("heroSliders", { expire: 0 });
    return successResponse(201, "Hero slider created successfully", sliderItem);
  } catch (error: any) {
    console.error("Error creating hero slider:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};


// delete hero slider
export async function deleteHeroSlider(heroSliderId: number) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!heroSliderId) {
      return errorResponse(400, "Hero Slider ID is required");
    }

    // **Find the existing sliderItem**
    const sliderItem = await prisma.heroSlider.findUnique({
      where: { id: heroSliderId },
    });

    if (!sliderItem) {
      return errorResponse(404, "Hero Slider not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(sliderItem.sliderImage);
    // Delete hero slider from database
    await prisma.heroSlider.delete({ where: { id: heroSliderId } });

    revalidateTag("heroSliders", { expire: 0 });
    return successResponse(200, "Hero Slider deleted successfully");
  } catch (error: any) {
    console.error("Error deleting hero slider:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update hero slider
export async function updateHeroSlider(heroSliderId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");


    if (!heroSliderId) {
      return errorResponse(400, "Hero Slider ID is required");
    }

    const title = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const discount = formData.get("discount") as string;
    const productSlug = formData.get("productSlug") as string;

    if (!title || !slug || !file || !productSlug || !discount) {
      return errorResponse(400, "All fields are required");
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

    // **Find the existing sliderItem**
    const sliderItem = await prisma.heroSlider.findUnique({
      where: { id: heroSliderId },
    });

    if (!sliderItem) {
      return errorResponse(404, "Hero Slider not found");
    }

    let imageUrl = sliderItem.sliderImage; // Default to existing image

    if (file instanceof File) {
      // **Delete old image only if it exists**
      if (sliderItem.sliderImage) {
        try {
          await deleteImageFromCloudinary(sliderItem.sliderImage);
        } catch (err) {
          console.error("Error deleting old image from Cloudinary:", err);
        }
      }

      // **Upload new image**
      imageUrl = await uploadImageToCloudinary(file, "hero-sliders");
    }

    // **Update hero slider in database**
    const updatedHeroSlider = await prisma.heroSlider.update({
      where: { id: heroSliderId },
      data: {
        sliderName: title,
        slug,
        productSlug,
        discountRate: Number(discount),
        sliderImage: imageUrl,
      },
    });

    revalidateTag("heroSliders", { expire: 0 });

    return successResponse(200, "hero Slider updated successfully", updatedHeroSlider);
  } catch (error: any) {
    console.error("Error updating hero slider:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}