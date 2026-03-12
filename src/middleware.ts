import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin/inventory") ||
    request.nextUrl.pathname.startsWith("/admin/applications");

  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/inventory/:path*", "/admin/applications/:path*"],
};
