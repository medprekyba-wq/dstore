"use client";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import { IHeroSlider } from "@/types/hero";
import Image from "next/image";
import Link from "next/link";

const HeroCarousal = ({ sliders }: { sliders: any }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {sliders?.map((slider: IHeroSlider, key: number) => (
        <SwiperSlide key={key}>
          <div className="flex flex-col-reverse items-center pt-6 sm:pt-0 sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-5">
                <span className="block font-semibold text-heading-3 sm:text-[58px] text-blue">
                  {slider?.discountRate}%
                </span>
                <span className="block text-sm uppercase text-dark sm:text-xl sm:leading-6">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              {key === 0 ? (
                <h1 className="mb-3 text-xl font-semibold text-dark sm:text-3xl">
                  <Link href={`/products/${slider?.product?.slug}`}>
                    {slider?.product?.title}
                  </Link>
                </h1>
              ) : (
                <h2 className="mb-3 text-xl font-semibold text-dark sm:text-3xl">
                  <Link href={`/products/${slider?.product?.slug}`}>
                    {slider?.product?.title}
                  </Link>
                </h2>
              )}

              <p className="text-base text-meta-3">
                {slider?.product?.shortDescription?.slice(0, 100)}
              </p>

              <Link
                href={`/products/${slider?.product?.slug}`}
                className="inline-flex py-3 mt-10 font-medium text-white duration-200 ease-out rounded-lg text-custom-sm bg-dark px-9 hover:bg-darkLight"
              >
                Shop Now
              </Link>
            </div>

            <div>
              <Image
                src={slider?.sliderImage ? slider?.sliderImage! : "/no image"}
                alt="headphone"
                width={400}
                height={400}
                loading="eager"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
