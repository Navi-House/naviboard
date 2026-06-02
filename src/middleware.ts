import { NextRequest, NextResponse } from "next/server";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(`${basePath}${path}`, request.url));
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow API routes, static assets, and public files (images, icons)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/downloads") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return NextResponse.next();

  // Check for token in query param (auto-login via link)
  const tokenParam = searchParams.get("token");
  if (tokenParam === secret) {
    const response = redirectTo(request, "/chat");
    response.cookies.set("navi_auth", secret, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  // Check cookie
  const cookie = request.cookies.get("navi_auth");
  const isAuthed = cookie?.value === secret;

  // Authenticated: redirect root to /chat, allow everything else
  if (isAuthed) {
    if (pathname === "/") {
      return redirectTo(request, "/chat");
    }
    return NextResponse.next();
  }

  // Not authenticated: allow login page, redirect everything else
  if (pathname === "/login") {
    return NextResponse.next();
  }

  return redirectTo(request, "/login");
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
