"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules"; 
import "swiper/css";
import "swiper/css/navigation";

export default function HeroCarousel() {
  return (
    <Swiper
      modules={[Navigation, A11y]} 
      spaceBetween={0}
      slidesPerView={1}
      navigation 
      loop={true}
    >
      <SwiperSlide>
        <img src="https://placehold.co/500x500" className="lg:h-[20vh] h-[40vh] w-full object-cover" alt="Image 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="https://placehold.co/500x500" className="lg:h-[20vh] h-[40vh] w-full  object-cover" alt="Image 2" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="https://placehold.co/500x500" className="lg:h-[20vh] h-[40vh] w-full  object-cover" alt="Image 3" />
      </SwiperSlide>
    </Swiper>
  );
}
