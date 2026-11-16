import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listWishlist, addToWishlist, removeFromWishlist } from "@/server/repositories/wishlist.repo";

const bodySchema = z.object({ productId: z.string().min(1) });

function err(code: string, message: string, status = 400) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return err("UNAUTHORIZED", "Sign in to view your wishlist", 401);
  const items = await listWishlist(session.user.id);
  return NextResponse.json({ data: items, error: null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return err("UNAUTHORIZED", "Sign in to save items", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_FAILED", "Invalid request", 422);

  await addToWishlist(session.user.id, parsed.data.productId);
  return NextResponse.json({ data: { ok: true }, error: null });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return err("UNAUTHORIZED", "Sign in to manage wishlist", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_FAILED", "Invalid request", 422);

  await removeFromWishlist(session.user.id, parsed.data.productId);
  return NextResponse.json({ data: { ok: true }, error: null });
}