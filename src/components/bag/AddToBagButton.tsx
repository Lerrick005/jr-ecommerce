"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Variant = {
  id: string;
  size: string | null;
  colour: string | null;
  stock: number;
  sku: string;
};

export function AddToBagButton({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const colours = Array.from(new Set(variants.map((v) => v.colour).filter((c): c is string => !!c)));
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter((s): s is string => !!s)));

  const [colour, setColour] = useState<string | null>(colours[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [busy, setBusy] = useState(false);

  const selected = variants.find(
    (v) => (colour === null || v.colour === colour) && (size === null || v.size === size)
  );

  const anyStock = variants.some((v) => v.stock > 0);

  async function add() {
    if (!selected) return;
    setBusy(true);
    const res = await fetch("/api/v1/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: selected.id, quantity: 1 })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(json?.error?.message ?? "Could not add to bag");
      return;
    }
    toast.success("Added to bag", {
      description: `${colour ?? "Default"} Â· ${size ?? "One size"}`
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {colours.length > 0 && (
        <div>
          <p className="jr-eyebrow mb-2">Colour</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColour(c)}
                className={
                  "border px-3 py-1 text-xs " +
                  (c === colour ? "border-espresso bg-espresso text-ivory" : "border-line text-espresso")
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="jr-eyebrow mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const v = variants.find(
                (x) => (colour === null || x.colour === colour) && x.size === s
              );
              const available = (v?.stock ?? 0) > 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={!available}
                  className={
                    "border px-3 py-1 text-xs " +
                    (!available
                      ? "border-line text-muted line-through cursor-not-allowed"
                      : s === size
                      ? "border-espresso bg-espresso text-ivory"
                      : "border-line text-espresso hover:border-espresso")
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={add}
        disabled={busy || !selected || selected.stock === 0 || !anyStock}
        className="jr-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Adding..." : selected?.stock === 0 || !anyStock ? "Sold out" : "Add to bag"}
      </button>
    </div>
  );
}