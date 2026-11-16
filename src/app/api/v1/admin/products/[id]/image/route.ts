import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";

const schema = z.object({ imageUrl: z.string() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 422 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productImage.create({
    data: { productId: id, url: parsed.data.imageUrl, position: 0, altText: product.name }
  });

  revalidateTag("products");
  return NextResponse.json({ ok: true });
}