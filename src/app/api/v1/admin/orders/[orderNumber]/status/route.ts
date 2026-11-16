import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyOrderShipped, notifyOrderDelivered } from "@/server/services/notification.service";

const schema = z.object({
  status: z.enum(["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED", "RETURN_REQUESTED", "RETURNED", "EXCHANGED"]),
  note: z.string().max(500).optional()
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED", "FAILED"],
  PAID: ["IN_PREPARATION", "CANCELLED"],
  IN_PREPARATION: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED", "RETURNED"],
  CANCELLED: [],
  FAILED: [],
  RETURN_REQUESTED: ["RETURNED", "EXCHANGED"],
  RETURNED: [],
  EXCHANGED: []
};

export async function POST(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Sign in" } }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ data: null, error: { code: "FORBIDDEN", message: "Manager only" } }, { status: 403 });
  }

  const { orderNumber } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ data: null, error: { code: "BAD_JSON", message: "Invalid JSON" } }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ data: null, error: { code: "VALIDATION_FAILED", message: "Invalid request", details: parsed.error.flatten() } }, { status: 422 });

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) return NextResponse.json({ data: null, error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 });

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return NextResponse.json({ data: null, error: { code: "INVALID_TRANSITION", message: `Cannot go from ${order.status} to ${parsed.data.status}` } }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: parsed.data.status as any } }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: parsed.data.status as any,
        changedById: session.user.id,
        note: parsed.data.note || null
      }
    })
  ]);

  // Fire notification
  const payload = {
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerName: order.customerName
  };
  if (parsed.data.status === "SHIPPED") {
    notifyOrderShipped(payload).catch((e) => console.error("Notification failed:", e));
  } else if (parsed.data.status === "DELIVERED") {
    notifyOrderDelivered(payload).catch((e) => console.error("Notification failed:", e));
  }

  return NextResponse.json({ data: { ok: true }, error: null });
}