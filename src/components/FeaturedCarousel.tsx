"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Gauge, Calendar, Fuel, TrendingDown } from "lucide-react";
import { Car } from "@/types";
import { formatCurrency, formatMileage, getSavingsPercent } from "@/lib/utils";
import FinancingModal from "./FinancingModal";

interface FeaturedCarouselProps {
  cars: Car[];
}

export default function FeaturedCarousel({ cars }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [modalCar, setModalCar] = useState<Car | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % cars.length), [cars.length]);
  const prev = () => setCurrent((c) => (c - 1 + cars.length) % cars.length);

  useEffect(() => {
    if (!autoPlay || cars.length <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [autoPlay, next, cars.length]);

  if (cars.length === 0) return null;

  const car = cars[current];
  const savings = car.cleanTitleValue - car.price;
  const savingsPct = getSavingsPercent(car.price, car.cleanTitleValue);

  return (
    <>
      <div
        className="relative w-full"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {/* Main slide */}
        <div className="carousel-slide grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[560px]" key={car.id}>

          {/* Left — image */}
          <div className="relative bg-[#111110] overflow-hidden min-h-[300px] lg:min-h-[560px]">
            {car.images[0] ? (
              <Image
                src={car.images[0]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111110]">
                <span className="text-8xl opacity-20">🚗</span>
              </div>
            )}
            {/* Gold overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#080807]/60 hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080807]/80 via-transparent to-transparent lg:hidden" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-[#C9A84C] text-[#080807] text-xs font-bold px-2.5 py-1 tracking-widest uppercase">
                Featured
              </span>
              <span className="bg-[#080807]/80 backdrop-blur text-[#B0B0B8] text-xs px-2.5 py-1 border border-[#2A2A26] tracking-wide">
                Rebuilt Title
              </span>
            </div>

            {/* Savings badge */}
            {savings > 0 && (
              <div className="absolute top-4 right-4 bg-[#C9A84C] text-[#080807] text-center px-3 py-2 savings-badge">
                <p className="text-xs font-bold leading-none tracking-widest uppercase">Save</p>
                <p className="text-2xl font-black leading-tight">{savingsPct}%</p>
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="bg-[#080807] flex flex-col justify-center px-8 lg:px-12 py-10 lg:py-16">
            <p className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase mb-3">
              {car.bodyType} · {car.year}
            </p>

            <h2
              className="text-5xl lg:text-6xl leading-none text-[#F8EAD9] mb-2"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
            >
              {car.make}
            </h2>
            <h3
              className="text-3xl lg:text-4xl leading-none text-[#C9A84C] mb-6"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
            >
              {car.model} {car.trim && `· ${car.trim}`}
            </h3>

            {/* Specs row */}
            <div className="flex gap-5 mb-8">
              <div className="flex items-center gap-1.5 text-[#B0B0B8] text-sm">
                <Gauge className="w-3.5 h-3.5 text-[#C9A84C]" />
                {formatMileage(car.mileage)}
              </div>
              <div className="flex items-center gap-1.5 text-[#B0B0B8] text-sm">
                <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
                {car.year}
              </div>
              {car.fuelType && (
                <div className="flex items-center gap-1.5 text-[#B0B0B8] text-sm">
                  <Fuel className="w-3.5 h-3.5 text-[#C9A84C]" />
                  {car.fuelType}
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="border border-[#2A2A26] bg-[#111110] p-5 mb-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-1">Our Price</p>
                  <p
                    className="text-4xl text-[#C9A84C] leading-none"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    {formatCurrency(car.price)}
                  </p>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <p className="text-[#6B6B6B] text-xs tracking-wide mb-1">Clean Title Est.</p>
                    <p className="text-[#6B6B6B] text-base line-through">{formatCurrency(car.cleanTitleValue)}</p>
                    <div className="flex items-center gap-1 text-[#C9A84C] justify-end mt-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <p className="text-sm font-bold">Save {formatCurrency(savings)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalCar(car)}
                className="flex-1 bg-[#C9A84C] hover:bg-[#E2CB7E] text-[#080807] font-bold py-3.5 text-sm tracking-widest uppercase transition-colors"
              >
                Apply for Financing
              </button>
              <Link
                href={`/inventory/${car.id}`}
                className="flex-1 border border-[#C9A84C]/40 hover:border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 font-semibold py-3.5 text-sm tracking-widest uppercase text-center transition-all"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        {cars.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#080807]/80 border border-[#2A2A26] hover:border-[#C9A84C]/50 text-[#B0B0B8] hover:text-[#C9A84C] flex items-center justify-center transition-all backdrop-blur z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#080807]/80 border border-[#2A2A26] hover:border-[#C9A84C]/50 text-[#B0B0B8] hover:text-[#C9A84C] flex items-center justify-center transition-all backdrop-blur z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {cars.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {cars.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full ${
                  i === current
                    ? "w-8 h-2 bg-[#C9A84C]"
                    : "w-2 h-2 bg-[#2A2A26] hover:bg-[#C9A84C]/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip */}
        {cars.length > 1 && (
          <div className="flex gap-2 mt-3 px-1 overflow-x-auto pb-1">
            {cars.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCurrent(i)}
                className={`relative shrink-0 w-24 h-16 overflow-hidden transition-all border-2 ${
                  i === current
                    ? "border-[#C9A84C] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-75"
                }`}
              >
                {c.images[0] ? (
                  <Image src={c.images[0]} alt="" fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full bg-[#1A1A18] flex items-center justify-center text-[#6B6B6B] text-xs">
                    {c.year}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {modalCar && (
        <FinancingModal
          car={modalCar}
          isOpen={true}
          onClose={() => setModalCar(null)}
        />
      )}
    </>
  );
}
