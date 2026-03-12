"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function FeatureToggle({ carId, featured }: { carId: string; featured: boolean }) {
  const [isFeatured, setIsFeatured] = useState(featured);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/feature`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFeatured(data.featured);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isFeatured ? "Remove from homepage featured" : "Feature on homepage"}
      className={`p-1.5 rounded-lg transition-colors ${
        isFeatured
          ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20"
          : "text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
      }`}
    >
      <Star className={`w-4 h-4 ${isFeatured ? "fill-yellow-400" : ""}`} />
    </button>
  );
}
