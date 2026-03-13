import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CarForm from "../../CarForm";
import { Car } from "@/types";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const raw = await prisma.car.findUnique({ where: { id } });
  if (!raw) notFound();

  const car: Car = {
    ...raw,
    features: JSON.parse(raw.features),
    images: JSON.parse(raw.images),
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1
          className="text-4xl leading-none text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
        >
          Edit: {car.year} {car.make} {car.model}
        </h1>
        <p className="text-[var(--text-dim)] text-sm">Update vehicle details, pricing, or status.</p>
      </div>
      <CarForm car={car} mode="edit" />
    </div>
  );
}
