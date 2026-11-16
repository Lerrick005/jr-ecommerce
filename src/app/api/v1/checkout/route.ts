import { NextResponse } from "next/server";
import { checkoutSchema } from "@/validators/checkout.schema";
import { createOrderFromCart, getCheckoutPreview, CheckoutError } from "@/server/services/checkout.service";

function err(code: string, message: string, status = 400) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export async function GET() {
  try {
    const preview = await getCheckoutPreview();
    return NextResponse.json({ data: preview, error: null });
  } catch (e) {
    if (e instanceof CheckoutError) return err(e.code, e.message, e.status);
    return err("PREVIEW_FAILED", "Could not load checkout", 500);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return err("BAD_JSON", "Invalid JSON"); }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_FAILED", message: "Check the form", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const order = await createOrderFromCart(parsed.data);
    return NextResponse.json({
      data: {
        orderNumber: order.orderNumber,
        orderId: order.id,
        totalCents: order.totalCents
      },
      error: null
    });
  } catch (e) {
    if (e instanceof CheckoutError) return err(e.code, e.message, e.status);
    return err("ORDER_FAILED", "Could not create order", 500);
  }
}