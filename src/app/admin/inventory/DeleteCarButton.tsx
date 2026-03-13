"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await fetch(`/api/cars/${carId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className={`transition-colors p-1.5 text-sm ${
        confirming
          ? "bg-red-500 text-white"
          : "text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10"
      }`}
      title={confirming ? "Click again to confirm" : "Delete"}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
