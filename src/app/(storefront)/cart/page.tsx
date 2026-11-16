import Link from "next/link";
import Image from "next/image";
import { loadCartForViewer } from "@/server/services/cart.service";
import { formatKes } from "@/lib/money";
import { CartLineRow } from "@/components/bag/CartLineRow";

export default async function CartPage() {
  const cart = await loadCartForViewer();

  if (cart.lines.length === 0) {
    return (
      <div className="jr-container py-16 text-center">
        <h1 className="jr-heading-lg">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted">Browse the shop and add something you love.</p>
        <Link href="/shop" className="jr-btn-primary mt-6 inline-flex">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="jr-container py-8">
      <h1 className="jr-heading-lg">Your bag</h1>
      <p className="mt-1 text-sm text-muted">{cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ul className="divide-y divide-line border-y border-line">
            {cart.lines.map((line) => (
              <CartLineRow key={line.id} line={line} />
            ))}
          </ul>
        </div>

        <aside className="border border-line bg-surface p-6">
          <p className="jr-eyebrow">Summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatKes(cart.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatKes(cart.subtotalCents)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="jr-btn-primary mt-6 w-full opacity-60"
            title="Checkout arrives in Phase 6"
          >
            Checkout (coming Phase 6)
          </button>
          <Link href="/shop" className="mt-3 block text-center text-xs jr-link">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}