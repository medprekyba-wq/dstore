import TestimonialForm from "../_components/TestimonialForm";

export default function AddTestimonialPage() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Testimonial</h1>
      </div>
      <div className="p-6">
        <TestimonialForm />
      </div>
    </div>
  );
}
