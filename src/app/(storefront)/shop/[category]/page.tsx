import Link from "next/link";
import { notFound } from "next/navigation";
import { listProducts, listCategories } from "@/server/repositories/product.repo";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductSort } from "@/lib/product";

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" }
];

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; q?: string; page?: string }>;
}) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;
  const sort = (SORTS.find((s) => s.value === sp.sort)?.value ?? "newest") as ProductSort;
  const page = sp.page ? Number(sp.page) : 1;

  const categories = await listCategories();
  const current = categories.find((c) => c.slug === categorySlug);
  if (!current) notFound();

  const result = await listProducts({ categorySlug, sort, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="bg-white min-h-screen pb-16">
      
      {/* CATEGORY BANNER */}
      <div className="bg-[#F5EFE6] border-b border-line">
        <div className="jr-container py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <p className="text-[11px] uppercase tracking-widest text-gold font-semibold mb-2">The Collection</p>
            <h1 className="jr-heading-xl text-espresso mb-4">{current.name}</h1>
            <p className="text-sm text-muted mb-6">Discover our curated selection of premium {current.name.toLowerCase()}.</p>
            <button className="jr-btn-primary">Shop the Collection</button>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-80 relative bg-white border border-line shadow-sm overflow-hidden rounded-sm">
             {/* Placeholder image for the banner until real ones are uploaded */}
            <img src={`/images/products/category-${current.slug}.svg`} alt={current.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="jr-container mt-8">
        
        {/* FILTER & SORT BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:border-espresso transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Filters
            </button>
            <span className="text-xs text-muted hidden sm:inline">{result.total} products</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-espresso">Sort by:</span>
              <form method="get" className="inline-block">
                <select 
                  name="sort" 
                  defaultValue={sort}
                  className="border border-line bg-white px-3 py-1.5 text-xs font-medium focus:border-gold focus:outline-none"
                  onchange="this.form.submit()"
                >
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </form>
            </div>
            
            {/* View Toggle (Grid / List) - purely visual for now */}
            <div className="hidden sm:flex border border-line">
              <button className="p-2 bg-ivory text-espresso"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button>
              <button className="p-2 text-muted hover:text-espresso border-l border-line"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {result.items.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {result.items.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <nav className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const active = p === page;
              const params = new URLSearchParams();
              if (p !== 1) params.set("page", String(p));
              if (sort !== "newest") params.set("sort", sort);
              return (
                <Link
                  key={p}
                  href={`/shop/${categorySlug}${params.toString() ? `?${params.toString()}` : ""}`}
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors " +
                    (active ? "bg-gold text-white" : "bg-ivory text-espresso hover:bg-line")
                  }
                >
                  {p}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={`/shop/${categorySlug}?page=${page + 1}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory text-espresso hover:bg-line">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* BOTTOM TRUST BAR */}
      <div className="jr-container mt-16">
        <div className="border border-line bg-[#F7F7F7] rounded-lg p-6 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-espresso" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div>
              <p className="text-sm font-bold text-espresso">Fast Delivery</p>
              <p className="text-xs text-muted">Across Kenya</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-espresso" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <div>
              <p className="text-sm font-bold text-espresso">Secure Payments</p>
              <p className="text-xs text-muted">M-Pesa & Card</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-espresso" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <div>
              <p className="text-sm font-bold text-espresso">24/7 Support</p>
              <p className="text-xs text-muted">We're here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-espresso" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <div>
              <p className="text-sm font-bold text-espresso">Shop with Confidence</p>
              <p className="text-xs text-muted">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}