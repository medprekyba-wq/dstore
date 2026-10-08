import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const managerRestrictedPaths = [
  "/admin/user-management",
  "/admin/account-settings",
  "/admin/coupons",
  "/admin/countdown",
  "/admin/hero-banner",
  "/admin/hero-slider",
  "/admin/post-authors",
  "/admin/post-categories",
];

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // secureCookie: true,
    // cookieName:
    //   process.env.NODE_ENV === "production"
    //     ? "__Secure-next-auth.session-token"
    //     : "next-auth.session-token",
  });
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  // If user is on auth pages and is already logged in, redirect to appropriate dashboard
  if (isAuthPage && token) {
    const redirectURL =
      token.role === "ADMIN" || token.role === "MANAGER"
        ? "/admin/dashboard"
        : "/my-account";
    return NextResponse.redirect(new URL(redirectURL, req.url));
  }

  // Only check authentication for admin routes
  if (isAdminRoute) {
    // If no token, redirect to signin
    if (!token?.email) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // Check for admin/manager role
    // if (token.role !== "ADMIN" && token.role !== "MANAGER") {
    //   return NextResponse.redirect(new URL("/unauthorized", req.url));
    // }

    // Check manager restrictions
    // if (
    //   token.role === "MANAGER" &&
    //   managerRestrictedPaths.includes(pathname)
    // ) {
    //   return NextResponse.redirect(new URL("/unauthorized", req.url));
    // }
  }

  return NextResponse.next();
}

// Apply middleware to protect admin routes and handle authentication pages
export const config = {
  matcher: ["/admin/:path*", "/signin", "/signup"],
};
