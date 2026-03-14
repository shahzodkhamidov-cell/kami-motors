"use client";

import { useState } from "react";
import { Globe, EyeOff, Loader2 } from "lucide-react";

export default function PublishToggle({ carId, published }: { carId: string; published: boolean }) {
  const [isPublished, setIsPublished] = useState(published);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${carId}/publish`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsPublished(data.published);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-all border ${
        isPublished
          ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
          : "bg-gray-800 border-gray-700 text-gray-500 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isPublished ? (
        <Globe className="w-3 h-3" />
      ) : (
        <EyeOff className="w-3 h-3" />
      )}
      {isPublished ? "Live" : "Draft"}
    </button>
  );
}
