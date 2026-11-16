import { listProducts } from "@/server/repositories/product.repo";
import { ProductCard } from "@/components/product/ProductCard";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const result = q
    ? await listProducts({ q, pageSize: 40 })
    : { items: [], total: 0, page: 1, pageSize: 40 };

  return (
    <div className="jr-container py-8">
      <h1 className="jr-heading-lg">Search</h1>
      <form method="get" className="mt-4 flex max-w-lg gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by product name"
          className="flex-1 border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <button type="submit" className="jr-btn-primary">Search</button>
      </form>

      {q && (
        <p className="mt-4 text-sm text-muted">
          {result.total} result{result.total === 1 ? "" : "s"} for <strong>&ldquo;{q}&rdquo;</strong>
        </p>
      )}

      {result.items.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {q && result.items.length === 0 && (
        <p className="mt-6 text-sm text-muted">No products matched your search.</p>
      )}
    </div>
  );
}