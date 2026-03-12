import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Car, FileText, TrendingUp, Plus, ChevronRight, Clock,
  DollarSign, BarChart3, Users, Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function getSavingsPct(price: number, cleanValue: number) {
  if (!cleanValue) return 0;
  return Math.round(((cleanValue - price) / cleanValue) * 100);
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCars,
    availableCars,
    soldCars,
    pendingCars,
    comingSoonCars,
    totalApplications,
    pendingApplications,
    soldThisMonth,
    soldLastMonth,
    newAppsThisMonth,
    allSoldCars,
    recentCars,
    recentApplications,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: "available" } }),
    prisma.car.count({ where: { status: "sold" } }),
    prisma.car.count({ where: { status: "pending" } }),
    prisma.car.count({ where: { status: "coming_soon" } }),
    prisma.financingApplication.count(),
    prisma.financingApplication.count({ where: { status: "pending" } }),
    prisma.car.count({ where: { status: "sold", updatedAt: { gte: startOfMonth } } }),
    prisma.car.count({
      where: { status: "sold", updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.financingApplication.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.car.findMany({
      where: { status: "sold" },
      select: { price: true, cleanTitleValue: true },
    }),
    prisma.car.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, year: true, make: true, model: true,
        price: true, status: true, createdAt: true,
      },
    }),
    prisma.financingApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, status: true, createdAt: true,
        car: { select: { year: true, make: true, model: true } },
      },
    }),
  ]);

  // Calculate revenue & savings stats from sold cars
  const totalRevenue = allSoldCars.reduce((sum, c) => sum + c.price, 0);
  const totalSavingsGenerated = allSoldCars.reduce(
    (sum, c) => sum + Math.max(0, c.cleanTitleValue - c.price),
    0
  );
  const avgSavingsPct =
    allSoldCars.length > 0
      ? Math.round(
          allSoldCars.reduce((sum, c) => sum + getSavingsPct(c.price, c.cleanTitleValue), 0) /
            allSoldCars.length
        )
      : 0;

  const salesTrend =
    soldLastMonth > 0
      ? Math.round(((soldThisMonth - soldLastMonth) / soldLastMonth) * 100)
      : soldThisMonth > 0
      ? 100
      : 0;

  const statusColor: Record<string, string> = {
    available: "bg-green-500/10 text-green-400",
    sold: "bg-red-500/10 text-red-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    coming_soon: "bg-blue-500/10 text-blue-400",
  };
  const statusLabel: Record<string, string> = {
    available: "Available", sold: "Sold", pending: "Pending", coming_soon: "Coming Soon",
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {session.user?.name}</p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </Link>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Available",
            value: availableCars,
            sub: `${comingSoonCars} coming soon`,
            icon: Car,
            color: "text-green-400",
            bg: "bg-green-500/10",
            href: "/admin/inventory",
          },
          {
            label: "Total Sold",
            value: soldCars,
            sub: `${soldThisMonth} this month${salesTrend !== 0 ? ` (${salesTrend > 0 ? "+" : ""}${salesTrend}%)` : ""}`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            href: "/admin/inventory",
          },
          {
            label: "Applications",
            value: totalApplications,
            sub: `${pendingApplications} pending`,
            icon: FileText,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            href: "/admin/applications",
          },
          {
            label: "Pending / In Progress",
            value: pendingCars,
            sub: `${totalCars} total inventory`,
            icon: Clock,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            href: "/admin/inventory",
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">{label}</p>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-gray-500 text-xs mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Revenue & Savings stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-gray-500 text-xs mt-1">from {soldCars} sold vehicles</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm">Customer Savings Generated</p>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(totalSavingsGenerated)}</p>
          <p className="text-gray-500 text-xs mt-1">total savings vs clean title</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm">Avg. Savings Per Car</p>
          </div>
          <p className="text-2xl font-black text-white">{avgSavingsPct}%</p>
          <p className="text-gray-500 text-xs mt-1">avg discount vs clean title market</p>
        </div>
      </div>

      {/* This month snapshot */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-400" />
          This Month Snapshot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Cars Sold", value: soldThisMonth, color: "text-green-400" },
            { label: "Cars Last Month", value: soldLastMonth, color: "text-gray-300" },
            { label: "New Applications", value: newAppsThisMonth, color: "text-yellow-400" },
            {
              label: "Sales Trend",
              value: salesTrend > 0 ? `+${salesTrend}%` : salesTrend < 0 ? `${salesTrend}%` : "—",
              color: salesTrend > 0 ? "text-green-400" : salesTrend < 0 ? "text-red-400" : "text-gray-400",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory status breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Car className="w-4 h-4 text-green-400" />
          Inventory Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { label: "Available", count: availableCars, total: totalCars, color: "bg-green-500" },
            { label: "Coming Soon", count: comingSoonCars, total: totalCars, color: "bg-blue-500" },
            { label: "Pending", count: pendingCars, total: totalCars, color: "bg-yellow-500" },
            { label: "Sold", count: soldCars, total: totalCars, color: "bg-gray-500" },
          ].map(({ label, count, total, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`${color} h-2 rounded-full transition-all`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cars */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Recent Inventory</h2>
            <Link href="/admin/inventory" className="text-green-400 text-xs hover:text-green-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCars.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No cars yet</p>
            ) : (
              recentCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/admin/inventory/${car.id}/edit`}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors group"
                >
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="text-gray-500 text-xs">{formatCurrency(car.price)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusColor[car.status] || "bg-gray-700 text-gray-300"}`}>
                    {statusLabel[car.status] || car.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">
              Recent Applications
              {pendingApplications > 0 && (
                <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-md">
                  {pendingApplications} new
                </span>
              )}
            </h2>
            <Link href="/admin/applications" className="text-green-400 text-xs hover:text-green-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentApplications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No applications yet</p>
            ) : (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors group"
                >
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {app.car?.year} {app.car?.make} {app.car?.model}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      app.status === "pending" ? "bg-yellow-500/10 text-yellow-400"
                      : app.status === "approved" ? "bg-green-500/10 text-green-400"
                      : app.status === "denied" ? "bg-red-500/10 text-red-400"
                      : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {app.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
