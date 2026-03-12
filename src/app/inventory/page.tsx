"use client";

import { useState, useEffect, useMemo } from "react";
import CarCard from "@/components/CarCard";
import FilterBar from "@/components/FilterBar";
import { Car } from "@/types";
import { Loader2, Clock } from "lucide-react";

interface Filters {
  search: string;
  bodyType: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  make: string;
}

export default function InventoryPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    bodyType: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    make: "",
  });

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      const params = new URLSearchParams({ status: "all" });
      if (filters.bodyType) params.set("bodyType", filters.bodyType);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minYear) params.set("minYear", filters.minYear);
      if (filters.maxYear) params.set("maxYear", filters.maxYear);
      if (filters.make) params.set("make", filters.make);

      const res = await fetch(`/api/cars?${params}`);
      const data = await res.json();
      setCars(data);
      setLoading(false);
    };
    fetchCars();
  }, [filters.bodyType, filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, filters.make]);

  const filtered = useMemo(() => {
    if (!filters.search) return cars;
    const q = filters.search.toLowerCase();
    return cars.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        String(c.year).includes(q) ||
        (c.trim && c.trim.toLowerCase().includes(q))
    );
  }, [cars, filters.search]);

  const available = filtered.filter((c) => c.status === "available");
  const comingSoon = filtered.filter((c) => c.status === "coming_soon");
  const soldOrPending = filtered.filter(
    (c) => c.status !== "available" && c.status !== "coming_soon"
  );

  return (
    <div className="pt-20 pb-16 min-h-screen bg-[#080807]">
      {/* Header */}
      <section className="py-14 border-b border-[#2A2A26] mb-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Rebuilt Title Specialists</span>
          </div>
          <h1
            className="text-[#F8EAD9] leading-none mb-3"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "0.03em" }}
          >
            OUR{" "}
            <span style={{ background: "linear-gradient(135deg, #C9A84C, #E2CB7E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              INVENTORY
            </span>
          </h1>
          <p className="text-[#B0B0B8] max-w-xl">
            Quality rebuilt title vehicles — inspected, road-ready, and priced to save you thousands.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <FilterBar filters={filters} onChange={setFilters} totalResults={filtered.length} />

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 border border-[#2A2A26] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl opacity-30">🚗</span>
            </div>
            <h3
              className="text-[#F8EAD9] text-3xl leading-none mb-2"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              No Vehicles Found
            </h3>
            <p className="text-[#6B6B6B] text-sm tracking-wide">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            {/* Available */}
            {available.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
                  <h2
                    className="text-[#F8EAD9] text-xl leading-none"
                    style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                  >
                    Available Now
                  </h2>
                  <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">({available.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A26] mb-12">
                  {available.map((car) => (
                    <div key={car.id} className="bg-[#080807]">
                      <CarCard car={car} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Coming Soon */}
            {comingSoon.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#60a5fa]" />
                  <h2
                    className="text-[#F8EAD9] text-xl leading-none"
                    style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                  >
                    Coming Soon
                  </h2>
                  <span className="bg-[#60a5fa]/10 text-[#60a5fa] text-[10px] px-2 py-1 border border-[#60a5fa]/20 tracking-widest uppercase">
                    In Preparation
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A26] mb-12">
                  {comingSoon.map((car) => (
                    <div key={car.id} className="bg-[#080807]">
                      <CarCard car={car} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Sold / Pending */}
            {soldOrPending.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#6B6B6B] rounded-full" />
                  <h2
                    className="text-[#6B6B6B] text-xl leading-none"
                    style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                  >
                    Sold / Pending
                  </h2>
                  <span className="text-[#6B6B6B] text-xs tracking-widest uppercase">({soldOrPending.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A26] opacity-50">
                  {soldOrPending.map((car) => (
                    <div key={car.id} className="bg-[#080807]">
                      <CarCard car={car} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
