"use server";

import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";


// create a coupon 
export async function createCoupon(formData: FormData) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    const title = formData.get('name') as string;
    const code = formData.get('code') as string;
    const discount = formData.get('discount') as string;
    const maxRedemptions = formData.get('maxRedemptions') as string;
    const timesRedemed = formData.get('timesRedemed') as string;

    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        code: code,
      },
    });

    if (existingCoupon) {
      return errorResponse(400, "Coupon code already exists");
    }

    if (!title || !code || !discount || !maxRedemptions) {
      return errorResponse(400, "Title, code, discount and maxRedemptions are required");
    }

    // Save category to database
    const category = await prisma.coupon.create({
      data: {
        name: title,
        code: code,
        discount: Number(discount),
        maxRedemptions: Number(maxRedemptions),
        timesRedemed: Number(timesRedemed),
      },
    });
    revalidateTag('coupons', { expire: 0 });
    return successResponse(201, "Coupon created successfully", category);
  } catch (error: any) {
    console.error("Error creating coupon:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// delete a coupon
export async function deleteCoupon(couponId: string) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!couponId) return errorResponse(400, "Coupon ID is required");

    // **Check if coupon exists**
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) return errorResponse(404, "Coupon not found");


    // **Delete coupon**
    await prisma.coupon.delete({
      where: { id: couponId },
    })
    // revalidateTag('coupons');
    revalidateTag(`coupons`, { expire: 0 });
    return successResponse(200, "Coupon deleted successfully");
  } catch (error: any) {
    console.error("Error deleting coupon:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update a coupon
export async function updateCoupon(couponId: string, formData: FormData) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    if (!couponId) {
      return errorResponse(400, "Coupon ID is required");
    }
    const title = formData.get('name') as string;
    const code = formData.get('code') as string;
    const discount = formData.get('discount') as File;
    const maxRedemptions = formData.get('maxRedemptions') as string;
    const timesRedemed = formData.get('timesRedemed') as string;


    // **Update coupon**
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        name: title,
        code: code,
        discount: Number(discount),
        maxRedemptions: Number(maxRedemptions),
        timesRedemed: Number(timesRedemed),
      },
    });

    revalidateTag(`coupons`, { expire: 0 });
    return successResponse(200, "Coupon updated successfully", updatedCoupon);
  } catch (error: any) {
    console.error("Error updating Coupon:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}


// validate coupon 
export async function validateCoupon(code: string) {
  try {

    if (!code) {
      return errorResponse(400, "Coupon code is required");
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return errorResponse(404, "Invalid coupon code");
    }

    if (coupon.timesRedemed >= coupon.maxRedemptions) {
      return errorResponse(400, "Coupon has reached max usage");
    }

    return successResponse(200, "Coupon validated successfully", {
      discount: coupon.discount,
      code: coupon.code,
    });
  } catch (error: any) {
    console.log("Error validating coupon:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}