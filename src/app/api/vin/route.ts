import { NextRequest, NextResponse } from "next/server";

const BODY_TYPE_MAP: Record<string, string> = {
  "sedan": "Sedan",
  "coupe": "Coupe",
  "convertible": "Convertible",
  "hatchback": "Hatchback",
  "wagon": "Wagon",
  "suv": "SUV",
  "crossover": "Crossover",
  "pickup": "Truck",
  "truck": "Truck",
  "van": "Van",
  "minivan": "Minivan",
};

function mapBodyType(nhtsaBody: string): string {
  const lower = nhtsaBody.toLowerCase();
  for (const [key, value] of Object.entries(BODY_TYPE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "Sedan";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: "Invalid VIN" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) throw new Error("NHTSA API failed");

    const data = await response.json();
    const result = data.Results?.[0];

    if (!result || result.ErrorCode !== "0") {
      return NextResponse.json({ error: "VIN not found" }, { status: 404 });
    }

    const engineParts = [];
    if (result.DisplacementL) engineParts.push(`${parseFloat(result.DisplacementL).toFixed(1)}L`);
    if (result.EngineCylinders) engineParts.push(`${result.EngineCylinders}-Cylinder`);
    if (result.FuelTypePrimary) engineParts.push(result.FuelTypePrimary);

    const vinData = {
      year: result.ModelYear,
      make: result.Make,
      model: result.Model,
      trim: result.Trim || result.Series || "",
      bodyType: mapBodyType(result.BodyClass || ""),
      engine: engineParts.join(" ") || null,
      transmission: result.TransmissionStyle || null,
      drivetrain: result.DriveType || null,
      fuelType: result.FuelTypePrimary || null,
    };

    return NextResponse.json(vinData);
  } catch {
    return NextResponse.json({ error: "Failed to decode VIN" }, { status: 500 });
  }
}
