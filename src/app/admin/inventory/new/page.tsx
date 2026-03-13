import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CarForm from "../CarForm";

export default async function NewCarPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1
          className="text-4xl leading-none text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.03em" }}
        >
          Add New Vehicle
        </h1>
        <p className="text-[var(--text-dim)] text-sm">Enter the VIN to auto-fill details, then set pricing.</p>
      </div>
      <CarForm mode="create" />
    </div>
  );
}
