import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CarForm from "../CarForm";

export default async function NewCarPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Add New Vehicle</h1>
        <p className="text-gray-500 text-sm">Enter the VIN to auto-fill details, then set pricing.</p>
      </div>
      <CarForm mode="create" />
    </div>
  );
}
