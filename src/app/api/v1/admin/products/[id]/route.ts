import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePriceCents: z.number().int().positive(),
  imageUrl: z.string().url().optional().or(z.literal(""))
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: { message: "Bad JSON" } }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { message: "Validation failed" } }, { status: 422 });

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      basePriceCents: parsed.data.basePriceCents
    }
  });

  if (parsed.data.imageUrl) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.create({
      data: { productId: id, url: parsed.data.imageUrl, position: 0, altText: parsed.data.name }
    });
  }

  // Bust the cache
  revalidateTag("products");

  return NextResponse.json({ data: { ok: true } });
}