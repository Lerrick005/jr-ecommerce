import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ email: z.string().email().toLowerCase() });

async function parseBody(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") ?? "";
  
  if (contentType.includes("application/json")) {
    try { return await req.json(); } catch { return null; }
  }
  
  if (contentType.includes("form-urlencoded") || contentType.includes("multipart")) {
    try {
      const formData = await req.formData();
      const email = formData.get("email");
      return { email: typeof email === "string" ? email : null };
    } catch { return null; }
  }
  
  return null;
}

export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json({ error: { code: "BAD_JSON", message: "Invalid request" } }, { status: 400 });
  }
  
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Invalid email" } }, { status: 422 });
  }

  try {
    await prisma.setting.upsert({
      where: { key: `newsletter_sub_${parsed.data.email}` },
      create: { key: `newsletter_sub_${parsed.data.email}`, valueJson: { email: parsed.data.email, subscribedAt: new Date().toISOString() } },
      update: {}
    });
  } catch {
    // swallow duplicates gracefully
  }

  return NextResponse.json({ data: { ok: true } });
}