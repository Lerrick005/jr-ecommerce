"use client";

import { useEffect, useState } from "react";

export function WishlistHeartButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/wishlist")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        setSaved(json.data.some((i: { productId: string }) => i.productId === productId));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [productId]);

  async function toggle() {
    setBusy(true);
    if (saved) {
      await fetch("/api/v1/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      setSaved(false);
    } else {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (res.ok) setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className="inline-flex items-center gap-1 border border-line px-3 py-2 text-xs hover:border-espresso disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "#9B2C2C" : "none"} stroke={saved ? "#9B2C2C" : "currentColor"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}