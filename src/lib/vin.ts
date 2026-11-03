import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Each VIN can be on one listing only. When it is already taken, answer with a message that names that listing and
// its id, so the form can link to it instead of showing the raw database error.
export async function vinTakenResponse(vin: string, exceptId?: string) {
  const existing = await prisma.car.findUnique({
    where: { vin },
    select: { id: true, year: true, make: true, model: true, status: true, published: true },
  });
  if (!existing || existing.id === exceptId) return null;

  const state = [existing.status.replace("_", " "), existing.published ? "published" : "not published"].join(", ");
  return NextResponse.json(
    {
      error: `This VIN (${vin}) is already on another listing: ${existing.year} ${existing.make} ${existing.model} (${state}). Open that listing to update it, or check the VIN for a typo.`,
      existingId: existing.id,
    },
    { status: 409 }
  );
}

export function isVinConflict(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}
