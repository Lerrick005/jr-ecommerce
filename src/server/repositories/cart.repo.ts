import { prisma } from "@/lib/db";

const cartInclude = {
  items: {
    orderBy: { addedAt: "asc" as const },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          basePriceCents: true,
          category: { select: { slug: true } }
        }
      },
      variant: {
        select: { id: true, sku: true, size: true, colour: true, stock: true, priceCents: true }
      }
    }
  }
};

export async function getCartByUser(userId: string) {
  return prisma.cart.findFirst({ where: { userId }, include: cartInclude });
}

export async function getCartByGuestToken(token: string) {
  return prisma.cart.findUnique({ where: { guestToken: token }, include: cartInclude });
}

export async function getOrCreateCartByUser(userId: string) {
  const existing = await getCartByUser(userId);
  if (existing) return existing;
  return prisma.cart.create({ data: { userId }, include: cartInclude });
}

export async function getOrCreateCartByGuest(token: string) {
  const existing = await getCartByGuestToken(token);
  if (existing) return existing;
  return prisma.cart.create({ data: { guestToken: token }, include: cartInclude });
}

export async function mergeGuestCartIntoUser(guestToken: string, userId: string) {
  const guestCart = await getCartByGuestToken(guestToken);
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => undefined);
    return;
  }
  const userCart = await getOrCreateCartByUser(userId);

  await prisma.$transaction(async (tx) => {
    for (const item of guestCart.items) {
      const existing = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } }
      });
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity }
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }
        });
      }
    }
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}