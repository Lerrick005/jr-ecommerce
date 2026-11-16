import { prisma } from "@/lib/db";

/**
 * Reserve stock for a set of items. Uses UPDATE ... WHERE stock >= qty
 * so two buyers cannot reserve the last unit simultaneously.
 * Returns { ok: true } or { ok: false, failedVariantId }.
 */
export async function reserveStock(
  items: Array<{ variantId: string; quantity: number }>
): Promise<{ ok: true } | { ok: false; failedVariantId: string }> {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Lock the row and read current stock inside the tx
      const rows = await tx.$queryRaw<Array<{ id: string; stock: number; reserved: number }>>`
        SELECT id, stock, reserved FROM "ProductVariant" WHERE id = ${item.variantId} FOR UPDATE
      `;
      const row = rows[0];
      if (!row) return { ok: false as const, failedVariantId: item.variantId };
      const available = row.stock - row.reserved;
      if (available < item.quantity) {
        return { ok: false as const, failedVariantId: item.variantId };
      }
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reserved: { increment: item.quantity } }
      });
    }
    return { ok: true as const };
  });
}

/** Called from M-Pesa success callback: convert reserved -> decrement stock. */
export async function commitReservedStock(
  items: Array<{ variantId: string; quantity: number }>
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
          reserved: { decrement: item.quantity }
        }
      });
    }
  });
}

/** Release reserved stock back to available (on failure/timeout). */
export async function releaseReservedStock(
  items: Array<{ variantId: string; quantity: number }>
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reserved: { decrement: item.quantity } }
      });
    }
  });
}