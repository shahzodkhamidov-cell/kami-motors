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
    available: "bg-[var(--gold)]/10 text-[var(--gold)]",
    sold: "bg-red-500/10 text-red-500",
    pending: "bg-yellow-500/10 text-yellow-500",
    coming_soon: "bg-blue-500/10 text-blue-500",
  };
  const statusLabel: Record<string, string> = {
    available: "Available", sold: "Sold", pending: "Pending", coming_soon: "Coming Soon",
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl leading-none text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
          >
            Dashboard
          </h1>
          <p className="text-[var(--text-dim)] text-sm">Welcome back, {session.user?.name}</p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-4 py-2.5 text-sm tracking-widest uppercase transition-colors"
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
            color: "text-[var(--gold)]",
            bg: "bg-(--gold)/10",
            href: "/admin/inventory",
          },
          {
            label: "Total Sold",
            value: soldCars,
            sub: `${soldThisMonth} this month${salesTrend !== 0 ? ` (${salesTrend > 0 ? "+" : ""}${salesTrend}%)` : ""}`,
            icon: TrendingUp,
            color: "text-[var(--gold)]",
            bg: "bg-(--gold)/10",
            href: "/admin/inventory",
          },
          {
            label: "Applications",
            value: totalApplications,
            sub: `${pendingApplications} pending`,
            icon: FileText,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            href: "/admin/applications",
          },
          {
            label: "Pending / In Progress",
            value: pendingCars,
            sub: `${totalCars} total inventory`,
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            href: "/admin/inventory",
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 hover:border-[var(--text-muted)] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[var(--text-dim)] text-xs tracking-wide uppercase">{label}</p>
              <div className={`w-8 h-8 ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p
              className="text-3xl leading-none text-[var(--text-primary)] mb-1"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              {value}
            </p>
            <p className="text-[var(--text-dim)] text-xs">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Revenue & Savings stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: DollarSign,
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            sub: `from ${soldCars} sold vehicles`,
            color: "text-[var(--gold)]",
            bg: "bg-(--gold)/10",
          },
          {
            icon: Tag,
            label: "Customer Savings Generated",
            value: formatCurrency(totalSavingsGenerated),
            sub: "total savings vs clean title",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            icon: BarChart3,
            label: "Avg. Savings Per Car",
            value: `${avgSavingsPct}%`,
            sub: "avg discount vs clean title market",
            color: "text-[var(--gold)]",
            bg: "bg-(--gold)/10",
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-[var(--text-muted)] text-sm">{label}</p>
            </div>
            <p
              className="text-2xl leading-none text-[var(--text-primary)] mb-1"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              {value}
            </p>
            <p className="text-[var(--text-dim)] text-xs">{sub}</p>
          </div>
        ))}
      </div>

      {/* This month snapshot */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 mb-6">
        <h2
          className="text-[var(--text-primary)] text-xl leading-none mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          <BarChart3 className="w-4 h-4 text-[var(--gold)]" />
          This Month Snapshot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Cars Sold", value: soldThisMonth, color: "text-[var(--gold)]" },
            { label: "Cars Last Month", value: soldLastMonth, color: "text-[var(--text-muted)]" },
            { label: "New Applications", value: newAppsThisMonth, color: "text-yellow-500" },
            {
              label: "Sales Trend",
              value: salesTrend > 0 ? `+${salesTrend}%` : salesTrend < 0 ? `${salesTrend}%` : "—",
              color: salesTrend > 0 ? "text-[var(--gold)]" : salesTrend < 0 ? "text-red-500" : "text-[var(--text-dim)]",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p
                className={`text-2xl leading-none ${color}`}
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                {value}
              </p>
              <p className="text-[var(--text-dim)] text-xs mt-1 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory breakdown */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 mb-6">
        <h2
          className="text-[var(--text-primary)] text-xl leading-none mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
        >
          <Car className="w-4 h-4 text-[var(--gold)]" />
          Inventory Breakdown
        </h2>
        <div className="space-y-3">
          {[
            { label: "Available", count: availableCars, total: totalCars, color: "bg-[var(--gold)]" },
            { label: "Coming Soon", count: comingSoonCars, total: totalCars, color: "bg-blue-500" },
            { label: "Pending", count: pendingCars, total: totalCars, color: "bg-yellow-500" },
            { label: "Sold", count: soldCars, total: totalCars, color: "bg-[var(--text-dim)]" },
          ].map(({ label, count, total, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="text-[var(--text-primary)] font-medium">{count}</span>
              </div>
              <div className="w-full bg-[var(--border)] h-1.5">
                <div
                  className={`${color} h-1.5 transition-all`}
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cars */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[var(--text-primary)] text-xl leading-none"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
            >
              Recent Inventory
            </h2>
            <Link href="/admin/inventory" className="text-[var(--gold)] text-xs hover:text-[var(--gold-light)] transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentCars.length === 0 ? (
              <p className="text-[var(--text-dim)] text-sm text-center py-4">No cars yet</p>
            ) : (
              recentCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/admin/inventory/${car.id}/edit`}
                  className="flex items-center justify-between p-3 bg-[var(--bg-card-2)] hover:border-[var(--gold)]/30 border border-transparent hover:bg-[var(--bg-card-2)] transition-colors group"
                >
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[var(--gold)] transition-colors">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="text-[var(--text-dim)] text-xs">{formatCurrency(car.price)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 ${statusColor[car.status] || "bg-[var(--border)] text-[var(--text-muted)]"}`}>
                    {statusLabel[car.status] || car.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[var(--text-primary)] text-xl leading-none flex items-center gap-2"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
            >
              Recent Applications
              {pendingApplications > 0 && (
                <span className="bg-yellow-500/20 text-yellow-500 text-xs px-1.5 py-0.5 font-sans font-medium">
                  {pendingApplications} new
                </span>
              )}
            </h2>
            <Link href="/admin/applications" className="text-[var(--gold)] text-xs hover:text-[var(--gold-light)] transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentApplications.length === 0 ? (
              <p className="text-[var(--text-dim)] text-sm text-center py-4">No applications yet</p>
            ) : (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between p-3 bg-[var(--bg-card-2)] border border-transparent hover:border-(--gold)/30 transition-colors group"
                >
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-medium group-hover:text-[var(--gold)] transition-colors">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-[var(--text-dim)] text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {app.car?.year} {app.car?.make} {app.car?.model}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 ${
                      app.status === "pending" ? "bg-yellow-500/10 text-yellow-500"
                      : app.status === "approved" ? "bg-(--gold)/10 text-[var(--gold)]"
                      : app.status === "denied" ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
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
