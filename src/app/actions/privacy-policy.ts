"use server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";


// create a privacy policy
export async function createPrivacyPolicy(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // check if required fields are present
    if (!title || !description) {
      return errorResponse(400, "Title and description are required");
    }

    // Check if the privacy policy already exists (case-insensitive)
    const existingPrivacyPolicy = await prisma.privacyPolicy.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });

    // return error if privacy policy already exists
    if (existingPrivacyPolicy) {
      return errorResponse(400, "Privacy policy already exists");
    }

    // create privacy policy
    const privacyPolicy = await prisma.privacyPolicy.create({
      data: {
        title,
        description,
      },
    });

    // revalidate cache
    revalidateTag("privacy-policy", { expire: 0 });

    // return success response
    return successResponse(201, "Privacy policy created successfully", privacyPolicy);
  } catch (error: any) {
    console.error("Error creating privacy policy:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update privacy policy
export async function updatePrivacyPolicy(policyId: string, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // check if required fields are present
    if (!title || !description) {
      return errorResponse(400, "Title and description are required");
    }

    // update privacy policy
    const privacyPolicy = await prisma.privacyPolicy.update({
      where: {
        id: parseInt(policyId),
      },
      data: {
        title,
        description,
      },
    });

    // revalidate cache
    revalidateTag("privacy-policy", { expire: 0 });

    // return success response
    return successResponse(200, "Privacy policy updated successfully", privacyPolicy);
  } catch (error: any) {
    console.error("Error updating privacy policy:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};
