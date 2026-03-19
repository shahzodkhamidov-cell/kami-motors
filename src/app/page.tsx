export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Shield, TrendingDown, Award, Clock, ChevronRight, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import CarCard from "@/components/CarCard";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { Car as CarType } from "@/types";

async function getFeaturedCars(): Promise<CarType[]> {
  try {
    const cars = await prisma.car.findMany({
      where: { status: "available", featured: true, published: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return cars.map((c) => ({
      ...c,
      features: JSON.parse(c.features),
      images: JSON.parse(c.images),
    }));
  } catch {
    return [];
  }
}

async function getComingSoonCars(): Promise<CarType[]> {
  try {
    const cars = await prisma.car.findMany({
      where: { status: "coming_soon", published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    return cars.map((c) => ({
      ...c,
      features: JSON.parse(c.features),
      images: JSON.parse(c.images),
    }));
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [available, sold, comingSoon] = await Promise.all([
      prisma.car.count({ where: { status: "available", published: true } }),
      prisma.car.count({ where: { status: "sold", published: true } }),
      prisma.car.count({ where: { status: "coming_soon", published: true } }),
    ]);
    return { available, sold, comingSoon };
  } catch {
    return { available: 0, sold: 0, comingSoon: 0 };
  }
}

export default async function HomePage() {
  const [featuredCars, comingSoonCars, stats] = await Promise.all([
    getFeaturedCars(),
    getComingSoonCars(),
    getStats(),
  ]);

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[var(--bg-primary)] pt-20">
        {/* Ambient glow */}
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-(--gold)/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-(--gold)/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-12 w-full py-16 lg:py-24">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase">
              Metairie, LA · Rebuilt Title Specialists
            </span>
          </div>

          {/* Headline */}
          <h1
            className="leading-none text-[var(--text-primary)] mb-2"
            style={{
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: "clamp(4rem, 12vw, 9rem)",
              letterSpacing: "0.03em",
            }}
          >
            DRIVE MORE.
          </h1>
          <h1
            className="leading-none mb-10"
            style={{
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: "clamp(4rem, 12vw, 9rem)",
              letterSpacing: "0.03em",
              background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SPEND LESS.
          </h1>

          <p className="text-[var(--text-muted)] text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
            Why pay full price? Our rebuilt title vehicles are fully inspected, repaired,
            and road-ready — at{" "}
            <span className="text-[var(--gold)] font-semibold">up to 40% less</span> than
            clean title market value.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              href="/inventory"
              className="flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-7 py-4 text-sm tracking-widest uppercase transition-all"
              style={{ boxShadow: "none" }}
            >
              Browse Inventory
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+13058158880"
              className="flex items-center gap-2 border border-[var(--border)] hover:border-(--gold)/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium px-7 py-4 text-sm tracking-widest uppercase transition-all"
            >
              <Phone className="w-4 h-4 text-[var(--gold)]" />
              (305) 815-8880
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-10 border-t border-[var(--border)] pt-8">
            {[
              { label: "Cars Available", value: String(stats.available) },
              { label: "Cars Sold", value: `350+` },
              { label: "Max Savings", value: "40%" },
              ...(stats.comingSoon > 0 ? [{ label: "Coming Soon", value: String(stats.comingSoon) }] : []),
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-[var(--gold)] leading-none mb-1"
                  style={{
                    fontFamily: "var(--font-bebas), sans-serif",
                    fontSize: "2.5rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-[var(--text-dim)] text-xs tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CAROUSEL ─────────────────────────────────── */}
      {featuredCars.length > 0 && (
        <section className="bg-[var(--bg-primary)]">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-4">
            <div className="flex items-center justify-between py-10">
              <div>
                <p className="text-[var(--gold)] text-xs tracking-[0.25em] uppercase mb-2">Hand-Picked by Our Team</p>
                <h2
                  className="text-5xl sm:text-6xl leading-none text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  FEATURED <span className="text-[var(--gold)]">VEHICLES</span>
                </h2>
              </div>
              <Link
                href="/inventory"
                className="hidden sm:flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] text-xs tracking-widest uppercase transition-colors border border-(--gold)/30 hover:border-(--gold)/60 px-4 py-2.5"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <FeaturedCarousel cars={featuredCars} />
        </section>
      )}

      {/* ── REVIEWS (right after featured) ────────────────────── */}
      <ReviewsCarousel />

      {/* ── WHY REBUILT TITLE ─────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[var(--gold)] text-xs tracking-[0.25em] uppercase mb-4">The Advantage</p>
            <h2
              className="text-5xl sm:text-6xl leading-none text-[var(--text-primary)] mb-4"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              WHY BUY A{" "}
              <span style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                REBUILT TITLE
              </span>{" "}
              CAR?
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Rebuilt title doesn&apos;t mean broken — it means opportunity. Here&apos;s what you&apos;re actually getting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)]">
            {[
              {
                icon: TrendingDown,
                title: "Massive Savings",
                description: "Save 20–40% compared to the same car with a clean title. More car for less money — period.",
              },
              {
                icon: Shield,
                title: "Fully Inspected",
                description: "Every vehicle passes state inspection and is certified road-worthy. We stand behind every car we sell.",
              },
              {
                icon: Award,
                title: "Same Quality",
                description: "The repairs are done. The car drives and functions exactly like its clean title counterpart.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--bg-primary)] p-10 group hover:bg-[var(--bg-card)] transition-colors">
                <div className="w-12 h-12 border border-(--gold)/30 group-hover:border-(--gold)/60 flex items-center justify-center mb-6 transition-colors">
                  <item.icon className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <h3
                  className="text-[var(--text-primary)] text-2xl mb-3"
                  style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                >
                  {item.title}
                </h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICE COMPARISON CALLOUT ──────────────────────────── */}
      <section className="py-16 bg-[var(--bg-card-2)] border-y border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--gold)] text-xs tracking-[0.25em] uppercase mb-4">Real Savings Example</p>
              <h3
                className="text-4xl sm:text-5xl text-[var(--text-primary)] leading-none mb-5"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                SAME CAR.<br />
                <span className="text-[var(--gold)]">FRACTION OF THE PRICE.</span>
              </h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                Every listing shows you the estimated clean title market value from KBB,
                CarGurus, and Blackbook — so you always know exactly how much you&apos;re saving.
              </p>
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] text-sm tracking-widest uppercase transition-colors"
              >
                See current savings
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--border)] p-6 text-center">
                <p className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase mb-2">Clean Title Market</p>
                <p
                  className="text-[var(--text-dim)] text-3xl line-through leading-none"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  $28,000
                </p>
                <p className="text-[var(--text-dim)] text-xs mt-2 tracking-wide">KBB Estimate</p>
              </div>
              <div className="border border-(--gold)/40 bg-(--gold)/5 p-6 text-center gold-glow">
                <p className="text-[var(--gold)] text-[10px] tracking-widest uppercase mb-2">Kami Motors Price</p>
                <p
                  className="text-[var(--gold)] text-3xl leading-none"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  $18,500
                </p>
                <div className="mt-3 bg-[var(--gold)] py-1.5">
                  <p
                    className="text-[#080807] text-xs font-black tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    SAVE $9,500
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMING SOON ───────────────────────────────────────── */}
      {comingSoonCars.length > 0 && (
        <section className="py-20 bg-[var(--bg-primary)]">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#60a5fa]" />
                  <p className="text-[#60a5fa] text-xs tracking-[0.25em] uppercase">In Preparation</p>
                </div>
                <h2
                  className="text-5xl sm:text-6xl leading-none text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  COMING <span className="text-[#60a5fa]">SOON</span>
                </h2>
              </div>
              <Link
                href="/inventory"
                className="hidden sm:flex items-center gap-2 text-[#60a5fa]/70 hover:text-[#60a5fa] text-xs tracking-widest uppercase transition-colors border border-[#60a5fa]/20 hover:border-[#60a5fa]/40 px-4 py-2.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">
              {comingSoonCars.map((car) => (
                <div key={car.id} className="bg-[var(--bg-primary)]">
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--gold)]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-6xl sm:text-7xl leading-none text-[#080807] mb-4"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            READY TO SAVE THOUSANDS?
          </h2>
          <p className="text-[#080807]/70 mb-10 text-lg max-w-xl mx-auto">
            Browse our inventory and apply for financing right from any listing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/inventory"
              className="bg-[#080807] text-[var(--gold)] font-bold px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#080807]/80 transition-colors"
            >
              Browse All Inventory
            </Link>
            <a
              href="tel:+13058158880"
              className="border-2 border-[#080807]/30 text-[#080807] font-semibold px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#080807]/10 transition-colors"
            >
              (305) 815-8880
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
