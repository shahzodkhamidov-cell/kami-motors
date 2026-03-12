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
          className="w-full bg-[#C9A84C] hover:bg-[#E2CB7E] disabled:bg-[#2A2A26] disabled:text-[#6B6B6B] disabled:cursor-not-allowed text-[#080807] font-bold py-3.5 text-sm tracking-widest uppercase transition-colors"
        >
          {car.status === "available" ? "Apply for Financing" : "Not Available"}
        </button>
        <a
          href="tel:+13058158880"
          className="flex items-center justify-center gap-2 w-full bg-[#1A1A18] border border-[#2A2A26] hover:border-[#C9A84C]/40 text-[#B0B0B8] hover:text-[#F8EAD9] font-medium py-3 text-sm tracking-widest uppercase transition-colors"
        >
          <Phone className="w-4 h-4 text-[#C9A84C]" />
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
