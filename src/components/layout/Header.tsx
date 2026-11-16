import Link from "next/link";
import { shopConfig } from "@config";
import { listCategories } from "@/server/repositories/product.repo";
import { BagBadge } from "@/components/bag/BagBadge";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getContent } from "@/lib/content";

function getCategoryIcon(slug: string) {
  const iconClass = "w-4 h-4 mr-2 text-muted group-hover:text-espresso transition-colors";
  switch (slug) {
    case "women":
    case "men":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/></svg>;
    case "shoes":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16s.5-3 3.5-3 5-2 6-4c1-2 3-2 4-1s4 3 5 5v3H4z"/></svg>;
    case "bags":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>;
    case "jewellery":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>;
    case "watches":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83"/></svg>;
    case "beauty":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case "home":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "electronics":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
    case "kids":
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
    default:
      return <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export async function Header() {
  const [categories, announcement] = await Promise.all([
    listCategories(),
    getContent("announcementBar", "Complimentary delivery on orders over KSh 5,000 | M-Pesa | Card | Cash on delivery")
  ]);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-line">
      <AnnouncementBar message={announcement} />
      
      {/* Top Row */}
      <div className="jr-container flex h-20 items-center justify-between gap-8">
        
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-espresso">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
          <span className="font-display text-2xl tracking-tight text-espresso font-semibold">J&R Ecommerce</span>
        </Link>
        
        {/* Search Bar - Now with a grey pill background */}
        <form action="/search" method="get" className="hidden flex-1 max-w-2xl md:flex items-center relative">
          <input
            name="q"
            type="search"
            placeholder="Search products..."
            className="w-full bg-[#F7F7F7] rounded-full pl-6 pr-14 py-3 text-sm text-espresso placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 bg-gold hover:bg-gold-hover text-white rounded-full w-10 flex items-center justify-center transition-colors shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </form>

        {/* Icons */}
        <nav className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-espresso">
          <Link href="/wishlist" className="hidden lg:flex items-center gap-2 hover:text-gold transition-colors">
            Wishlist <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </Link>
          <Link href="/account" className="flex items-center gap-2 hover:text-gold transition-colors">
            Account <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <BagBadge />
        </nav>
      </div>

      {/* Bottom Row: Categories */}
      {categories.length > 0 && (
        <div className="jr-container flex items-center justify-center gap-6 md:gap-10 overflow-x-auto py-3 text-[12px] font-semibold text-espresso">
          <Link href="/shop" className="group flex items-center whitespace-nowrap hover:text-espresso transition-colors py-1 border-b-2 border-transparent hover:border-espresso">
            <svg className="w-4 h-4 mr-2 text-muted group-hover:text-espresso transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop/${c.slug}`}
              className="group flex items-center whitespace-nowrap hover:text-espresso transition-colors py-1 border-b-2 border-transparent hover:border-espresso"
            >
              {getCategoryIcon(c.slug)}
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}