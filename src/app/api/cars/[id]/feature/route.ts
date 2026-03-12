import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id }, select: { featured: true } });
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.car.update({
    where: { id },
    data: { featured: !car.featured },
    select: { featured: true },
  });

  return NextResponse.json({ featured: updated.featured });
}
