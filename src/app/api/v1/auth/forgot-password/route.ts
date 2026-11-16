import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/validators/auth.schema";

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_FAILED", message: "Invalid email" } },
      { status: 422 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 â€" never leak whether the email exists.
  if (!user || user.deletedAt || user.disabled) {
    return NextResponse.json({ data: { ok: true }, error: null });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const resetUrl = `${base}/reset-password?token=${rawToken}`;

  // TODO (Phase 7): send via Resend
  console.log(`[dev] Password reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({ data: { ok: true }, error: null });
}