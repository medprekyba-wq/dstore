"use client";
import { Testimonial } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import SingleItem from "./SingleItem";
import TestimonialsHeader from "./TestimonialsHeader";
import { useTestimonialSwiper } from "./useTestimonialSwiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const BREAKPOINTS = {
  0: { slidesPerView: 1 },
  1000: { slidesPerView: 2 },
  1200: { slidesPerView: 3 },
} as const;

const TestimonialSlider = ({testimonials}: {testimonials: Testimonial[]}) => {
  const { sliderRef, handlePrev, handleNext, onSlideChange, currentIndex, isEnd } =
    useTestimonialSwiper();

  return (
    <section className="pb-11.5">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="swiper testimonial-carousel common-carousel p-5">
          <TestimonialsHeader
            onPrev={handlePrev}
            onNext={handleNext}
            isPrevDisabled={currentIndex === 0}
            isNextDisabled={isEnd}
          />

          <Swiper
            className="testimonial-swiper"
            ref={sliderRef}
            slidesPerView={3}
            spaceBetween={20}
            breakpoints={BREAKPOINTS}
            onSlideChange={onSlideChange}
          >
            {testimonials.map((item, key) => (
              <SwiperSlide key={key}>
                <SingleItem testimonial={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
