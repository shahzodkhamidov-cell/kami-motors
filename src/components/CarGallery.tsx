"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Expand } from "lucide-react";

interface CarGalleryProps {
  images: string[];
  alt: string;
}

export default function CarGallery({ images, alt }: CarGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);

  const openLightbox = (i: number) => {
    setActive(i);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const goTo = (i: number) => {
    setActive(i);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { prev(); setZoom(1); setPan({ x: 0, y: 0 }); }
      if (e.key === "ArrowRight") { next(); setZoom(1); setPan({ x: 0, y: 0 }); }
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  useEffect(() => {
    if (lightbox) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (!images.length) {
    return (
      <div className="aspect-[16/10] bg-[var(--bg-card-2)] border border-[var(--border)] flex items-center justify-center">
        <p className="text-[var(--text-dim)] text-sm tracking-widest uppercase">Photos coming soon</p>
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[16/10] bg-[var(--bg-card-2)] border border-[var(--border)] overflow-hidden group">
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {/* Expand button */}
        <button
          onClick={() => openLightbox(active)}
          className="absolute bottom-3 right-3 bg-[var(--bg-primary)]/80 backdrop-blur border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
          title="View fullscreen"
        >
          <Expand className="w-4 h-4" />
        </button>
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-[var(--bg-primary)]/80 backdrop-blur border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--bg-primary)]/80 backdrop-blur border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {/* Counter */}
        {images.length > 1 && (
          <span className="absolute bottom-3 left-3 bg-[var(--bg-primary)]/80 backdrop-blur text-[var(--text-muted)] text-xs px-2 py-1 border border-[var(--border)] z-10">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 aspect-[4/3] overflow-hidden border transition-all ${
                i === active
                  ? "border-[var(--gold)] opacity-100"
                  : "border-[var(--border)] opacity-50 hover:opacity-80"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <span className="text-white/60 text-sm">{active + 1} / {images.length}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                disabled={zoom <= 1}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-1"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
                disabled={zoom >= 3}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-1"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20" />
              <button onClick={closeLightbox} className="text-white/60 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image area — keep native img for zoom/pan transform support */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center"
            style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
            onMouseDown={(e) => {
              if (zoom <= 1) return;
              setDragging(true);
              dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
            }}
            onMouseMove={(e) => {
              if (!dragging) return;
              setPan({
                x: dragStart.current.px + e.clientX - dragStart.current.x,
                y: dragStart.current.py + e.clientY - dragStart.current.y,
              });
            }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active]}
              alt={alt}
              draggable={false}
              className="max-h-full max-w-full object-contain select-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: dragging ? "none" : "transform 0.2s ease",
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => goTo((active - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => goTo((active + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 px-6 py-4 overflow-x-auto border-t border-white/10 shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 w-16 aspect-[4/3] overflow-hidden border-2 transition-all ${
                    i === active ? "border-[var(--gold)] opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
