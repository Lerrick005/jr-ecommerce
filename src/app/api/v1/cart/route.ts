import { NextResponse } from "next/server";
import { z } from "zod";
import { loadCartForViewer, addItemToCart, updateCartItemQuantity, removeCartItem } from "@/server/services/cart.service";

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1)
});

const updateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(10)
});

const removeSchema = z.object({
  itemId: z.string().min(1)
});

function err(code: string, message: string, status = 400) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export async function GET() {
  const cart = await loadCartForViewer();
  return NextResponse.json({ data: cart, error: null });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_FAILED", "Invalid request", 422);

  try {
    await addItemToCart(parsed.data.variantId, parsed.data.quantity);
    const cart = await loadCartForViewer();
    return NextResponse.json({ data: cart, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Add failed";
    return err("ADD_FAILED", message, 400);
  }
}

export async function PATCH(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_FAILED", "Invalid request", 422);

  try {
    await updateCartItemQuantity(parsed.data.itemId, parsed.data.quantity);
    const cart = await loadCartForViewer();
    return NextResponse.json({ data: cart, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return err("UPDATE_FAILED", message, 400);
  }
}

export async function DELETE(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) return err("VALIDATION_FAILED", "Invalid request", 422);

  await removeCartItem(parsed.data.itemId);
  const cart = await loadCartForViewer();
  return NextResponse.json({ data: cart, error: null });
}