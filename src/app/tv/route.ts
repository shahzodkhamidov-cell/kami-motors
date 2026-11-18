import { NextResponse } from "next/server";

// The QR code on the in-store TV ad points here (kamimotorsgroup.com/tv). It sends the visitor to the homepage, tagged
// so these visits can be told apart from the rest of the site's traffic.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL("/", request.url);
  url.searchParams.set("utm_source", "tv");
  url.searchParams.set("utm_medium", "qr");
  url.searchParams.set("utm_campaign", "in_store_tv");
  return NextResponse.redirect(url, 302);
}
