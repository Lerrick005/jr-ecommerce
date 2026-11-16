import { prisma } from "@/lib/db";
import type { OrderStatus, Prisma } from "@prisma/client";

export function nextOrderNumber(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14); // yyyyMMddHHmmss
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JR-${stamp}-${rand}`;
}

export async function createOrderWithItems(args: {
  orderNumber: string;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  addressSnapshotJson: Prisma.InputJsonValue;
  status: OrderStatus;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  vatCents: number;
  totalCents: number;
  couponCode?: string | null;
  giftNote?: string | null;
  giftWrap?: boolean;
  paymentMethod: "MPESA";
  idempotencyKey: string;
  items: Array<{
    productId: string;
    variantId: string;
    nameSnapshot: string;
    sizeSnapshot: string | null;
    colourSnapshot: string | null;
    imageSnapshot: string | null;
    priceCents: number;
    quantity: number;
  }>;
  initialHistoryNote?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: args.orderNumber,
        userId: args.userId,
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        customerPhone: args.customerPhone,
        addressSnapshotJson: args.addressSnapshotJson,
        status: args.status,
        subtotalCents: args.subtotalCents,
        deliveryFeeCents: args.deliveryFeeCents,
        discountCents: args.discountCents,
        vatCents: args.vatCents,
        totalCents: args.totalCents,
        couponCode: args.couponCode ?? null,
        giftNote: args.giftNote ?? null,
        giftWrap: args.giftWrap ?? false,
        paymentMethod: args.paymentMethod,
        idempotencyKey: args.idempotencyKey,
        items: {
          create: args.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            nameSnapshot: i.nameSnapshot,
            sizeSnapshot: i.sizeSnapshot,
            colourSnapshot: i.colourSnapshot,
            imageSnapshot: i.imageSnapshot,
            priceCents: i.priceCents,
            quantity: i.quantity,
            lineTotalCents: i.priceCents * i.quantity
          }))
        }
      }
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        toStatus: args.status,
        note: args.initialHistoryNote ?? "Order created"
      }
    });

    return order;
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: "asc" } }
    }
  });
}

export async function getOrderByIdempotencyKey(key: string) {
  return prisma.order.findUnique({ where: { idempotencyKey: key } });
}