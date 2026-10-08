"use server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a terms condition
export async function createTermsCondition(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const description = formData.get("description") as string;

    // check if required fields are present
    if (!title || !description) {
      return errorResponse(400, "Title and description are required");
    }

    // create terms condition
    const termsCondition = await prisma.termsConditions.create({
      data: {
        title,
        subtitle,
        description,
      },
    });

    // revalidate cache
    revalidateTag("terms-condition", { expire: 0 });

    // return success response
    return successResponse(201, "Terms condition created successfully", termsCondition);
  } catch (error: any) {
    console.error("Error creating terms condition:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update terms condition
export async function updateTermsCondition(termsConditionId: string, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const description = formData.get("description") as string;

    // check if required fields are present
    if (!title || !description) {
      return errorResponse(400, "Title and description are required");
    }

    // update terms condition
    const termsCondition = await prisma.termsConditions.update({
      where: {
        id: parseInt(termsConditionId),
      },
      data: {
        title,
        subtitle,
        description,
      },
    });

    // revalidate cache
    revalidateTag("terms-condition", { expire: 0 });

    // return success response
    return successResponse(200, "Terms condition updated successfully", termsCondition);
  } catch (error: any) {
    console.error("Error updating terms condition:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};
