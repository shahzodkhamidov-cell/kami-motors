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
    available: "bg-green-500/10 text-green-400",
    sold: "bg-red-500/10 text-red-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    coming_soon: "bg-blue-500/10 text-blue-400",
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
          <h1 className="text-2xl font-black text-white">Inventory</h1>
          <p className="text-gray-500 text-sm">{cars.length} total vehicles</p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </Link>
      </div>

      {/* Featured info banner */}
      <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
        <p className="text-yellow-200/70 text-sm">
          Click the <span className="text-yellow-400 font-semibold">★ star</span> next to any car to feature it on the homepage carousel. Featured cars must have status <span className="text-yellow-400 font-semibold">Available</span> to appear.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-4xl mb-3">🚗</div>
          <h3 className="text-white font-bold mb-2">No cars yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first car to start building inventory.</p>
          <Link
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Car
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Vehicle</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Mileage</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Our Price</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Savings</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                  <th className="text-center text-yellow-400 text-xs font-medium px-4 py-3" title="Featured on homepage">★ Home</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => {
                  const savings = car.cleanTitleValue - car.price;
                  return (
                    <tr key={car.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${car.featured ? "bg-yellow-500/5" : ""}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {car.year} {car.make} {car.model}
                          </p>
                          <p className="text-gray-500 text-xs">{car.vin}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{formatMileage(car.mileage)}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{formatCurrency(car.price)}</td>
                      <td className="px-4 py-3">
                        {savings > 0 ? (
                          <span className="text-green-400 text-sm font-medium">
                            +{formatCurrency(savings)}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            statusColor[car.status as keyof typeof statusColor] || "bg-gray-700 text-gray-300"
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
                            className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10"
                            title="View listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/inventory/${car.id}/edit`}
                            className="text-gray-400 hover:text-green-400 transition-colors p-1.5 rounded-lg hover:bg-green-500/10"
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
