import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";

const slides = [
  {
    title: "Karuppu",
    subtitle: "Now Showing",
    image:" data:image/jpeg;base64,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 " },
  {
    title: "Athiradi",
    subtitle: "Exclusive Release",
    image:
      "https://cdn.district.in/movies-assets/images/cinema/Athiradi_Poster-2e236df0-36f4-11f1-ad5d-df8c1aec5c9a-3cf0b920-4cfa-11f1-8799-755d749806ee.jpg",
  },
];

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const activeSlide = slides[activeIndex];

  const goToSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;

    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }
  };

  return (
    <section
      className="relative w-full min-h-[560px] h-[78svh] sm:h-[82svh] lg:h-[92vh] overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              draggable="false"
              className="w-full h-full object-cover object-center md:object-center"
            />
          </div>
        );
      })}

      {/* overlays */}
      <div className="absolute inset-0 bg-black/45 z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />

      {/* content */}
      <div className="relative z-30 flex items-end md:items-center h-full max-w-screen-2xl mx-auto px-5 sm:px-6 md:px-12 pb-16 md:pb-0">
        <div className="max-w-3xl min-w-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#f5c518]/40 bg-black/40 backdrop-blur-md text-[#f5c518] text-xs font-black uppercase tracking-[0.25em]">
            {activeSlide.subtitle}
          </div>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] tracking-normal text-white break-words">
            {activeSlide.title}
          </h1>

          <p className="mt-5 max-w-xl text-sm md:text-lg text-gray-300 font-medium leading-relaxed">
            Experience premium cinema booking with immersive releases and a
            theatre-first CineBook experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#movies-section"
              className="btn-fill-gold inline-flex items-center gap-2"
            >
              <Ticket size={18} />
              Book Tickets
            </a>

            <a
              href="#movies-section"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:border-[#f5c518] hover:text-[#f5c518]"
            >
              View Details
            </a>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button
        onClick={previousSlide}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/40 border border-white/10 items-center justify-center text-white hover:border-[#f5c518] hover:text-[#f5c518] transition-all"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/40 border border-white/10 items-center justify-center text-white hover:border-[#f5c518] hover:text-[#f5c518] transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-10 bg-[#f5c518]"
                : "w-3 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
