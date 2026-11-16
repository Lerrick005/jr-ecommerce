import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { shopConfig } from "@config";
import { computeTotals, type Totals } from "@/lib/money";
import { getOrCreateCartByUser, getCartByGuestToken } from "@/server/repositories/cart.repo";
import { readCartToken } from "@/lib/cart-token";
import { listDeliveryZones } from "@/server/repositories/delivery.repo";
import { createOrderWithItems, nextOrderNumber, getOrderByIdempotencyKey } from "@/server/repositories/order.repo";
import { reserveStock } from "@/server/services/stock.service";
import type { CheckoutInput } from "@/validators/checkout.schema";

export type CheckoutPreview = {
  lines: Array<{
    variantId: string;
    productId: string;
    name: string;
    size: string | null;
    colour: string | null;
    image: string | null;
    priceCents: number;
    quantity: number;
    lineTotalCents: number;
    stock: number;
  }>;
  zones: Awaited<ReturnType<typeof listDeliveryZones>>;
  totals: Totals;
};

export class CheckoutError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Load the viewer's cart, compute preview totals using the lowest-cost zone.
 * Used by the checkout UI to show a preview.
 */
export async function getCheckoutPreview(): Promise<CheckoutPreview> {
  const session = await auth();
  const cart = session?.user?.id
    ? await getOrCreateCartByUser(session.user.id)
    : await (async () => {
        const token = await readCartToken();
        if (!token) return null;
        return getCartByGuestToken(token);
      })();

  if (!cart || cart.items.length === 0) {
    throw new CheckoutError("EMPTY_CART", "Your bag is empty", 400);
  }

  const zones = await listDeliveryZones();
  const subtotalCents = cart.items.reduce(
    (s, it) => s + (it.variant.priceCents ?? it.product.basePriceCents) * it.quantity,
    0
  );
  const cheapestZone = zones[0];
  const deliveryFeeCents =
    cheapestZone && (cheapestZone.freeAboveCents === null || subtotalCents < cheapestZone.freeAboveCents)
      ? cheapestZone.baseFeeCents
      : 0;

  const totals = computeTotals({
    subtotalCents,
    deliveryFeeCents,
    vatPercent: shopConfig.currency.vatPercent,
    pricesIncludeVat: shopConfig.currency.pricesIncludeVat
  });

  return {
    lines: cart.items.map((it) => ({
      variantId: it.variantId,
      productId: it.productId,
      name: it.product.name,
      size: it.variant.size,
      colour: it.variant.colour,
      image: null,
      priceCents: it.variant.priceCents ?? it.product.basePriceCents,
      quantity: it.quantity,
      lineTotalCents: (it.variant.priceCents ?? it.product.basePriceCents) * it.quantity,
      stock: it.variant.stock
    })),
    zones,
    totals
  };
}

/**
 * Create an order in PENDING_PAYMENT state, reserve stock, and return it.
 * Idempotent on idempotencyKey.
 */
export async function createOrderFromCart(input: CheckoutInput) {
  const existing = await getOrderByIdempotencyKey(input.idempotencyKey);
  if (existing) return existing;

  const session = await auth();
  const cart = session?.user?.id
    ? await getOrCreateCartByUser(session.user.id)
    : await (async () => {
        const token = await readCartToken();
        if (!token) return null;
        return getCartByGuestToken(token);
      })();

  if (!cart || cart.items.length === 0) {
    throw new CheckoutError("EMPTY_CART", "Your bag is empty", 400);
  }

  const zones = await listDeliveryZones();
  const zone = zones.find((z) => z.id === input.deliveryZoneId);
  if (!zone) throw new CheckoutError("INVALID_ZONE", "Delivery zone not found", 422);

  const subtotalCents = cart.items.reduce(
    (s, it) => s + (it.variant.priceCents ?? it.product.basePriceCents) * it.quantity,
    0
  );
  const deliveryFeeCents =
    zone.freeAboveCents === null || subtotalCents < zone.freeAboveCents ? zone.baseFeeCents : 0;

  const totals = computeTotals({
    subtotalCents,
    deliveryFeeCents,
    vatPercent: shopConfig.currency.vatPercent,
    pricesIncludeVat: shopConfig.currency.pricesIncludeVat
  });

  // Reserve stock first â€" atomically
  const reserve = await reserveStock(
    cart.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity }))
  );
  if (!reserve.ok) {
    throw new CheckoutError("OUT_OF_STOCK", "One or more items are no longer available", 409);
  }

  try {
    const orderNumber = nextOrderNumber();
    const order = await createOrderWithItems({
      orderNumber,
      userId: session?.user?.id ?? null,
      customerEmail: input.email,
      customerName: input.address.fullName,
      customerPhone: input.address.phone,
      addressSnapshotJson: {
        fullName: input.address.fullName,
        phone: input.address.phone,
        county: input.address.county,
        town: input.address.town,
        area: input.address.area ?? null,
        landmark: input.address.landmark ?? null,
        deliveryNotes: input.address.deliveryNotes ?? null
      },
      status: "PENDING_PAYMENT",
      subtotalCents: totals.subtotalCents,
      deliveryFeeCents: totals.deliveryFeeCents,
      discountCents: totals.discountCents,
      vatCents: totals.vatCents,
      totalCents: totals.totalCents,
      couponCode: null,
      giftNote: input.giftNote ?? null,
      giftWrap: input.giftWrap ?? false,
      paymentMethod: "MPESA",
      idempotencyKey: input.idempotencyKey,
      items: cart.items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        nameSnapshot: it.product.name,
        sizeSnapshot: it.variant.size,
        colourSnapshot: it.variant.colour,
        imageSnapshot: null,
        priceCents: it.variant.priceCents ?? it.product.basePriceCents,
        quantity: it.quantity
      })),
      initialHistoryNote: "Order created, awaiting payment"
    });

    return order;
  } catch (e) {
    // If order creation failed AFTER reservation, release it
    await prisma.$transaction(async (tx) => {
      for (const it of cart.items) {
        await tx.productVariant.update({
          where: { id: it.variantId },
          data: { reserved: { decrement: it.quantity } }
        });
      }
    });
    throw e;
  }
}