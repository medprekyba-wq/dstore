import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";

export const getTestimonials = async () => {
  "use cache";
  cacheTag("testimonials");
  return await prisma.testimonial.findMany();
};
