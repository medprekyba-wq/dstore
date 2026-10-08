"use server";

import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create seo setting
export const createSeoSetting = async (formData: FormData) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const favicon = formData.get("favicon");
    const siteName = formData.get("siteName") as string;
    const siteTitle = formData.get("siteTitle") as string;
    const metadescription = formData.get("metadescription") as string;
    const metaImage = formData.get("metaImage");
    const metaKeywords = formData.get("metaKeywords") as string;


    let faviconUrl: string | null = null;
    let metaImageUrl: string | null = null;

    const existingFavicon = await prisma.seoSetting.findFirst();

    // Handle favicon - can be File or string
    if (favicon) {
      if (favicon instanceof File && favicon.size > 0) {
        if (existingFavicon?.favicon) {
          await deleteImageFromCloudinary(existingFavicon.favicon);
        }
        faviconUrl = await uploadImageToCloudinary(favicon, "seo");
      } else if (typeof favicon === "string" && favicon !== "") {
        faviconUrl = favicon; // Use the string directly if it's already a URL
      }
    }

    // Handle metaImage - can be File or string
    if (metaImage) {
      if (metaImage instanceof File && metaImage.size > 0) {
        if (existingFavicon?.metaImage) {
          await deleteImageFromCloudinary(existingFavicon.metaImage);
        }
        metaImageUrl = await uploadImageToCloudinary(metaImage, "seo");
      } else if (typeof metaImage === "string" && metaImage !== "") {
        metaImageUrl = metaImage; // Use the string directly if it's already a URL
      }
    }
    // save to database
    const seoSetting = await prisma.seoSetting.create({
      data: {
        favicon: faviconUrl,
        siteName,
        siteTitle,
        metadescription,
        metaImage: metaImageUrl,
        metaKeywords,
      },
    });

    revalidateTag("seo-setting", { expire: 0 });
    return successResponse(201, "SEO Setting created successfully", seoSetting);
  } catch (error: any) {
    console.error("Error creating SEO setting:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update seo setting
export const updateSeoSetting = async (
  seoSettingId: number,
  formData: FormData
) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!seoSettingId) {
      return errorResponse(400, "SEO Setting ID is required");
    }

    const seoSetting = await prisma.seoSetting.findUnique({
      where: { id: seoSettingId },
    });

    if (!seoSetting) {
      return errorResponse(404, "SEO Setting not found");
    }

    const favicon = formData.get("favicon");
    const siteName = formData.get("siteName") as string;
    const siteTitle = formData.get("siteTitle") as string;
    const metadescription = formData.get("metadescription") as string;
    const metaImage = formData.get("metaImage");
    const metaKeywords = formData.get("metaKeywords") as string;

    let faviconUrl: string | null = null;
    let metaImageUrl: string | null = null;

    // Handle favicon - can be File or string
    if (favicon) {
      if (favicon instanceof File && favicon.size > 0) {
        faviconUrl = await uploadImageToCloudinary(favicon, "seo");
      } else if (typeof favicon === "string" && favicon.trim() !== "") {
        await deleteImageFromCloudinary(seoSetting.favicon as string);
        faviconUrl = favicon;
      }
    }

    // Handle metaImage - can be File or string
    if (metaImage) {
      if (metaImage instanceof File && metaImage.size > 0) {
        metaImageUrl = await uploadImageToCloudinary(metaImage, "seo");
      } else if (typeof metaImage === "string" && metaImage.trim() !== "") {
        await deleteImageFromCloudinary(seoSetting.metaImage as string);
        metaImageUrl = metaImage;
      }
    }

    const updatedSeoSetting = await prisma.seoSetting.update({
      where: { id: seoSettingId },
      data: {
        favicon: faviconUrl,
        siteName,
        siteTitle,
        metadescription,
        metaImage: metaImageUrl,
        metaKeywords,
      },
    });

    revalidateTag("seo-setting", { expire: 0 });
    return successResponse(
      200,
      "SEO Setting updated successfully",
      updatedSeoSetting
    );
  } catch (error: any) {
    console.error("Error updating SEO setting:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};
