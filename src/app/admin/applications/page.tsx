import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  approved: "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20",
  denied: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const applications = await prisma.financingApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: { year: true, make: true, model: true, price: true },
      },
    },
  });

  const pending = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1
          className="text-4xl leading-none text-[var(--text-primary)] flex items-center gap-3"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
        >
          Financing Applications
          {pending > 0 && (
            <span className="bg-yellow-500/20 text-yellow-500 text-sm font-sans px-2 py-1">
              {pending} new
            </span>
          )}
        </h1>
        <p className="text-[var(--text-dim)] text-sm">{applications.length} total applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)]">
          <div className="text-4xl mb-3">📋</div>
          <h3
            className="text-[var(--text-primary)] text-2xl leading-none mb-2"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            No Applications Yet
          </h3>
          <p className="text-[var(--text-dim)] text-sm">Financing applications will appear here once customers apply.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Applicant</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Vehicle</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Income / Down</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Credit</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Status</th>
                  <th className="text-left text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3">Date</th>
                  <th className="text-right text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-card-2)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-primary)] text-sm font-medium">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-[var(--text-dim)] text-xs">{app.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-muted)] text-sm">
                        {app.car?.year} {app.car?.make} {app.car?.model}
                      </p>
                      {app.car && (
                        <p className="text-[var(--text-dim)] text-xs">{formatCurrency(app.car.price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-muted)] text-sm">{formatCurrency(app.monthlyIncome)}/mo</p>
                      <p className="text-[var(--text-dim)] text-xs">↓ {formatCurrency(app.downPayment)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--text-muted)] text-sm capitalize">{app.creditScoreRange}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 border ${statusColor[app.status] || "bg-[var(--border)] text-[var(--text-muted)]"}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[var(--text-dim)] text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="flex items-center gap-1 text-[var(--gold)] hover:text-[var(--gold-light)] text-xs font-medium transition-colors ml-auto w-fit"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
