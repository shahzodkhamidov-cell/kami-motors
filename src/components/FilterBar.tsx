"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BODY_TYPES } from "@/lib/utils";

interface Filters {
  search: string;
  bodyType: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  make: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalResults: number;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function FilterBar({ filters, onChange, totalResults }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const clear = () =>
    onChange({ search: "", bodyType: "", minPrice: "", maxPrice: "", minYear: "", maxYear: "", make: "" });

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const inputClass =
    "w-full bg-[#0D0D0B] border border-[#2A2A26] text-[#F8EAD9] text-xs px-3 py-2 tracking-wide placeholder-[#6B6B6B] focus:border-[#C9A84C] transition-colors";

  return (
    <div className="bg-[#111110] border border-[#2A2A26] p-5 mb-8">
      {/* Search row */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
          <input
            type="text"
            placeholder="Search make, model, year..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full bg-[#0D0D0B] border border-[#2A2A26] text-[#F8EAD9] text-sm pl-10 pr-4 py-2.5 placeholder-[#6B6B6B] focus:border-[#C9A84C] transition-colors tracking-wide"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors border ${
            showAdvanced
              ? "bg-[#C9A84C]/10 border-[#C9A84C]/40 text-[#C9A84C]"
              : "bg-[#0D0D0B] border-[#2A2A26] text-[#B0B0B8] hover:border-[#C9A84C]/30 hover:text-[#F8EAD9]"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-[#C9A84C] text-[#080807] text-[10px] w-4 h-4 flex items-center justify-center font-black">
              {activeFilters}
            </span>
          )}
        </button>
        {activeFilters > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 px-3 py-2.5 text-xs text-[#B0B0B8] hover:text-[#C9A84C] bg-[#0D0D0B] border border-[#2A2A26] hover:border-[#C9A84C]/30 transition-all uppercase tracking-widest"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Body type quick filters */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => update("bodyType", "")}
          className={`px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase transition-colors border ${
            !filters.bodyType
              ? "bg-[#C9A84C] border-[#C9A84C] text-[#080807]"
              : "bg-[#0D0D0B] border-[#2A2A26] text-[#B0B0B8] hover:border-[#C9A84C]/30 hover:text-[#F8EAD9]"
          }`}
        >
          All Types
        </button>
        {BODY_TYPES.slice(0, 6).map((type) => (
          <button
            key={type}
            onClick={() => update("bodyType", filters.bodyType === type ? "" : type)}
            className={`px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase transition-colors border ${
              filters.bodyType === type
                ? "bg-[#C9A84C] border-[#C9A84C] text-[#080807]"
                : "bg-[#0D0D0B] border-[#2A2A26] text-[#B0B0B8] hover:border-[#C9A84C]/30 hover:text-[#F8EAD9]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#2A2A26] mt-3">
          <div>
            <label className="block text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1.5">Min Price</label>
            <select value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} className={inputClass}>
              <option value="">No min</option>
              {[500000, 1000000, 1500000, 2000000, 2500000, 3000000].map((v) => (
                <option key={v} value={v}>${(v / 100).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1.5">Max Price</label>
            <select value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} className={inputClass}>
              <option value="">No max</option>
              {[1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000].map((v) => (
                <option key={v} value={v}>${(v / 100).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1.5">Min Year</label>
            <select value={filters.minYear} onChange={(e) => update("minYear", e.target.value)} className={inputClass}>
              <option value="">Any</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#6B6B6B] text-[10px] tracking-widest uppercase mb-1.5">Max Year</label>
            <select value={filters.maxYear} onChange={(e) => update("maxYear", e.target.value)} className={inputClass}>
              <option value="">Any</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="mt-3 text-[#6B6B6B] text-[10px] tracking-widest uppercase">
        {totalResults} vehicle{totalResults !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}
