import { NextResponse } from "next/server";
import crypto from "node:crypto";
import argon2 from "argon2";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/validators/auth.schema";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { code: "BAD_JSON", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "VALIDATION_FAILED", message: "Check the form fields", details: parsed.error.flatten() }
      },
      { status: 422 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { data: null, error: { code: "INVALID_TOKEN", message: "This reset link is invalid or expired" } },
      { status: 400 }
    );
  }

  const passwordHash = await argon2.hash(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: record.userId } })
  ]);

  return NextResponse.json({ data: { ok: true }, error: null });
}