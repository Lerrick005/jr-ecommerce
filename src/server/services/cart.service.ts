import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { readCartToken, issueCartToken } from "@/lib/cart-token";
import {
  getOrCreateCartByUser,
  getOrCreateCartByGuest,
  mergeGuestCartIntoUser
} from "@/server/repositories/cart.repo";

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  productSlug: string;
  categorySlug: string;
  name: string;
  size: string | null;
  colour: string | null;
  sku: string;
  priceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CartView = {
  lines: CartLine[];
  subtotalCents: number;
  itemCount: number;
};

type CartFromRepo = Awaited<ReturnType<typeof getOrCreateCartByUser>>;

function toLines(cart: CartFromRepo): CartView {
  const lines: CartLine[] = cart.items.map((it) => {
    const unit = it.variant.priceCents ?? it.product.basePriceCents;
    return {
      id: it.id,
      productId: it.productId,
      variantId: it.variantId,
      productSlug: it.product.slug,
      categorySlug: it.product.category.slug,
      name: it.product.name,
      size: it.variant.size,
      colour: it.variant.colour,
      sku: it.variant.sku,
      priceCents: unit,
      quantity: it.quantity,
      stock: it.variant.stock,
      lineTotalCents: unit * it.quantity
    };
  });
  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { lines, subtotalCents, itemCount };
}

/**
 * Read-only. Called from Server Components. If no cart token exists yet,
 * return an empty cart â€" middleware will issue the token on the next request.
 */
export async function loadCartForViewer(): Promise<CartView> {
  const session = await auth();
  if (session?.user?.id) {
    const cart = await getOrCreateCartByUser(session.user.id);
    return toLines(cart);
  }
  const token = await readCartToken();
  if (!token) return { lines: [], subtotalCents: 0, itemCount: 0 };
  const cart = await getOrCreateCartByGuest(token);
  return toLines(cart);
}

/**
 * Called from Route Handlers (POST /api/v1/cart).
 * Safe to issue the cart token here â€" cookies().set() is allowed.
 */
export async function addItemToCart(variantId: string, quantity: number) {
  if (quantity < 1) throw new Error("Invalid quantity");

  const session = await auth();
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { basePriceCents: true, active: true, deletedAt: true, id: true } } }
  });
  if (!variant || !variant.active || variant.deletedAt) throw new Error("Product unavailable");
  if (!variant.product.active || variant.product.deletedAt) throw new Error("Product unavailable");

  const cart = session?.user?.id
    ? await getOrCreateCartByUser(session.user.id)
    : await getOrCreateCartByGuest(await readCartToken() ?? await issueCartToken());

  const existing = cart.items.find((i) => i.variantId === variantId);
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > variant.stock) throw new Error(`Only ${variant.stock} available`);

  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: variant.product.id, variantId, quantity }
    });
  }

  return { variantStock: variant.stock };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: { select: { stock: true } } }
  });
  if (!item) throw new Error("Cart item not found");
  if (quantity < 1) throw new Error("Quantity must be at least 1");
  if (quantity > item.variant.stock) throw new Error(`Only ${item.variant.stock} available`);
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => undefined);
}

export async function mergeGuestCartOnLogin(userId: string) {
  const token = await readCartToken();
  if (!token) return;
  await mergeGuestCartIntoUser(token, userId);
}