import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bodyType = searchParams.get("bodyType");
  const status = searchParams.get("status");
  const featured = searchParams.get("featured");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const make = searchParams.get("make");
  const minYear = searchParams.get("minYear");
  const maxYear = searchParams.get("maxYear");

  const where: Record<string, unknown> = {};

  // admin passes status="all" to see everything; public gets only published cars
  if (status === "all") {
    // no filters — admin sees all cars
  } else if (status) {
    where.status = status;
    where.published = true;
  } else {
    // no status param = public inventory: all statuses but only published
    where.published = true;
  }
  if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
  if (featured === "true") where.featured = true;
  if (make) where.make = { equals: make, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
  }
  if (minYear || maxYear) {
    where.year = {};
    if (minYear) (where.year as Record<string, number>).gte = Number(minYear);
    if (maxYear) (where.year as Record<string, number>).lte = Number(maxYear);
  }

  let cars;
  try {
    cars = await prisma.car.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Failed to fetch cars:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const parsed = cars.map((car) => ({
    ...car,
    features: JSON.parse(car.features),
    images: JSON.parse(car.images),
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let car;
  try {
    car = await prisma.car.create({
      data: {
      vin: body.vin,
      year: Number(body.year),
      make: body.make,
      model: body.model,
      trim: body.trim || null,
      bodyType: body.bodyType,
      mileage: Number(body.mileage),
      price: Number(body.price),
      cleanTitleValue: Number(body.cleanTitleValue),
      color: body.color || null,
      engine: body.engine || null,
      transmission: body.transmission || null,
      drivetrain: body.drivetrain || null,
      fuelType: body.fuelType || null,
      description: body.description || null,
      numberOfOwners: body.numberOfOwners != null ? Number(body.numberOfOwners) : null,
      features: JSON.stringify(body.features || []),
      images: JSON.stringify(body.images || []),
      status: body.status || "available",
      featured: body.featured || false,
      published: body.published || false,
      },
    });
  } catch (err) {
    console.error("Failed to create car:", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ...car,
    features: JSON.parse(car.features),
    images: JSON.parse(car.images),
  });
}
