"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Car } from "@/types";
import FinancingModal from "@/components/FinancingModal";

export default function CarDetailClient({ car }: { car: Car }) {
  const [showFinancing, setShowFinancing] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setShowFinancing(true)}
          disabled={car.status !== "available"}
          className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-[var(--border)] disabled:text-[var(--text-dim)] disabled:cursor-not-allowed text-[#080807] font-bold py-3.5 text-sm tracking-widest uppercase transition-colors"
        >
          {car.status === "available" ? "Apply for Financing" : "Not Available"}
        </button>
        <a
          href="tel:+13058158880"
          className="flex items-center justify-center gap-2 w-full bg-[var(--bg-card-2)] border border-[var(--border)] hover:border-[var(--gold)]/40 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium py-3 text-sm tracking-widest uppercase transition-colors"
        >
          <Phone className="w-4 h-4 text-[var(--gold)]" />
          (305) 815-8880
        </a>
      </div>

      <FinancingModal
        car={car}
        isOpen={showFinancing}
        onClose={() => setShowFinancing(false)}
      />
    </>
  );
}
