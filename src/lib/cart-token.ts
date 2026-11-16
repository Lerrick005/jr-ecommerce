import { cookies } from "next/headers";

const COOKIE_NAME = "cart_token";
const MAX_AGE = 60 * 60 * 24 * 30;

export async function readCartToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function issueCartToken(): Promise<string> {
  const token =
    crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE
  });
  return token;
}