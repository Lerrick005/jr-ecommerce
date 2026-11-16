import Link from "next/link";
import { listProducts } from "@/server/repositories/product.repo";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductSort } from "@/lib/product";

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" }
];

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const sort = (SORTS.find((s) => s.value === sp.sort)?.value ?? "newest") as ProductSort;
  const q = sp.q?.trim();
  const page = sp.page ? Number(sp.page) : 1;

  const result = await listProducts({ sort, q, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="jr-container py-8">
      <h1 className="jr-heading-lg">All products</h1>
      <p className="mt-1 text-sm text-muted">{result.total} item{result.total === 1 ? "" : "s"}</p>

      {/* Sort Options */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-espresso">Sort by</p>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => {
            const active = s.value === sort;
            const params = new URLSearchParams();
            if (s.value !== "newest") params.set("sort", s.value);
            if (q) params.set("q", q);
            const href = `/shop${params.toString() ? `?${params.toString()}` : ""}`;
            return (
              <Link
                key={s.value}
                href={href}
                className={
                  "border px-3 py-1.5 text-xs transition-colors " +
                  (active ? "border-espresso bg-espresso text-white" : "border-line text-espresso hover:border-espresso")
                }
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      {result.items.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No products found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-1 text-xs">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const active = p === page;
            const params = new URLSearchParams();
            if (p !== 1) params.set("page", String(p));
            if (sort !== "newest") params.set("sort", sort);
            if (q) params.set("q", q);
            return (
              <Link
                key={p}
                href={`/shop${params.toString() ? `?${params.toString()}` : ""}`}
                className={
                  "border px-3 py-1 " +
                  (active ? "border-espresso bg-espresso text-white" : "border-line text-espresso hover:border-espresso")
                }
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}