import { prisma } from "@/lib/db";
import { initiateStkPush, isMpesaConfigured } from "@/lib/mpesa";
import { commitReservedStock, releaseReservedStock } from "@/server/services/stock.service";
import { notifyOrderPlaced } from "@/server/services/notification.service";

export async function initiatePayment(args: { orderId: string; phoneE164: string }) {
  const order = await prisma.order.findUnique({ where: { id: args.orderId }, include: { items: true } });
  if (!order) throw new Error("Order not found");

  const result = await initiateStkPush({
    phoneE164: args.phoneE164,
    amountCents: order.totalCents,
    accountReference: order.orderNumber,
    description: "J&R Ecommerce order"
  });

  if (!result.ok) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "MPESA",
        status: "FAILED",
        amountCents: order.totalCents,
        currency: order.currency,
        failureReason: result.error
      }
    });
    return { ok: false as const, error: result.error };
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method: "MPESA",
      status: "PENDING",
      amountCents: order.totalCents,
      currency: order.currency,
      providerRef: result.checkoutRequestId,
      providerPayloadJson: { mode: result.mode, merchantRequestId: result.merchantRequestId }
    }
  });

  return {
    ok: true as const,
    paymentId: payment.id,
    mode: result.mode,
    checkoutRequestId: result.checkoutRequestId,
    customerMessage: result.customerMessage
  };
}

/**
 * Handle a successful payment. Idempotent: if the payment is already
 * SUCCEEDED, do nothing.
 */
export async function markPaymentSucceeded(args: {
  providerRef: string;
  receiptNumber: string;
  payload: unknown;
}) {
  const payment = await prisma.payment.findFirst({ where: { providerRef: args.providerRef } });
  if (!payment) return { ok: false as const, error: "Payment not found" };
  if (payment.status === "SUCCEEDED") return { ok: true as const, alreadyProcessed: true };

  const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
  if (!order) return { ok: false as const, error: "Order not found" };

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCEEDED",
        providerReceipt: args.receiptNumber,
        providerPayloadJson: args.payload as object
      }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "PAID",
        note: `M-Pesa receipt ${args.receiptNumber}`
      }
    })
  ]);

  await commitReservedStock(order.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })));

  // Clear cart
  const userId = order.userId;
  if (userId) {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // Notify customer (fire-and-forget â€" doesn't block response)
  notifyOrderPlaced({
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerName: order.customerName,
    totalCents: order.totalCents
  }).catch((e) => console.error("Notification failed:", e));

  return { ok: true as const, orderNumber: order.orderNumber };
}

export async function markPaymentFailed(args: { providerRef: string; reason: string }) {
  const payment = await prisma.payment.findFirst({ where: { providerRef: args.providerRef } });
  if (!payment || payment.status === "FAILED") return;
  const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
  if (!order) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: args.reason }
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" }
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "FAILED",
        note: args.reason
      }
    })
  ]);

  await releaseReservedStock(order.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })));
}

export { isMpesaConfigured };