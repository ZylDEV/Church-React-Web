import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { db } from "../../config/firebaseConfig";
import { ref, onValue } from "firebase/database";

const paragraph = `Keterangan....`;

// Animasi fade keseluruhan
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } },
};

// Carousel animasi
const carouselVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function CombinedSection() {
  const swiperRef = useRef(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const imagesRef = ref(db, "carouselImages");
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      const imagesArray = data
        ? Object.values(data).map((item) => ({ src: item.url, alt: item.judul }))
        : [];
      setCarouselImages(imagesArray);
      setLoading(false);

      if (swiperRef.current) setTimeout(() => swiperRef.current.update(), 100);
    });
    return () => unsubscribe();
  }, []);

  const getProcessedImageUrl = (originalUrl) => {
    if (!originalUrl) return "";
    const urlParts = originalUrl.split("/");
    const uuid = urlParts[urlParts.length - 2];
    return `https://ucarecdn.com/${uuid}/-/resize/1280x720/-/crop/16:9/center/`;
  };

  const hasMultipleSlides = carouselImages.length > 1;

  if (loading) {
    // Skeleton fixed height untuk menghindari CLS
    return (
      <div className="flex flex-col items-center py-10 space-y-10 w-full max-w-5xl mx-auto">
        <div className="w-full aspect-video bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-2/3 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10">
      <motion.section
        className="w-full max-w-5xl mx-auto px-6 py-12 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 space-y-10"
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
      >
        {/* Carousel */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
          {carouselImages.length > 0 ? (
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              slidesPerView={1}
              loop={hasMultipleSlides}
              autoplay={
                hasMultipleSlides
                  ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
                  : false
              }
              speed={1200}
              pagination={hasMultipleSlides ? { clickable: true, bulletClass: "swiper-pagination-bullet !bg-amber-400" } : false}
              navigation={hasMultipleSlides ? { prevEl: ".custom-prev", nextEl: ".custom-next" } : false}
              modules={[Autoplay, Pagination, Navigation]}
              className="w-full h-full"
            >
              {carouselImages.map(({ src, alt }, idx) => (
                <SwiperSlide key={idx}>
                  <motion.img
                    src={getProcessedImageUrl(src)}
                    alt={alt}
                    className="w-full h-full object-cover object-center select-none"
                    loading="lazy"
                    draggable={false}
                    variants={carouselVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-2xl">
              Tidak ada foto carousel.
            </div>
          )}

          {hasMultipleSlides && (
            <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
              <button
                aria-label="Slide sebelumnya"
                className="custom-prev pointer-events-auto bg-gray-800/20 hover:bg-gray-800/40 text-white rounded-full p-3 sm:p-4 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                aria-label="Slide berikutnya"
                className="custom-next pointer-events-auto bg-gray-800/20 hover:bg-gray-800/40 text-white rounded-full p-3 sm:p-4 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Judul & paragraph */}
        <div className="text-center">
          <motion.h1
            className="text-5xl sm:text-6xl font-extrabold mb-4 text-blue-950 tracking-tight drop-shadow-md font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1 } }}
          >
            Gereja
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-800 leading-relaxed tracking-wide font-light min-h-[4.5rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2, ease: "easeOut" } }}
          >
            {paragraph}
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}
