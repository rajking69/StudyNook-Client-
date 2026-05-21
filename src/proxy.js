import { NextResponse } from "next/server";

const PRIVATE_PREFIXES = [
  "/add-room",
  "/my-bookings",
  "/my-listings",
  "/dashboard",
];

const apiBase = process.env.API_INTERNAL_URL || "http://localhost:5000";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isPrivate) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const cookieHeader = request.headers.get("cookie") || `token=${token}`;
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  } catch {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/add-room",
    "/my-bookings",
    "/my-listings",
    "/dashboard",
  ],
};
