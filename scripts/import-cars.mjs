import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH = "/Users/roman/Documents/claude projects/test project/Cars-Unsold.csv";

function deriveBodyType(modelStr) {
  const m = modelStr.toLowerCase();
  if (m.includes("convertible") || m.includes("cabriolet")) return "Convertible";
  if (m.includes("coupe")) return "Coupe";
  if (m.includes("van") || m.includes("minivan") || m.includes("transit")) return "Van";
  if (
    m.includes("f150") || m.includes("f-150") || m.includes("f250") || m.includes("f-250") ||
    m.includes("f350") || m.includes("f-350") || m.includes("silverado") || m.includes("sierra") ||
    m.includes("ram ") || m.includes("tacoma") || m.includes("tundra") || m.includes("ranger") ||
    m.includes("colorado") || m.includes("ridgeline") || m.includes("titan") || m.includes("frontier") ||
    m.includes("pickup") || m.includes("truck")
  ) return "Truck";
  if (
    m.includes("forester") || m.includes("4runner") || m.includes("explorer") ||
    m.includes("expedition") || m.includes("highlander") || m.includes("pilot") ||
    m.includes("pathfinder") || m.includes("murano") || m.includes("rogue") ||
    m.includes("cr-v") || m.includes("crv") || m.includes("rav4") || m.includes("escape") ||
    m.includes("equinox") || m.includes("terrain") || m.includes("traverse") ||
    m.includes("suburban") || m.includes("tahoe") || m.includes("yukon") ||
    m.includes("navigator") || m.includes("escalade") || m.includes("outback") ||
    m.includes("crosstrek") || m.includes("xc60") || m.includes("xc90") ||
    m.includes("q5") || m.includes("q7") || m.includes("x3") || m.includes("x5") ||
    m.includes("gle") || m.includes("glc") || m.includes("cx-5") || m.includes("cx-9") ||
    m.includes("tucson") || m.includes("santa fe") || m.includes("sportage") ||
    m.includes("telluride") || m.includes("sorento") || m.includes("suv")
  ) return "SUV";
  if (
    m.includes("hatchback") || m.includes("hatch")
  ) return "Hatchback";
  return "Sedan";
}

function extractModel(modelField) {
  // "2021 - Ford F150" → "F150"
  // "2008 - BMW 128i convertible" → "128i convertible"
  const parts = modelField.split(" - ");
  if (parts.length >= 3) return parts.slice(2).join(" - ").trim();
  if (parts.length === 2) {
    // strip year and make
    const withoutYear = parts[1].replace(/^\d{4}\s*-?\s*/, "").trim();
    const words = withoutYear.split(" ");
    return words.length > 1 ? words.slice(1).join(" ").trim() : withoutYear;
  }
  return modelField.trim();
}

function parsePrice(val) {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[$,]/g, "").trim());
  return isNaN(n) ? 0 : Math.round(n);
}

async function main() {
  const raw = readFileSync(CSV_PATH, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`Parsed ${records.length} records from CSV`);

  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    const vin = (row["VIN"] || "").trim();
    if (!vin) { skipped++; continue; }

    const year = parseInt(row["Year (from Model)"] || "0");
    if (!year) { skipped++; continue; }

    const make = (row["Make (from Model)"] || "").trim();
    if (!make) { skipped++; continue; }

    const modelField = (row["Model"] || "").trim();
    const model = extractModel(modelField) || make;
    const bodyType = deriveBodyType(modelField || model);

    const color = (row["Color"] || "").trim() || null;
    const mileage = parseInt((row["ODO"] || "0").replace(/,/g, "")) || 0;
    const price = parsePrice(row["Price Listed"]);
    const accidentType = (row["Accident Type"] || "").trim();
    const description = accidentType ? `Damage: ${accidentType}` : null;

    try {
      await prisma.car.upsert({
        where: { vin },
        create: {
          vin,
          year,
          make,
          model,
          bodyType,
          color,
          mileage,
          price,
          cleanTitleValue: 0,
          description,
          features: "[]",
          images: "[]",
          status: "available",
        },
        update: {
          year,
          make,
          model,
          bodyType,
          color,
          mileage,
          price,
          description,
        },
      });
      console.log(`✓ ${year} ${make} ${model} — ${vin}`);
      imported++;
    } catch (err) {
      console.error(`✗ ${vin}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
