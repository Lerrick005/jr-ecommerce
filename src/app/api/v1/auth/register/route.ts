import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/validators/auth.schema";

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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "VALIDATION_FAILED",
          message: "Check the form fields",
          details: parsed.error.flatten()
        }
      },
      { status: 422 }
    );
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { data: null, error: { code: "EMAIL_TAKEN", message: "That email is already registered" } },
      { status: 409 }
    );
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
      customer: { create: {} }
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });

  return NextResponse.json({ data: user, error: null, meta: { version: "1" } }, { status: 201 });
}