"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gauge, Calendar, Fuel, TrendingDown } from "lucide-react";
import { Car } from "@/types";
import { formatCurrency, formatMileage, getSavingsPercent } from "@/lib/utils";
import FinancingModal from "./FinancingModal";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [showFinancing, setShowFinancing] = useState(false);
  const savings = car.cleanTitleValue - car.price;
  const savingsPct = getSavingsPercent(car.price, car.cleanTitleValue);
  const mainImage = car.images[0] || null;

  return (
    <>
      <Link href={`/inventory/${car.id}`} className="car-card bg-[var(--bg-card)] border border-[var(--border)] flex flex-col hover:border-[var(--gold)]/30 transition-colors">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-[var(--bg-card-2)] overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20">🚗</span>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {car.featured && (
              <span className="bg-[var(--gold)] text-[#080807] text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                Featured
              </span>
            )}
            <span className="bg-(--bg-primary)/80 backdrop-blur text-[var(--text-muted)] text-[10px] px-2 py-1 border border-[var(--border)] tracking-wide uppercase">
              Rebuilt Title
            </span>
          </div>

          {/* Savings badge */}
          {savings > 0 && (
            <div className="absolute top-3 right-3 bg-[var(--gold)] text-[#080807] text-center px-2 py-1 savings-badge">
              <p className="text-[9px] font-bold leading-none tracking-widest uppercase">Save</p>
              <p
                className="text-lg font-black leading-none"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                {savingsPct}%
              </p>
            </div>
          )}

          {/* Status overlay */}
          {car.status !== "available" && (
            <div className="absolute inset-0 bg-(--bg-primary)/70 flex items-center justify-center">
              <span
                className="text-2xl tracking-[0.3em] uppercase border px-4 py-2"
                style={{
                  fontFamily: "var(--font-bebas), sans-serif",
                  color: car.status === "sold" ? "#ef4444"
                       : car.status === "coming_soon" ? "#60a5fa"
                       : "#f59e0b",
                  borderColor: car.status === "sold" ? "rgba(239,68,68,0.4)"
                             : car.status === "coming_soon" ? "rgba(96,165,250,0.4)"
                             : "rgba(245,158,11,0.4)",
                }}
              >
                {car.status === "coming_soon" ? "Coming Soon" : car.status}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3
                className="text-[var(--text-primary)] text-xl leading-none mb-1"
                style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
              >
                {car.year} {car.make} {car.model}
              </h3>
              {car.trim && (
                <p className="text-[var(--text-dim)] text-xs tracking-wide">{car.trim}</p>
              )}
            </div>
            <span className="bg-[var(--bg-card-2)] text-[var(--text-muted)] text-[10px] px-2 py-1 border border-[var(--border)] tracking-widest uppercase shrink-0">
              {car.bodyType}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
              <Gauge className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
              {formatMileage(car.mileage)}
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
              {car.year}
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
              <Fuel className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
              {car.fuelType || "Gas"}
            </div>
          </div>

          {/* Price comparison */}
          <div className="border border-[var(--border)] bg-[var(--bg-card-2)] p-4 mb-4 flex-1">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase mb-1">Our Price</p>
                <p
                  className="text-[var(--gold)] text-3xl leading-none"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  {formatCurrency(car.price)}
                </p>
              </div>
              {savings > 0 && (
                <div className="text-right">
                  <p className="text-[var(--text-dim)] text-[10px] tracking-wide mb-0.5 uppercase">Clean Title</p>
                  <p className="text-[var(--text-dim)] text-sm line-through">{formatCurrency(car.cleanTitleValue)}</p>
                  <div className="flex items-center gap-1 text-[var(--gold)] justify-end">
                    <TrendingDown className="w-3 h-3" />
                    <p className="text-xs font-semibold">−{formatCurrency(savings)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setShowFinancing(true); }}
              disabled={car.status !== "available"}
              className="flex-1 bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-[var(--border)] disabled:text-[var(--text-dim)] disabled:cursor-not-allowed text-[#080807] font-bold py-2.5 text-xs tracking-widest uppercase transition-colors"
            >
              {car.status === "coming_soon" ? "Notify Me" : "Contact Us"}
            </button>
          </div>
        </div>
      </Link>

      <FinancingModal
        car={car}
        isOpen={showFinancing}
        onClose={() => setShowFinancing(false)}
      />
    </>
  );
}
