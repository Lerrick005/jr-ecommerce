import { prisma } from "@/lib/db";

export async function listDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { baseFeeCents: "asc" },
    select: {
      id: true,
      name: true,
      counties: true,
      baseFeeCents: true,
      freeAboveCents: true,
      estimatedDaysMin: true,
      estimatedDaysMax: true
    }
  });
}

export async function resolveZoneForCounty(county: string) {
  const zones = await prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { baseFeeCents: "asc" }
  });
  const exact = zones.find((z) => z.counties.some((c) => c.toLowerCase() === county.toLowerCase()));
  if (exact) return exact;
  const fallback = zones.find((z) => z.counties.includes("*"));
  return fallback ?? null;
}

export function calculateDeliveryFee(args: {
  zoneBaseFeeCents: number;
  zoneFreeAboveCents: number | null;
  subtotalCents: number;
}): number {
  if (args.zoneFreeAboveCents !== null && args.subtotalCents >= args.zoneFreeAboveCents) return 0;
  return args.zoneBaseFeeCents;
}