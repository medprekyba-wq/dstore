"use client";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import { Product } from "@/types/product";
import { useCallback, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";

const RecentlyViewedItems = ({ products }: { products: Product[] }) => {
  const sliderRef = useRef<SwiperRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(4);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;

    sliderRef.current.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;

    sliderRef.current.swiper.slideNext();
  }, []);

  const onSlideChange = useCallback(() => {
    if (sliderRef.current?.swiper) {
      setCurrentIndex(sliderRef.current.swiper.activeIndex);
      console.log(sliderRef.current.swiper.activeIndex);
      setIsEnd(sliderRef.current.swiper.isEnd);
      console.log(sliderRef.current.swiper.isEnd);
    }
  }, []);

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="w-full px-4 mx-auto border-b max-w-7xl sm:px-8 xl:px-0 pb-15 border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-semibold xl:text-heading-5 text-dark">
                Related Items
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className={`swiper-button-prev ${
                  currentIndex === 0 && "opacity-50 pointer-events-none"
                }`}
                aria-label="previous button"
                disabled={currentIndex === 0}
              >
                <ChevronLeftIcon />
              </button>

              <button
                onClick={handleNext}
                className={`swiper-button-next ${
                  (products.length <= visibleSlides || isEnd) && "opacity-50 pointer-events-none"
                }`}
                aria-label="next button"
                disabled={products.length <= visibleSlides || isEnd}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={4}
            spaceBetween={20}
            className="justify-between"
            onSlideChange={onSlideChange}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            onInit={(swiper) => {
              const currentSlides = swiper.params.slidesPerView;
              if (typeof currentSlides === "number") {
                setVisibleSlides(currentSlides);
              }
            }}
          >
            {products.length > 0 &&
              products.slice(0, 6).map((item, key) => (
                <SwiperSlide key={key}>
                  <ProductItem item={item} />
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedItems;
