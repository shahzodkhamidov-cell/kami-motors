"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "approved", label: "Approved", color: "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20" },
  { value: "denied", label: "Denied", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

export default function ApplicationStatusUpdater({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    setStatus(newStatus);
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  const current = statusOptions.find((s) => s.value === status);

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium px-2.5 py-1.5 border ${current?.color}`}>
        {current?.label}
      </span>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-1.5 text-xs focus:border-[var(--gold)] transition-colors cursor-pointer"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
