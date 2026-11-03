import { prisma } from "@/lib/db";
import { HOME_HTML } from "./home-html";

// The homepage (homepage/home.html, built into home-html.ts by homepage/build.mjs). The current listings are put
// into the page, in the same format as /api/cars, so cars show straight away; the page re-reads /api/cars itself
// every few minutes.
export const dynamic = "force-dynamic";

export async function GET() {
  let rows: unknown[] = [];
  try {
    const cars = await prisma.car.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    rows = cars.map((car) => ({
      ...car,
      features: JSON.parse(car.features),
      images: JSON.parse(car.images),
    }));
  } catch (err) {
    // the page still loads; it fetches /api/cars on its own
    console.error("Homepage: failed to load cars:", err);
  }

  const data = JSON.stringify({ rows, localPhotos: {} }).replace(/</g, "\\u003c");
  const html = HOME_HTML.replace("/*KM_INVENTORY*/", `window.KM_LIVE = true; window.KM_INVENTORY = ${data};`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
