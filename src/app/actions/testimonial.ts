"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { updateTag } from "next/cache";

export async function createTestimonial(formData: FormData) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    const author = formData.get("author") as string;
    const designation = formData.get("designation") as string | null;
    const content = formData.get("content") as string;
    const rating = formData.get("rating") as string;
    const file = formData.get("avatar") as File | null;

    if (!author || !content || !rating) {
      return errorResponse(400, "Missing required fields");
    }

    let avatarUrl: string | null = null;
    if (file && file instanceof File && file.size > 0) {
      avatarUrl = await uploadImageToCloudinary(file);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        author,
        designation,
        content,
        rating: Number(rating),
        avatar: avatarUrl,
      },
    });
    
    updateTag('testimonials')
    return successResponse(200, "Testimonial created successfully", testimonial);
  } catch (error: any) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    const author = formData.get("author") as string;
    const designation = formData.get("designation") as string | null;
    const content = formData.get("content") as string;
    const rating = formData.get("rating") as string;
    const file = formData.get("avatar") as File | null;

    console.log(rating,'rating')

    if (!id || !author || !content || !rating) {
      return errorResponse(400, "Missing required fields");
    }

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return errorResponse(404, "Testimonial not found");
    }

    let avatarUrl = existingTestimonial.avatar;

    if (file && file instanceof File && file.size > 0) {
      if (existingTestimonial.avatar) {
        try {
          await deleteImageFromCloudinary(existingTestimonial.avatar);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      avatarUrl = await uploadImageToCloudinary(file, "testimonials");
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        author,
        designation,
        content,
        rating: Number(rating),
        avatar: avatarUrl,
      },
    });

    updateTag('testimonials')
    return successResponse(200, "Testimonial updated successfully", testimonial);
  } catch (error: any) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return errorResponse(404, "Testimonial not found");
    }

    if (existingTestimonial.avatar) {
      try {
        await deleteImageFromCloudinary(existingTestimonial.avatar);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    updateTag('testimonials')
    return successResponse(200, "Testimonial deleted successfully");
  } catch (error: any) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
