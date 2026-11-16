"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WishlistRemoveButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch("/api/v1/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label="Remove from wishlist"
      className="absolute right-1 top-1 rounded-full bg-surface/90 p-1 text-muted hover:text-sale disabled:opacity-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}