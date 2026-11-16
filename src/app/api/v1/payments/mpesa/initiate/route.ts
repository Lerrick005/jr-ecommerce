import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { initiatePayment } from "@/server/services/payment.service";
import { normaliseKenyanPhone } from "@/lib/phone";

const schema = z.object({
  orderNumber: z.string().min(1),
  phone: z.string().transform((v) => normaliseKenyanPhone(v)).refine((v): v is string => !!v)
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ data: null, error: { code: "BAD_JSON", message: "Invalid JSON" } }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: { code: "VALIDATION_FAILED", message: "Invalid request", details: parsed.error.flatten() } }, { status: 422 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } });
  if (!order) {
    return NextResponse.json({ data: null, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } }, { status: 404 });
  }
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ data: null, error: { code: "INVALID_STATUS", message: `Order is ${order.status}` } }, { status: 409 });
  }

  const result = await initiatePayment({ orderId: order.id, phoneE164: parsed.data.phone });
  if (!result.ok) {
    return NextResponse.json({ data: null, error: { code: "STK_FAILED", message: result.error } }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      mode: result.mode,
      checkoutRequestId: result.checkoutRequestId,
      customerMessage: result.customerMessage
    },
    error: null
  });
}