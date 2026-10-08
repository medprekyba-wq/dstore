import { useCallback, useRef, useState } from 'react';
import type { SwiperRef } from 'swiper/react';

export const useTestimonialSwiper = () => {
  const sliderRef = useRef<SwiperRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current?.swiper) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current?.swiper) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  const onSlideChange = useCallback(() => {
    if (sliderRef.current?.swiper) {
      setCurrentIndex(sliderRef.current.swiper.activeIndex);
      setIsEnd(sliderRef.current.swiper.isEnd);
    }
  }, []);

  return {
    sliderRef,
    handlePrev,
    handleNext,
    onSlideChange,
    currentIndex,
    isEnd,
  };
}; 