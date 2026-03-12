import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  denied: "bg-red-500/10 text-red-400 border-red-500/20",
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
        <h1 className="text-2xl font-black text-white">
          Financing Applications
          {pending > 0 && (
            <span className="ml-3 bg-yellow-500/20 text-yellow-400 text-sm px-2 py-1 rounded-lg">
              {pending} new
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm">{applications.length} total applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-white font-bold mb-2">No applications yet</h3>
          <p className="text-gray-500 text-sm">Financing applications will appear here once customers apply.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Applicant</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Vehicle</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Income / Down</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Credit</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                  <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Date</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-gray-500 text-xs">{app.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-sm">
                        {app.car?.year} {app.car?.make} {app.car?.model}
                      </p>
                      {app.car && (
                        <p className="text-gray-500 text-xs">{formatCurrency(app.car.price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-sm">{formatCurrency(app.monthlyIncome)}/mo</p>
                      <p className="text-gray-500 text-xs">↓ {formatCurrency(app.downPayment)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm capitalize">{app.creditScoreRange}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${statusColor[app.status] || "bg-gray-700 text-gray-300"}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-medium transition-colors ml-auto w-fit"
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
