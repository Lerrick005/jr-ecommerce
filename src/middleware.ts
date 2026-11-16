import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.AUTH_SECRET!;
const CART_COOKIE = "cart_token";
const CART_MAX_AGE = 60 * 60 * 24 * 30;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/api/v1/admin") ||
    pathname.startsWith("/api/v1/account");

  if (needsAuth) {
    const token = await getToken({
      req,
      secret: AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    if (!token) {
      if (isApi) {
        return NextResponse.json(
          { data: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  const needsCart =
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/favicon");
  if (needsCart && !req.cookies.has(CART_COOKIE)) {
    const token =
      crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    res.cookies.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CART_MAX_AGE
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};