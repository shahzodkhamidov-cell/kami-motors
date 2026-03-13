import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import ApplicationStatusUpdater from "./ApplicationStatusUpdater";
import { ChevronLeft } from "lucide-react";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const app = await prisma.financingApplication.findUnique({
    where: { id },
    include: { car: true },
  });

  if (!app) notFound();

  const fields = [
    { label: "Full Name", value: `${app.firstName} ${app.lastName}` },
    { label: "Email", value: app.email },
    { label: "Phone", value: app.phone },
    { label: "Date of Birth", value: app.dateOfBirth || "—" },
    { label: "Address", value: [app.address, app.city, app.state, app.zipCode].filter(Boolean).join(", ") || "—" },
    { label: "Employment", value: app.employmentStatus },
    { label: "Employer", value: app.employer || "—" },
    { label: "Monthly Income", value: formatCurrency(app.monthlyIncome) },
    { label: "Credit Score", value: app.creditScoreRange },
    { label: "Down Payment", value: formatCurrency(app.downPayment) },
    { label: "Loan Term", value: `${app.loanTerm} months` },
    { label: "Applied", value: new Date(app.createdAt).toLocaleString() },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link
        href="/admin/applications"
        className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Applications
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-4xl leading-none text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
          >
            {app.firstName} {app.lastName}
          </h1>
          <p className="text-[var(--text-dim)] text-sm">{app.email}</p>
        </div>
        <ApplicationStatusUpdater applicationId={app.id} currentStatus={app.status} />
      </div>

      {/* Vehicle */}
      {app.car && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 mb-5">
          <h2 className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-3">Vehicle</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-primary)] font-bold">
                {app.car.year} {app.car.make} {app.car.model}
              </p>
              <p className="text-[var(--text-dim)] text-sm">{app.car.vin}</p>
            </div>
            <div className="text-right">
              <p className="text-[var(--gold)] font-bold">{formatCurrency(app.car.price)}</p>
              <Link
                href={`/admin/inventory/${app.car.id}/edit`}
                className="text-[var(--text-dim)] text-xs hover:text-[var(--gold)] transition-colors"
              >
                View listing →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Application Details */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 mb-5">
        <h2 className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-4">Application Details</h2>
        <div className="grid grid-cols-2 gap-y-4">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[var(--text-dim)] text-xs">{label}</p>
              <p className="text-[var(--text-primary)] text-sm font-medium capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {app.additionalNotes && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5">
          <h2 className="text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-3">Notes from Applicant</h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">{app.additionalNotes}</p>
        </div>
      )}
    </div>
  );
}
