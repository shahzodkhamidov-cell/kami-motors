import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Car } from "@/types";
import { formatCurrency, formatMileage, getSavingsPercent } from "@/lib/utils";
import CarDetailClient from "./CarDetailClient";

async function getCar(id: string): Promise<Car | null> {
  try {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) return null;
    return {
      ...car,
      features: JSON.parse(car.features),
      images: JSON.parse(car.images),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) return {};
  return {
    title: `${car.year} ${car.make} ${car.model} | Kami Motors`,
    description: `${car.year} ${car.make} ${car.model} for ${formatCurrency(car.price)}. Save ${formatCurrency(car.cleanTitleValue - car.price)} vs clean title.`,
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  const savings = car.cleanTitleValue - car.price;
  const savingsPct = getSavingsPercent(car.price, car.cleanTitleValue);

  const specs = [
    { label: "VIN", value: car.vin },
    { label: "Year", value: car.year },
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Trim", value: car.trim || "—" },
    { label: "Body Type", value: car.bodyType },
    { label: "Mileage", value: formatMileage(car.mileage) },
    { label: "Color", value: car.color || "—" },
    { label: "Engine", value: car.engine || "—" },
    { label: "Transmission", value: car.transmission || "—" },
    { label: "Drivetrain", value: car.drivetrain || "—" },
    { label: "Fuel Type", value: car.fuelType || "—" },
    { label: "Title", value: "Rebuilt / Salvage Title" },
  ];

  return (
    <div className="pt-20 pb-16 min-h-screen bg-[#080807]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[#6B6B6B] text-xs tracking-wide py-6 border-b border-[#2A2A26] mb-8">
          <Link href="/" className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/inventory" className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest">Inventory</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#B0B0B8] uppercase tracking-widest">{car.year} {car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Images + Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="relative aspect-[16/10] bg-[#1A1A18] overflow-hidden border border-[#2A2A26]">
              {car.images[0] ? (
                <Image
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B]">
                  <div className="text-center">
                    <div className="text-6xl mb-3 opacity-20">🚗</div>
                    <p className="text-sm tracking-widest uppercase">Photos coming soon</p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#080807]/80 backdrop-blur text-[#B0B0B8] text-[10px] px-2.5 py-1 border border-[#2A2A26] tracking-wide uppercase">
                  Rebuilt Title
                </span>
                {car.featured && (
                  <span className="bg-[#C9A84C] text-[#080807] text-[10px] font-bold px-2.5 py-1 tracking-widest uppercase">
                    Featured
                  </span>
                )}
              </div>
              {car.status !== "available" && (
                <div className="absolute inset-0 bg-[#080807]/70 flex items-center justify-center">
                  <span
                    className="text-2xl tracking-[0.3em] uppercase border px-4 py-2"
                    style={{
                      fontFamily: "var(--font-bebas), sans-serif",
                      color: car.status === "sold" ? "#ef4444" : car.status === "coming_soon" ? "#60a5fa" : "#f59e0b",
                      borderColor: car.status === "sold" ? "rgba(239,68,68,0.4)" : car.status === "coming_soon" ? "rgba(96,165,250,0.4)" : "rgba(245,158,11,0.4)",
                    }}
                  >
                    {car.status === "coming_soon" ? "Coming Soon" : car.status}
                  </span>
                </div>
              )}
            </div>

            {/* Image gallery */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-[#1A1A18] overflow-hidden border border-[#2A2A26]">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="bg-[#111110] border border-[#2A2A26] p-6">
                <h3
                  className="text-[#C9A84C] text-xl leading-none mb-4"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                >
                  Description
                </h3>
                <p className="text-[#B0B0B8] text-sm leading-relaxed whitespace-pre-wrap">{car.description}</p>
              </div>
            )}

            {/* Specs */}
            <div className="bg-[#111110] border border-[#2A2A26] p-6">
              <h3
                className="text-[#C9A84C] text-xl leading-none mb-5"
                style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
              >
                Vehicle Specs
              </h3>
              <div className="grid grid-cols-2 gap-y-4">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-0.5">{label}</span>
                    <span className={`text-sm font-medium ${label === "Title" ? "text-[#C9A84C]" : "text-[#F8EAD9]"}`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features.length > 0 && (
              <div className="bg-[#111110] border border-[#2A2A26] p-6">
                <h3
                  className="text-[#C9A84C] text-xl leading-none mb-5"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                >
                  Features
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[#B0B0B8] text-sm">
                      <div className="w-1.5 h-1.5 bg-[#C9A84C] shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Pricing + CTA */}
          <div>
            <div className="bg-[#111110] border border-[#2A2A26] p-6 sticky top-24">
              <h1
                className="text-[#F8EAD9] leading-none mb-1"
                style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "1.8rem", letterSpacing: "0.03em" }}
              >
                {car.year} {car.make} {car.model}
              </h1>
              {car.trim && <p className="text-[#6B6B6B] text-xs tracking-wide mb-5">{car.trim}</p>}

              {/* Price comparison */}
              <div className="bg-[#0D0D0B] border border-[#2A2A26] p-5 mb-5">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1">Our Price</p>
                    <p
                      className="text-[#C9A84C] leading-none"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "2.5rem" }}
                    >
                      {formatCurrency(car.price)}
                    </p>
                  </div>
                  {savings > 0 && (
                    <div className="bg-[#C9A84C] text-[#080807] px-3 py-1.5 text-center">
                      <p className="text-[9px] font-bold leading-none tracking-widest uppercase">Save</p>
                      <p
                        className="text-xl font-black leading-none"
                        style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                      >
                        {savingsPct}%
                      </p>
                    </div>
                  )}
                </div>
                {savings > 0 && (
                  <div className="border-t border-[#2A2A26] pt-3 space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B6B6B] text-xs tracking-wide">Clean Title Est.</span>
                      <span className="text-[#6B6B6B] text-sm line-through">{formatCurrency(car.cleanTitleValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9A84C] text-xs tracking-widest uppercase font-semibold">You Save</span>
                      <span className="text-[#C9A84C] text-sm font-bold">{formatCurrency(savings)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#6B6B6B] tracking-wide mb-5">
                <span>{formatMileage(car.mileage)}</span>
                <span className="w-px h-3 bg-[#2A2A26]" />
                <span>{car.transmission || "Auto"}</span>
                <span className="w-px h-3 bg-[#2A2A26]" />
                <span>{car.drivetrain || "—"}</span>
              </div>

              <CarDetailClient car={car} />

              <p className="text-[#6B6B6B] text-[10px] tracking-wide text-center mt-4">
                * Clean title value based on KBB, CarGurus, and Blackbook estimates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
