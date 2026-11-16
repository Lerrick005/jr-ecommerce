"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatKes } from "@/lib/money";
import type { CartLine } from "@/server/services/cart.service";

export function CartLineRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateQty(q: number) {
    if (q < 1 || q > line.stock) return;
    setBusy(true);
    await fetch("/api/v1/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: line.id, quantity: q })
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch("/api/v1/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: line.id })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="flex gap-3 py-4">
      <div className="relative h-24 w-20 shrink-0 bg-ivory">
        <Image
          src="/images/placeholder.svg"
          alt={line.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/shop/${line.categorySlug}/${line.productSlug}`}
            className="text-sm hover:underline"
          >
            {line.name}
          </Link>
          <p className="mt-1 text-xs text-muted">
            {line.colour ? `${line.colour} Â· ` : ""}{line.size ?? "One size"}
          </p>
          <p className="mt-1 text-sm">{formatKes(line.priceCents)}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => updateQty(line.quantity - 1)}
              disabled={busy || line.quantity <= 1}
              className="px-2 py-1 text-sm disabled:opacity-40"
            >
              âˆ'
            </button>
            <span className="min-w-8 text-center text-xs">{line.quantity}</span>
            <button
              type="button"
              onClick={() => updateQty(line.quantity + 1)}
              disabled={busy || line.quantity >= line.stock}
              className="px-2 py-1 text-sm disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-xs text-muted hover:text-sale"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="w-20 text-right text-sm font-semibold">
        {formatKes(line.lineTotalCents)}
      </div>
    </li>
  );
}