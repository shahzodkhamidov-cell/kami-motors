"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Plus, X, Upload, ImagePlus } from "lucide-react";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSION_TYPES, DRIVETRAIN_TYPES } from "@/lib/utils";
import { Car } from "@/types";

interface CarFormProps {
  car?: Car;
  mode: "create" | "edit";
}

const defaultValues = {
  vin: "",
  year: new Date().getFullYear(),
  make: "",
  model: "",
  trim: "",
  bodyType: "Sedan",
  mileage: "",
  price: "",
  cleanTitleValue: "",
  color: "",
  engine: "",
  transmission: "Automatic",
  drivetrain: "FWD",
  fuelType: "Gasoline",
  description: "",
  numberOfOwners: "",
  status: "available",
  featured: false,
  features: [] as string[],
  images: [] as string[],
};

export default function CarForm({ car, mode }: CarFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => {
    if (car) {
      return {
        vin: car.vin,
        year: car.year,
        make: car.make,
        model: car.model,
        trim: car.trim || "",
        bodyType: car.bodyType,
        mileage: String(car.mileage),
        price: String(car.price / 100),
        cleanTitleValue: String(car.cleanTitleValue / 100),
        color: car.color || "",
        engine: car.engine || "",
        transmission: car.transmission || "Automatic",
        drivetrain: car.drivetrain || "FWD",
        fuelType: car.fuelType || "Gasoline",
        description: car.description || "",
        numberOfOwners: car.numberOfOwners != null ? String(car.numberOfOwners) : "",
        status: car.status,
        featured: car.featured,
        features: car.features,
        images: car.images,
      };
    }
    return defaultValues;
  });

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const lookupVin = async () => {
    if (form.vin.length !== 17) return;
    setVinLoading(true);
    try {
      const res = await fetch(`/api/vin?vin=${form.vin}`);
      if (!res.ok) throw new Error("VIN not found");
      const data = await res.json();
      setForm((f) => ({
        ...f,
        year: Number(data.year) || f.year,
        make: data.make || f.make,
        model: data.model || f.model,
        trim: data.trim || f.trim,
        bodyType: data.bodyType || f.bodyType,
        engine: data.engine || f.engine,
        transmission: data.transmission || f.transmission,
        drivetrain: data.drivetrain || f.drivetrain,
        fuelType: data.fuelType || f.fuelType,
      }));
    } catch {
      setError("Could not decode VIN. Please fill in details manually.");
    } finally {
      setVinLoading(false);
    }
  };

  const addFeature = () => {
    const f = newFeature.trim();
    if (f && !form.features.includes(f)) {
      set("features", [...form.features, f]);
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) =>
    set("features", form.features.filter((f: string) => f !== feature));

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url && !form.images.includes(url)) {
      set("images", [...form.images, url]);
      setNewImageUrl("");
    }
  };

  const removeImage = (url: string) =>
    set("images", form.images.filter((i: string) => i !== url));

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of arr) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        urls.push(data.url);
      }
    }
    set("images", [...form.images, ...urls]);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      price: Math.round(parseFloat(form.price as string) * 100),
      cleanTitleValue: Math.round(parseFloat(form.cleanTitleValue as string) * 100),
      mileage: parseInt(form.mileage as string),
      numberOfOwners: form.numberOfOwners !== "" ? parseInt(form.numberOfOwners as string) : null,
    };

    try {
      const url = mode === "create" ? "/api/cars" : `/api/cars/${car?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:border-[var(--gold)] transition-colors";
  const labelClass = "block text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-1.5";
  const selectClass = inputClass + " cursor-pointer";

  const sectionClass = "bg-[var(--bg-card)] border border-[var(--border)] p-6";
  const sectionTitle = "text-[var(--text-primary)] text-xl leading-none mb-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* VIN Lookup */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          VIN Lookup
        </h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>VIN (17 characters)</label>
            <input
              value={form.vin}
              onChange={(e) => set("vin", e.target.value.toUpperCase())}
              maxLength={17}
              placeholder="1HGCM82633A004352"
              className={inputClass + " font-mono tracking-wider"}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={lookupVin}
              disabled={form.vin.length !== 17 || vinLoading}
              className="flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-[var(--border)] disabled:text-[var(--text-dim)] text-[#080807] font-bold px-4 py-2.5 text-sm tracking-wide uppercase transition-colors"
            >
              {vinLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Decode VIN
            </button>
          </div>
        </div>
        <p className="text-[var(--text-dim)] text-xs mt-2">
          Enter VIN and click Decode to auto-fill year, make, model, and specs from NHTSA database.
        </p>
      </div>

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          Vehicle Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Year *</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => set("year", Number(e.target.value))}
              min={1990}
              max={new Date().getFullYear() + 1}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Make *</label>
            <input
              value={form.make}
              onChange={(e) => set("make", e.target.value)}
              placeholder="Toyota"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Model *</label>
            <input
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Camry"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Trim</label>
            <input
              value={form.trim}
              onChange={(e) => set("trim", e.target.value)}
              placeholder="LE, XSE..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Body Type *</label>
            <select value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)} className={selectClass} required>
              {BODY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              placeholder="White, Black..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mileage *</label>
            <input
              type="number"
              value={form.mileage}
              onChange={(e) => set("mileage", e.target.value)}
              placeholder="45000"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>No. of Owners</label>
            <input
              type="number"
              value={form.numberOfOwners}
              onChange={(e) => set("numberOfOwners", e.target.value)}
              placeholder="1"
              min={1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
              <option value="available">Available</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <label className={labelClass}>Engine</label>
            <input value={form.engine} onChange={(e) => set("engine", e.target.value)} placeholder="2.5L 4-Cylinder" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Transmission</label>
            <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectClass}>
              {TRANSMISSION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Drivetrain</label>
            <select value={form.drivetrain} onChange={(e) => set("drivetrain", e.target.value)} className={selectClass}>
              {DRIVETRAIN_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fuel Type</label>
            <select value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)} className={selectClass}>
              {FUEL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="w-4 h-4 accent-[var(--gold)]"
          />
          <label htmlFor="featured" className="text-[var(--text-muted)] text-sm cursor-pointer">
            Feature this car on the homepage
          </label>
        </div>
      </div>

      {/* Pricing */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          Pricing
        </h2>
        <p className="text-[var(--text-dim)] text-xs mb-4">
          Enter your asking price and the estimated clean title market value. The website will automatically show customers how much they save.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Our Price ($) *</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="18500"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Clean Title Market Value ($) *</label>
            <input
              type="number"
              step="0.01"
              value={form.cleanTitleValue}
              onChange={(e) => set("cleanTitleValue", e.target.value)}
              placeholder="28000"
              className={inputClass}
              required
            />
            <p className="text-[var(--text-dim)] text-xs mt-1">Look up on KBB / CarGurus / Blackbook</p>
          </div>
        </div>
        {form.price && form.cleanTitleValue && (
          <div className="mt-3 bg-(--gold)/5 border border-(--gold)/20 p-3">
            <p className="text-[var(--gold)] text-sm font-medium">
              Customer savings:{" "}
              <span className="font-black">
                ${(parseFloat(form.cleanTitleValue as string) - parseFloat(form.price as string)).toLocaleString()}
              </span>{" "}
              (
              {Math.round(
                ((parseFloat(form.cleanTitleValue as string) - parseFloat(form.price as string)) /
                  parseFloat(form.cleanTitleValue as string)) *
                  100
              )}
              % off clean title value)
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          Description
        </h2>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          placeholder="Describe the vehicle's condition, rebuild history, notable features..."
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Features */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          Features
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
            placeholder="e.g. Backup Camera, Leather Seats..."
            className={inputClass + " flex-1"}
          />
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-1 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-3 py-2.5 text-sm tracking-wide uppercase transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {form.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.features.map((f: string) => (
              <span key={f} className="flex items-center gap-1.5 bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm px-3 py-1.5">
                {f}
                <button type="button" onClick={() => removeFeature(f)} className="text-[var(--text-dim)] hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div className={sectionClass}>
        <h2
          className={sectionTitle}
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          Photos
        </h2>

        {/* Drag & drop upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed py-8 mb-4 cursor-pointer transition-colors ${
            dragOver
              ? "border-[var(--gold)] bg-(--gold)/5"
              : "border-[var(--border)] hover:border-[var(--gold)]/50 hover:bg-(--gold)/5"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
              <p className="text-[var(--text-muted)] text-sm">Uploading to Supabase...</p>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-[var(--text-dim)]" />
              <p className="text-[var(--text-muted)] text-sm font-medium">
                Drop photos here or <span className="text-[var(--gold)]">click to browse</span>
              </p>
              <p className="text-[var(--text-dim)] text-xs">JPG, PNG, WEBP — multiple files supported</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>

        {/* URL paste fallback */}
        <div className="flex gap-2 mb-4">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            placeholder="Or paste an image URL..."
            className={inputClass + " flex-1"}
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 bg-[var(--bg-card-2)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-bold px-3 py-2.5 text-sm tracking-wide uppercase transition-colors"
          >
            <Upload className="w-4 h-4" />
            Add
          </button>
        </div>

        {form.images.length > 0 && (
          <div>
            <p className="text-[var(--text-dim)] text-xs mb-2">Drag to reorder — first photo is the main listing image.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {form.images.map((url: string, i: number) => (
                <div
                  key={url}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                  onDragEnd={() => {
                    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
                      const newImages = [...form.images];
                      const [moved] = newImages.splice(dragIndex, 1);
                      newImages.splice(dragOverIndex, 0, moved);
                      set("images", newImages);
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`relative group aspect-[4/3] bg-[var(--bg-card-2)] overflow-hidden border cursor-grab active:cursor-grabbing transition-opacity ${
                    dragOverIndex === i && dragIndex !== i
                      ? "border-[var(--gold)] opacity-50"
                      : "border-[var(--border)]"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-[var(--gold)] text-[#080807] text-xs px-1.5 py-0.5 font-bold">
                      MAIN
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-none bg-[var(--bg-card-2)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] font-medium px-6 py-3 text-sm tracking-wide uppercase transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-(--gold)/40 text-[#080807] font-bold py-3 text-sm tracking-widest uppercase transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Add to Inventory"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
