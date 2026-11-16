import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/server/repositories/product.repo";
import { formatKes, discountPercent } from "@/lib/money";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToBagButton } from "@/components/bag/AddToBagButton";
import { WishlistHeartButton } from "@/components/bag/WishlistHeartButton";
import { ReviewList } from "@/components/product/ReviewList";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category: categorySlug, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.category.slug !== categorySlug) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 5);
  const discount = discountPercent(product.basePriceCents, product.compareAtCents);
  const stockByVariant = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="jr-container py-8">
      <nav className="text-xs text-muted">
        <Link href="/shop" className="hover:text-espresso">Shop</Link>
        {" / "}
        <Link href={`/shop/${product.category.slug}`} className="hover:text-espresso">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-espresso">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square bg-ivory">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">No image</div>
            )}
            {discount !== null && (
              <span className="absolute left-2 top-2 bg-sale px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div key={img.id} className="relative aspect-square bg-ivory">
                  <Image src={img.url} alt={img.altText ?? product.name} fill sizes="15vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="jr-heading-lg">{product.name}</h1>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{formatKes(product.basePriceCents)}</span>
            {product.compareAtCents && product.compareAtCents > product.basePriceCents && (
              <span className="text-sm text-muted line-through">{formatKes(product.compareAtCents)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            {stockByVariant > 0 ? `${stockByVariant} in stock` : "Out of stock"}
          </p>
          <div className="mt-3"><WishlistHeartButton productId={product.id} /></div>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-espresso/90 whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <AddToBagButton variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              colour: v.colour,
              stock: v.stock,
              sku: v.sku
            }))} />
          </div>

          <div className="mt-6 border-t border-line pt-4 text-xs text-muted">
            <p>Delivery and returns details will be confirmed by the client.</p>
          </div>
        </div>
      </div>

      <ReviewList reviews={product.reviews} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="jr-heading-lg mb-4">You may also like</h2>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}