/**
 * Money helpers. All money in DB is integer CENTS. Display format "KSh 3,500".
 */
export function formatKes(cents: number): string {
  const shillings = Math.round(cents / 100);
  return `KSh ${shillings.toLocaleString("en-KE")}`;
}

export function discountPercent(priceCents: number, compareAtCents: number | null | undefined): number | null {
  if (!compareAtCents || compareAtCents <= priceCents) return null;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

export type Totals = {
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  vatCents: number;
  totalCents: number;
};

/**
 * Compute order totals. Prices are treated as VAT-inclusive by default
 * (config.pricesIncludeVat), so VAT is extracted, not added.
 */
export function computeTotals(args: {
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents?: number;
  vatPercent: number;
  pricesIncludeVat: boolean;
}): Totals {
  const discountCents = Math.max(0, args.discountCents ?? 0);
  const netSubtotal = Math.max(0, args.subtotalCents - discountCents);
  const deliveryFeeCents = Math.max(0, args.deliveryFeeCents);

  let vatCents = 0;
  let totalCents = 0;

  if (args.pricesIncludeVat) {
    // VAT portion of (netSubtotal + delivery)
    const gross = netSubtotal + deliveryFeeCents;
    vatCents = Math.round((gross * args.vatPercent) / (100 + args.vatPercent));
    totalCents = gross;
  } else {
    vatCents = Math.round(((netSubtotal + deliveryFeeCents) * args.vatPercent) / 100);
    totalCents = netSubtotal + deliveryFeeCents + vatCents;
  }

  return {
    subtotalCents: args.subtotalCents,
    deliveryFeeCents,
    discountCents,
    vatCents,
    totalCents
  };
}