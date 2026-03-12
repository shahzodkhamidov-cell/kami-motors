import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendFinancingNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status ? { status } : {};

  const applications = await prisma.financingApplication.findMany({
    where,
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    applications.map((app) => ({
      ...app,
      car: app.car
        ? {
            ...app.car,
            features: JSON.parse(app.car.features),
            images: JSON.parse(app.car.images),
          }
        : null,
    }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const car = await prisma.car.findUnique({ where: { id: body.carId } });
  if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });

  const application = await prisma.financingApplication.create({
    data: {
      carId: body.carId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      employmentStatus: body.employmentStatus,
      employer: body.employer || null,
      monthlyIncome: Number(body.monthlyIncome),
      creditScoreRange: body.creditScoreRange,
      downPayment: Number(body.downPayment),
      loanTerm: Number(body.loanTerm) || 60,
      additionalNotes: body.additionalNotes || null,
    },
  });

  // Send email notification (non-blocking)
  sendFinancingNotification({
    applicantName: `${body.firstName} ${body.lastName}`,
    applicantEmail: body.email,
    applicantPhone: body.phone,
    carYear: car.year,
    carMake: car.make,
    carModel: car.model,
    carPrice: car.price,
    downPayment: Number(body.downPayment),
    monthlyIncome: Number(body.monthlyIncome),
    creditScoreRange: body.creditScoreRange,
    employmentStatus: body.employmentStatus,
    applicationId: application.id,
  }).catch(console.error);

  return NextResponse.json(application, { status: 201 });
}
