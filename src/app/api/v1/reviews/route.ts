import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to leave a review" } }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: { code: "BAD_JSON", message: "Invalid request" } }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_FAILED", message: "Check the form", details: parsed.error.flatten() } }, { status: 422 });
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: session.user.id, status: "DELIVERED" }
    }
  });

  if (!hasPurchased) {
    return NextResponse.json({ error: { code: "NOT_PURCHASED", message: "You can only review products you have received." } }, { status: 403 });
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: session.user.id } },
    update: { rating: parsed.data.rating, title: parsed.data.title, body: parsed.data.body, approved: true },
    create: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      approved: true
    }
  });

  return NextResponse.json({ data: { ok: true, id: review.id } });
}