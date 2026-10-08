import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";
import TestimonialForm from "../../_components/TestimonialForm";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Testimonial</h1>
      </div>
      <div className="p-6">
        <TestimonialForm testimonialItem={testimonial} />
      </div>
    </div>
  );
}
