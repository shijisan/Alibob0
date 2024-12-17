"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules"; 
import "swiper/css";
import "swiper/css/navigation";

export default function HeroCarousel() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banner");
        if (!res.ok) {
          throw new Error("Failed to fetch banners");
        }
        const { banners } = await res.json();
        setBanners(banners);
      } catch (err) {
        console.error(err);
        setBanners([]);
      }
    };

    fetchBanners();
  }, []);

  const placeholders = [
    "https://placehold.co/1800x200/webp",
    "https://placehold.co/1800x200/webp",
    "https://placehold.co/1800x200/webp",
  ];

  const displayBanners = banners.length > 0 
    ? banners 
    : placeholders.map((url) => ({ imageUrl: url }));

  return (
    <Swiper
      modules={[Navigation, A11y]} 
      spaceBetween={0}
      slidesPerView={1}
      navigation
      loop={true}
    >
      {displayBanners.map((banner, index) => (
        <SwiperSlide key={index}>
          <img
            src={banner.imageUrl} 
            className="lg:h-[25vh] h-[40vh] w-full object-cover"
            alt={`Banner ${index + 1}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
