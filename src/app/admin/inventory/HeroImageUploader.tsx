"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, ImagePlus, X } from "lucide-react";

interface HeroImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

const MIN_WIDTH = 800; // px across the car itself; smaller pictures look soft in the carousel
const MAX_WIDTH = 1400; // same as listing photos (the upload route resizes to this anyway)
const MAX_BYTES = 4.3 * 1024 * 1024; // stays under Vercel's 4.5MB request limit

const NOT_TRANSPARENT =
  "This picture still has a solid background behind the car, so it can't be used. If you removed the background in " +
  "Canva, download it again as PNG with \"Transparent background\" ticked (a Canva Pro option), then upload that file.";

// Check the picture has a transparent background, then crop it to the car with even margins
// (4% each side, 3% on top, 9% below) so every carousel image sits at the same size.
async function prepare(file: File): Promise<Blob> {
  if (!/^image\/(png|webp)$/.test(file.type)) {
    throw new Error("Use a PNG or WebP file with a transparent background.");
  }
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("This file could not be opened as an image."));
    i.src = URL.createObjectURL(file);
  });
  const W = img.naturalWidth, H = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);
  const d = ctx.getImageData(0, 0, W, H).data;
  const alpha = (x: number, y: number) => d[(y * W + x) * 4 + 3];

  // a real cutout has empty (transparent) space around the car, even when cropped tight;
  // a picture saved with its background filled in (white, say) has none
  let clear = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 13) clear++;
  if (clear < W * H * 0.05) throw new Error(NOT_TRANSPARENT);

  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (alpha(x, y) > 5) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
  if (x1 < 0) throw new Error("The image is empty.");
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  if (bw < MIN_WIDTH) {
    throw new Error(`The car is only ${bw}px wide. Use a picture at least ${MIN_WIDTH}px wide.`);
  }

  const pl = bw * 0.04, pt = bh * 0.03, pb = bh * 0.09;
  const k = Math.min(1, MAX_WIDTH / (bw + 2 * pl));
  const out = document.createElement("canvas");
  out.width = Math.round((bw + 2 * pl) * k);
  out.height = Math.round((bh + pt + pb) * k);
  out.getContext("2d")!.drawImage(canvas, x0, y0, bw, bh, pl * k, pt * k, bw * k, bh * k);
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not prepare the image. Try again.");
  if (blob.size > MAX_BYTES) throw new Error("The image is too large. Save it smaller and try again.");
  return blob;
}

export default function HeroImageUploader({ value, onChange }: HeroImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const blob = await prepare(file);
      const fd = new FormData();
      fd.append("file", new File([blob], "hero.png", { type: "image/png" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed. Try again.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group aspect-[2/1] max-w-md border border-[var(--border)] bg-[var(--bg-card-2)]">
          <Image src={value} alt="Homepage carousel image" fill className="object-contain p-3" unoptimized />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-2 py-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 bg-[var(--bg-card-2)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-bold px-4 py-2.5 text-sm tracking-wide uppercase transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
        {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">{error}</p>
      )}
    </div>
  );
}
