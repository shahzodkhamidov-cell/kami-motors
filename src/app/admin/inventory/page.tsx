import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Eye, Star } from "lucide-react";
import { formatCurrency, formatMileage } from "@/lib/utils";
import DeleteCarButton from "./DeleteCarButton";
import FeatureToggle from "./FeatureToggle";

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const cars = await prisma.car.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const statusColor = {
    available: "bg-[var(--gold)]/10 text-[var(--gold)]",
    sold: "bg-red-500/10 text-red-500",
    pending: "bg-yellow-500/10 text-yellow-500",
    coming_soon: "bg-blue-500/10 text-blue-500",
  };

  const statusLabel: Record<string, string> = {
    available: "Available",
    sold: "Sold",
    pending: "Pending",
    coming_soon: "Coming Soon",
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-4xl leading-none text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
          >
            Inventory
          </h1>
          <p className="text-[var(--text-dim)] text-sm">{cars.length} total vehicles</p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-4 py-2.5 text-sm tracking-widest uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </Link>
      </div>

      {/* Featured info banner */}
      <div className="flex items-start gap-3 bg-[var(--gold)]/5 border border-[var(--gold)]/20 p-4 mb-6">
        <Star className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)] shrink-0 mt-0.5" />
        <p className="text-[var(--text-muted)] text-sm">
          Click the <span className="text-[var(--gold)] font-semibold">★ star</span> next to any car to feature it on the homepage carousel. Featured cars must have status <span className="text-[var(--gold)] font-semibold">Available</span> to appear.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)]">
          <div className="text-4xl mb-3">🚗</div>
          <h3
            className="text-[var(--text-primary)] text-2xl leading-none mb-2"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            No Cars Yet
          </h3>
          <p className="text-[var(--text-dim)] text-sm mb-6">Add your first car to start building inventory.</p>
          <Link
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-5 py-2.5 text-sm tracking-widest uppercase transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Car
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Vehicle</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Mileage</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Our Price</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Savings</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Status</th>
                  <th className="text-center text-[var(--gold)] text-[10px] tracking-widest uppercase font-medium px-4 py-3" title="Featured on homepage">★ Home</th>
                  <th className="text-right text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => {
                  const savings = car.cleanTitleValue - car.price;
                  return (
                    <tr key={car.id} className={`border-b border-[var(--border)]/50 hover:bg-[var(--bg-card-2)] transition-colors ${car.featured ? "bg-(--gold)/3" : ""}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[var(--text-primary)] text-sm font-medium">
                            {car.year} {car.make} {car.model}
                          </p>
                          <p className="text-[var(--text-dim)] text-xs">{car.vin}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] text-sm">{formatMileage(car.mileage)}</td>
                      <td className="px-4 py-3 text-[var(--text-primary)] text-sm font-medium">{formatCurrency(car.price)}</td>
                      <td className="px-4 py-3">
                        {savings > 0 ? (
                          <span className="text-[var(--gold)] text-sm font-medium">
                            +{formatCurrency(savings)}
                          </span>
                        ) : (
                          <span className="text-[var(--text-dim)] text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 ${
                            statusColor[car.status as keyof typeof statusColor] || "bg-[var(--border)] text-[var(--text-muted)]"
                          }`}
                        >
                          {statusLabel[car.status] || car.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <FeatureToggle carId={car.id} featured={car.featured} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/inventory/${car.id}`}
                            target="_blank"
                            className="text-[var(--text-dim)] hover:text-blue-500 transition-colors p-1.5 hover:bg-blue-500/10"
                            title="View listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/inventory/${car.id}/edit`}
                            className="text-[var(--text-dim)] hover:text-[var(--gold)] transition-colors p-1.5 hover:bg-(--gold)/10"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteCarButton carId={car.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
