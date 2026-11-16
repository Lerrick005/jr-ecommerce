import { prisma } from "@/lib/db";

const wishlistInclude = {
  product: {
    select: {
      id: true,
      slug: true,
      name: true,
      basePriceCents: true,
      compareAtCents: true,
      category: { select: { slug: true, name: true } },
      images: { orderBy: { position: "asc" as const }, take: 2, select: { url: true, altText: true } }
    }
  }
};

export async function listWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: wishlistInclude
  });
}

export async function addToWishlist(userId: string, productId: string) {
  return prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {}
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}