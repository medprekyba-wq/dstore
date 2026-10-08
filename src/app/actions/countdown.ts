"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a countdown
export async function createCountdown(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const date = formData.get("countdownDate") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const productSlug = formData.get("productSlug") as string;

    if (!title || !subtitle || !date || !file || !productSlug) {
      return errorResponse(400, "All fields are required");
    }

    // Check if the countdown title already exists (case-insensitive)
    const existingCountdownItem = await prisma.countdown.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });

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

    if (existingCountdownItem) {
      return errorResponse(400, "Countdown title already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file, "hero-banners");

    // Save countdown to database
    const countdownItem = await prisma.countdown.create({
      data: {
        title,
        subtitle,
        countdownDate: new Date(date),
        slug,
        countdownImage: imageUrl,
        productSlug: productSlug,
      },
    });
    revalidateTag("countdowns", { expire: 0 });
    return successResponse(201, "Countdown created successfully", countdownItem);
  } catch (error: any) {
    console.error("Error creating countdown:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update a countdown
export async function updateCountdown(countdownId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");


    if (!countdownId) {
      return errorResponse(400, "Countdown ID is required");
    }

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const date = formData.get("countdownDate") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const productSlug = formData.get("productSlug") as string;

    if (!title || !subtitle || !date || !file || !productSlug) {
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

    // **Find the existing countdownItem**
    const countdownItem = await prisma.countdown.findUnique({
      where: { id: countdownId },
    });

    if (!countdownItem) {
      return errorResponse(404, "Countdown not found");
    }

    let imageUrl = countdownItem.countdownImage; // Default to existing image

    if (file instanceof File) {
      // **Delete old image only if it exists**
      if (countdownItem.countdownImage) {
        try {
          await deleteImageFromCloudinary(countdownItem.countdownImage);
        } catch (err) {
          console.error("Error deleting old image from Cloudinary:", err);
        }
      }

      // **Upload new image**
      imageUrl = await uploadImageToCloudinary(file, "countdowns");
    }

    // **Update countdown in database**
    const updatedCountdown = await prisma.countdown.update({
      where: { id: countdownId },
      data: {
        title,
        subtitle,
        countdownDate: new Date(date),
        slug,
        countdownImage: imageUrl,
        productSlug,
      },
    });

    revalidateTag("countdowns", { expire: 0 });

    return successResponse(200, "countdown updated successfully", updatedCountdown);
  } catch (error: any) {
    console.error("Error updating countdown:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// delete a countdown
export async function deleteCountdown(countdownId: number) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!countdownId) {
      return errorResponse(400, "Countdown ID is required");
    }

    // **Find the existing countdownItem**
    const countdownItem = await prisma.countdown.findUnique({
      where: { id: countdownId },
    });

    if (!countdownItem) {
      return errorResponse(404, "Countdown not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(countdownItem.countdownImage);
    // Delete countdown from database
    await prisma.countdown.delete({ where: { id: countdownId } });

    revalidateTag("countdowns", { expire: 0 });
    return successResponse(200, "Countdown deleted successfully");
  } catch (error: any) {
    console.error("Error deleting countdown:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}