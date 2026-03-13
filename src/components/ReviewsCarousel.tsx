"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from "lucide-react";

const FACEBOOK_REVIEWS_URL = "https://www.facebook.com/KamiMotors/reviews";

const reviews = [
  {
    name: "Marcus T.",
    location: "Metairie, LA",
    rating: 5,
    car: "2021 Toyota Camry SE",
    savings: "$8,200",
    text: "I was skeptical about rebuilt title at first, but Kami Motors walked me through everything. The car is perfect — drives smooth, no issues whatsoever. Saved over $8K compared to what I saw at regular dealerships. Won't buy any other way now.",
    date: "2 months ago",
    initials: "MT",
  },
  {
    name: "Danielle R.",
    location: "New Orleans, LA",
    rating: 5,
    car: "2020 Honda CR-V EX",
    savings: "$11,500",
    text: "The transparency here is unmatched. They showed me the full rebuild history, the inspection report, everything. My CR-V has been flawless for 8 months. I tell everyone to check Kami Motors before going to a regular dealer.",
    date: "3 months ago",
    initials: "DR",
  },
  {
    name: "James B.",
    location: "Kenner, LA",
    rating: 5,
    car: "2019 Ford F-150 XLT",
    savings: "$14,000",
    text: "Bought my F-150 here and couldn't be happier. The financing process was straightforward — applied right from the website, got a call the next morning. The truck was exactly as described. These guys are the real deal.",
    date: "1 month ago",
    initials: "JB",
  },
  {
    name: "Priya K.",
    location: "Gretna, LA",
    rating: 5,
    car: "2022 Hyundai Tucson",
    savings: "$9,800",
    text: "As a first-time car buyer I was nervous, but they made it so easy. The price comparison tool showed me exactly what I was saving vs. clean title. Got a 2022 Tucson way under budget. Amazing experience.",
    date: "6 weeks ago",
    initials: "PK",
  },
  {
    name: "Robert M.",
    location: "Harvey, LA",
    rating: 5,
    car: "2020 Chevrolet Silverado",
    savings: "$12,300",
    text: "Third car I've bought from Kami Motors. Every single one has been solid. The rebuilt title stigma is totally overblown — these cars are fully repaired and road-ready. The savings are real and the quality is there.",
    date: "4 months ago",
    initials: "RM",
  },
  {
    name: "Angela W.",
    location: "Chalmette, LA",
    rating: 5,
    car: "2021 BMW 3 Series",
    savings: "$18,000",
    text: "I got a BMW 3 Series for the price of a base Camry. Let that sink in. The car is immaculate — you'd never know it had a rebuilt title. Kami Motors is the best-kept secret in Louisiana.",
    date: "5 weeks ago",
    initials: "AW",
  },
];

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => setCurrent((c) => (c + 1) % reviews.length), []);
  const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isAutoPlaying, next]);

  const review = reviews[current];

  return (
    <section className="py-20 bg-[var(--bg-card-2)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[var(--gold)] text-xs tracking-[0.25em] uppercase mb-3">Testimonials</p>
            <h2
              className="text-5xl sm:text-6xl leading-none text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              WHAT OUR<br />
              <span className="text-[var(--gold)]">CUSTOMERS SAY</span>
            </h2>
          </div>

          {/* Facebook verified review button */}
          <a
            href={FACEBOOK_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 border border-[var(--border)] hover:border-[#1877F2]/50 bg-[var(--bg-card)] hover:bg-[#1877F2]/5 px-5 py-3.5 transition-all self-start sm:self-auto"
          >
            {/* Facebook "F" icon */}
            <div className="w-8 h-8 bg-[#1877F2] flex items-center justify-center rounded-sm shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[var(--gold)] text-[var(--gold)]" />
                  ))}
                </div>
                <span className="text-[var(--text-primary)] text-sm font-bold">4.9</span>
                <div className="flex items-center gap-1 bg-[#1877F2]/20 border border-[#1877F2]/30 rounded px-1.5 py-0.5 ml-1">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#1877F2]">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#1877F2] text-[10px] font-bold tracking-wide">Verified</span>
                </div>
              </div>
              <p className="text-[var(--text-dim)] text-xs mt-0.5 group-hover:text-[var(--text-muted)] transition-colors flex items-center gap-1">
                See all reviews on Facebook
                <ExternalLink className="w-3 h-3" />
              </p>
            </div>
          </a>
        </div>

        {/* Carousel */}
        <div
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="carousel-slide grid grid-cols-1 lg:grid-cols-3 gap-6" key={current}>

            {/* Main featured review */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-8 sm:p-10 relative">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-(--gold)/10" />

              <div className="flex gap-0.5 mb-5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                ))}
              </div>

              <p className="text-[var(--text-primary)] text-lg sm:text-xl leading-relaxed mb-6 italic font-light">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="border border-(--gold)/20 bg-(--gold)/5 inline-flex items-center gap-3 px-4 py-2 mb-6">
                <div>
                  <p className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase">Saved</p>
                  <p
                    className="text-[var(--gold)] text-2xl leading-none"
                    style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                  >
                    {review.savings}
                  </p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <p className="text-[var(--text-muted)] text-xs">{review.car}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-(--gold)/10 border border-(--gold)/20 flex items-center justify-center text-[var(--gold)] font-bold text-sm">
                  {review.initials}
                </div>
                <div>
                  <p className="text-[var(--text-primary)] text-sm font-semibold">{review.name}</p>
                  <p className="text-[var(--text-dim)] text-xs">{review.location} · {review.date}</p>
                </div>
              </div>
            </div>

            {/* Side — mini reviews list */}
            <div className="flex flex-col gap-3">
              {reviews.filter((_, i) => i !== current).slice(0, 3).map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(reviews.indexOf(r))}
                  className="text-left bg-[var(--bg-card)] border border-[var(--border)] hover:border-(--gold)/30 p-4 transition-all"
                >
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[var(--gold)] text-[var(--gold)]" />
                    ))}
                  </div>
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-2">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[var(--text-primary)] text-xs font-semibold">{r.name}</p>
                    <span className="text-[var(--gold)] text-xs font-bold">{r.savings}</span>
                  </div>
                </button>
              ))}

              {/* Nav arrows */}
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={prev}
                  className="flex-1 flex items-center justify-center gap-2 border border-[var(--border)] hover:border-(--gold)/40 text-[var(--text-muted)] hover:text-[var(--gold)] py-2.5 text-xs tracking-widest uppercase transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 border border-[var(--border)] hover:border-(--gold)/40 text-[var(--text-muted)] hover:text-[var(--gold)] py-2.5 text-xs tracking-widest uppercase transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex gap-1.5 justify-center pt-1">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all ${
                      i === current ? "w-5 h-1.5 bg-[var(--gold)]" : "w-1.5 h-1.5 bg-[var(--border)] hover:bg-(--gold)/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
