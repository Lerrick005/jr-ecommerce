import Link from "next/link";
import { loadCartForViewer } from "@/server/services/cart.service";

export async function BagBadge() {
  let count = 0;
  try {
    const cart = await loadCartForViewer();
    count = cart.itemCount;
  } catch {
    count = 0;
  }

  return (
    <Link href="/cart" className="flex items-center gap-2 hover:text-gold transition-colors relative">
      Bag
      <div className="relative">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sale px-1 text-[9px] font-bold text-white border border-white">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}