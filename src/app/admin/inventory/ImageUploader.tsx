"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus, GripVertical } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!imageFiles.length) return;

      setUploading(true);
      try {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("files", f));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.urls) onChange([...images, ...data.urls]);
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingOver(false);
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  // Reorder via drag
  const handleReorderDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === toIdx) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(toIdx, 0, moved);
    onChange(reordered);
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          draggingOver
            ? "border-green-400 bg-green-500/10"
            : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            <p className="text-gray-400 text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${draggingOver ? "bg-green-500/20" : "bg-gray-800"}`}>
              {draggingOver ? (
                <Upload className="w-6 h-6 text-green-400" />
              ) : (
                <ImagePlus className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {draggingOver ? "Drop images here" : "Drag & drop photos here"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">or click to browse · JPG, PNG, WebP</p>
            </div>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs mb-2">
            {images.length} photo{images.length !== 1 ? "s" : ""} · Drag to reorder · First image is the main photo
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div
                key={url}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => { e.preventDefault(); setDropIndex(i); }}
                onDrop={(e) => handleReorderDrop(e, i)}
                onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                className={`relative group aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                  dragIndex === i
                    ? "opacity-40 border-gray-600"
                    : dropIndex === i && dragIndex !== null
                    ? "border-green-400 scale-105"
                    : "border-transparent"
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" unoptimized />

                {/* Main badge */}
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold z-10">
                    MAIN
                  </span>
                )}

                {/* Drag handle */}
                <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-black/60 rounded p-0.5">
                    <GripVertical className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-400 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}

            {/* Add more tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 flex items-center justify-center cursor-pointer transition-colors group"
            >
              <div className="flex flex-col items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-[10px]">Add more</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
