import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const query = sp.q?.trim();

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(query ? { name: { contains: query, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { take: 1, orderBy: { position: "asc" } },
      _count: { select: { variants: true } }
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-espresso">Products</h1>
          <p className="text-sm text-muted mt-1">Manage your catalogue ({products.length} items).</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk" className="bg-white border border-line text-espresso px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-espresso transition-colors rounded-sm shadow-sm">
            Bulk Upload
          </Link>
          <Link href="/admin/products/new" className="bg-espresso text-white px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-gold transition-colors rounded-sm shadow-sm">
            + Add Product
          </Link>
        </div>
      </div>

      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={query ?? ""} placeholder="Search products by name..." className="flex-1 border border-line bg-white px-4 py-2 text-sm focus:border-gold focus:outline-none rounded-sm shadow-sm" />
        <button type="submit" className="bg-espresso text-white px-6 py-2 text-xs font-bold uppercase tracking-wide rounded-sm shadow-sm hover:bg-gold transition-colors">Search</button>
      </form>

      <div className="bg-white border border-line rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F9F9F9] border-b border-line text-[10px] uppercase tracking-widest text-muted">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold text-center">Stock</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const image = p.images[0];
              return (
                <tr key={p.id} className="hover:bg-[#F9F9F9] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 bg-line overflow-hidden rounded-sm">
                      {image && <img src={image.url} alt={p.name} className="h-full w-full object-cover" />}
                    </div>
                    <span className="font-medium text-espresso">{p.name}</span>
                  </td>
                  <td className="p-4 text-muted">{p.category.name}</td>
                  <td className="p-4 font-semibold text-espresso">{formatKes(p.basePriceCents)}</td>
                  <td className="p-4 text-center text-muted">{p._count.variants} variants</td>
                  <td className="p-4 text-right">
                    <Link href={"/admin/products/" + p.id} className="text-xs font-semibold text-gold hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}