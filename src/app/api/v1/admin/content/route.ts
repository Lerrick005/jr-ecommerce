import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_KEYS = ["announcementBar", "heroHeadline", "heroSubheadline", "newsletterCopy"];

export async function PATCH(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ data: null, error: { code: "FORBIDDEN", message: "Manager only" } }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ data: null, error: { code: "BAD_JSON", message: "Invalid JSON" } }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ data: null, error: { code: "INVALID", message: "Body must be an object" } }, { status: 422 });
  }

  const updates: Array<{ key: string; value: unknown }> = [];
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(k)) continue;
    updates.push({ key: k, value: v });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        create: { key: u.key, valueJson: u.value as any },
        update: { valueJson: u.value as any }
      })
    )
  );

  return NextResponse.json({ data: { ok: true, updated: updates.length } });
}