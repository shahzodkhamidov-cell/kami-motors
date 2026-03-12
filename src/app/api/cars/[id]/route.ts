import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...car,
    features: JSON.parse(car.features),
    images: JSON.parse(car.images),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const car = await prisma.car.update({
    where: { id },
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
      features: JSON.stringify(body.features || []),
      images: JSON.stringify(body.images || []),
      status: body.status || "available",
      featured: body.featured || false,
    },
  });

  return NextResponse.json({
    ...car,
    features: JSON.parse(car.features),
    images: JSON.parse(car.images),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
