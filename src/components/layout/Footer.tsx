import Link from "next/link";
import { shopConfig } from "@config";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-surface/80">
      <div className="jr-container grid grid-cols-2 gap-8 py-14 text-xs sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-2xl text-surface">{shopConfig.brand.name}</p>
          <p className="mt-3 text-surface/60 leading-relaxed">
            Kenyan e-commerce for a life well-lived. Curated products, delivered nationwide.
          </p>
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-wide text-surface">Shop</p>
          <ul className="space-y-2 text-surface/60">
            <li><Link href="/shop" className="hover:text-surface">All products</Link></li>
            <li><Link href="/shop/women" className="hover:text-surface">Women</Link></li>
            <li><Link href="/shop/men" className="hover:text-surface">Men</Link></li>
            <li><Link href="/shop/bags" className="hover:text-surface">Bags</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-wide text-surface">Help</p>
          <ul className="space-y-2 text-surface/60">
            <li><Link href="/delivery" className="hover:text-surface">Delivery</Link></li>
            <li><Link href="/returns" className="hover:text-surface">Returns</Link></li>
            <li><Link href="/contact" className="hover:text-surface">Contact</Link></li>
            <li><Link href="/size-guide" className="hover:text-surface">Size guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-wide text-surface">Legal</p>
          <ul className="space-y-2 text-surface/60">
            <li><Link href="/privacy" className="hover:text-surface">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-surface">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface/10">
        <div className="jr-container flex flex-wrap items-center justify-between gap-2 py-4 text-[10px] uppercase tracking-wide text-surface/50">
          <span>Â© {new Date().getFullYear()} {shopConfig.brand.name}. All rights reserved.</span>
          <span>Made in Kenya</span>
        </div>
      </div>
    </footer>
  );
}