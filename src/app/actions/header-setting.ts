"use server";

import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create header setting
export const createHeaderSetting = async (formData: FormData) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const headerText = formData.get("headerText") as string;
    const headerTextTwo = formData.get("headerTextTwo") as string;
    const headerLogo = formData.get("headerLogo");
    const emailLogo = formData.get("emailLogo");

    let headerLogoUrl: string | null = null;
    let emailLogoUrl: string | null = null;

    const existingHeaderSetting = await prisma.headerSetting.findFirst();

    // Handle headerLogo - can be File or string
    if (headerLogo) {
      if (headerLogo instanceof File && headerLogo.size > 0) {
        if (existingHeaderSetting?.headerLogo) {
          await deleteImageFromCloudinary(existingHeaderSetting.headerLogo);
        }
        headerLogoUrl = await uploadImageToCloudinary(headerLogo, "header");
      } else if (typeof headerLogo === "string" && headerLogo.trim() !== "") {
        headerLogoUrl = headerLogo; // Use the string directly if it's already a URL
      }
    }

    // Handle emailLogo - can be File or string
    if (emailLogo) {
      if (emailLogo instanceof File && emailLogo.size > 0) {
        if (existingHeaderSetting?.emailLogo) {
          await deleteImageFromCloudinary(existingHeaderSetting.emailLogo);
        }
        emailLogoUrl = await uploadImageToCloudinary(emailLogo, "email");
      } else if (typeof emailLogo === "string" && emailLogo.trim() !== "") {
        emailLogoUrl = emailLogo; // Use the string directly if it's already a URL
      }
    }

    // save to database
    const headerSetting = await prisma.headerSetting.create({
      data: {
        headerText,
        headerTextTwo,
        headerLogo: headerLogoUrl,
        emailLogo: emailLogoUrl,
      },
    });

    revalidateTag("header-setting", { expire: 0 });
    return successResponse(201, "Header Setting created successfully", headerSetting);
  } catch (error: any) {
    console.error("Error creating Header setting:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update header setting
export const updateHeaderSetting = async (
  headerSettingId: number,
  formData: FormData
) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!headerSettingId) {
      return errorResponse(400, "Header Setting ID is required");
    }

    const headerSetting = await prisma.headerSetting.findUnique({
      where: { id: headerSettingId },
    });

    if (!headerSetting) {
      return errorResponse(404, "Header Setting not found");
    }

    const headerText = formData.get("headerText") as string;
    const headerTextTwo = formData.get("headerTextTwo") as string;
    const headerLogo = formData.get("headerLogo");
    const emailLogo = formData.get("emailLogo");

    const existingHeaderSetting = await prisma.headerSetting.findFirst();

    let headerLogoUrl: string | null = null;
    let emailLogoUrl: string | null = null;

    // Handle headerLogo - can be File or string
    if (headerLogo) {
      if (headerLogo instanceof File && headerLogo.size > 0) {
        if (existingHeaderSetting?.headerLogo) {
          await deleteImageFromCloudinary(existingHeaderSetting.headerLogo);
        }
        headerLogoUrl = await uploadImageToCloudinary(headerLogo, "header");
      } else if (typeof headerLogo === "string" && headerLogo.trim() !== "") {
        // If there's an existing logo and it's being replaced
        if (headerSetting.headerLogo && headerSetting.headerLogo !== headerLogo) {
          await deleteImageFromCloudinary(headerSetting.headerLogo);
        }
        headerLogoUrl = headerLogo;
      }
    }

    // Handle emailLogo - can be File or string
    if (emailLogo) {
      if (emailLogo instanceof File && emailLogo.size > 0) {
        if (existingHeaderSetting?.emailLogo) {
          await deleteImageFromCloudinary(existingHeaderSetting.emailLogo);
        }
        emailLogoUrl = await uploadImageToCloudinary(emailLogo, "email");
      } else if (typeof emailLogo === "string" && emailLogo.trim() !== "") {
        emailLogoUrl = emailLogo; // Use the string directly if it's already a URL
      }
    }

    const updatedHeaderSetting = await prisma.headerSetting.update({
      where: { id: headerSettingId },
      data: {
        headerText,
        headerTextTwo,
        headerLogo: headerLogoUrl,
        emailLogo: emailLogoUrl,
      },
    });

    revalidateTag("header-setting", { expire: 0 });
    return successResponse(
      200,
      "Header Setting updated successfully",
      updatedHeaderSetting
    );
  } catch (error: any) {
    console.error("Error updating Header setting:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

