import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatMileage(miles: number): string {
  return new Intl.NumberFormat("en-US").format(miles) + " mi";
}

export function getSavingsPercent(price: number, cleanTitle: number): number {
  if (cleanTitle <= 0) return 0;
  return Math.round(((cleanTitle - price) / cleanTitle) * 100);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Coupe",
  "Convertible",
  "Wagon",
  "Hatchback",
  "Crossover",
  "Minivan",
] as const;

export const FUEL_TYPES = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Electric",
  "Plug-in Hybrid",
] as const;

export const TRANSMISSION_TYPES = ["Automatic", "Manual", "CVT"] as const;

export const DRIVETRAIN_TYPES = ["FWD", "RWD", "AWD", "4WD"] as const;
