import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

// get all seo settings
export const getSeoSettings = async () => {
  "use cache";
  cacheTag("seo-setting");
  return await prisma.seoSetting.findFirst();
};

export const getSiteName = async () => {
  "use cache";
  cacheTag("site-name");
  const siteName = await prisma.seoSetting.findFirst({
    select: {
      siteName: true,
    },
  });
  return siteName
    ? siteName.siteName
    : process.env.SITE_NAME
      ? process.env.SITE_NAME
      : "Cozy-commerce";
};

// get logo 
export const getLogo = async () => {
  "use cache";
  cacheTag("header-logo");
  const headerLogo = await prisma.headerSetting.findFirst({
    select: {
      headerLogo: true,
    },
  });
  const logo = headerLogo
    ? headerLogo.headerLogo
    : "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746335068/header/tsvfm6pvfwpbpyqdtxwn.svg";
  return logo;
};

// get email logo
export const getEmailLogo = async () => {
  "use cache";
  cacheTag("email-logo");
  const emailLogo = await prisma.headerSetting.findFirst({
    select: {
      emailLogo: true,
    },
  });
  const logo = emailLogo
    ? emailLogo.emailLogo
    : "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746693785/logo_ouegg7.png";
  return logo;
};

