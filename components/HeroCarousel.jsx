"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules"; 
import "swiper/css";
import "swiper/css/navigation";

export default function HeroCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const placeholders = [
    "https://placehold.co/500x500.webp?text=Placeholder+1",
    "https://placehold.co/500x500.webp?text=Placeholder+2",
    "https://placehold.co/500x500.webp?text=Placeholder+3",
  ];

  const displayBanners = banners.length > 0 ? banners : placeholders.map((url, index) => ({ imageUrl: url }));

  if (loading) {
    return <p>Loading...</p>;
  }

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
