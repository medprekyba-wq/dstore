import { getTestimonials } from "@/get-api-data/testimonials";
import TestimonialSlider from "./TestimonialSlider";

const Testimonials = async () => {
  const testimonials = await getTestimonials();

  return (
    <TestimonialSlider testimonials={testimonials} />
  );
};

export default Testimonials;
