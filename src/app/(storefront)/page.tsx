import Link from "next/link";
import { shopConfig } from "@config";
import { prisma } from "@/lib/db";
import { listProducts, listCategories } from "@/server/repositories/product.repo";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryTile } from "@/components/layout/CategoryTile";
import { NewsletterForm } from "@/components/NewsletterForm";

export default async function HomePage() {
  const [categories, latest, testimonials] = await Promise.all([
    listCategories(),
    listProducts({ pageSize: 10 }),
    prisma.review.findMany({
      where: { approved: true, rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { user: { select: { name: true } } }
    })
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center bg-espresso overflow-hidden">
        {/* Background Image */}
        {/* Note: Replace this URL with your own image later via Cloudinary or Admin */}
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
          alt="J&R Collection" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Floating Text Box */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/90 mb-4 font-semibold">The J&R Collection</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6">
            Quiet essentials, <br />
            <span className="italic font-light">delivered nationwide.</span>
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-lg mx-auto mb-8">
            A considered selection of apparel, shoes, bags and home goods - curated for life in Kenya.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/shop" className="w-full sm:w-auto bg-white text-espresso px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-gold hover:text-white transition-colors">
              Shop the collection
            </Link>
            <Link href="/shop/bags" className="w-full sm:w-auto border border-white text-white px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-espresso transition-colors">
              New in bags
            </Link>
          </div>
        </div>
      </section>
      {/* CATEGORY TILES */}
      {categories.length > 0 && (
        <section className="border-b border-line bg-surface">
          <div className="jr-container py-12">
            <div className="mb-8 text-center">
              <p className="jr-eyebrow text-gold">Shop by category</p>
              <h2 className="jr-heading-lg mt-2">Everything you need</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {categories.slice(0, 10).map((c) => (
                <CategoryTile key={c.id} slug={c.slug} name={c.name} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <section className="jr-container py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="jr-eyebrow text-gold">Just landed</p>
            <h2 className="jr-heading-lg mt-2">New arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="jr-link text-xs">See all</Link>
        </div>
        {latest.items.length === 0 ? (
          <p className="text-sm text-muted">No products yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5">
            {latest.items.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* EDITORIAL */}
      <section className="border-y border-line bg-surface">
        <div className="jr-container grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div className="relative aspect-square overflow-hidden bg-line">
            <img src="/images/products/category-women.svg" alt="The J&R story" className="h-full w-full object-cover" />
          </div>
          <div className="md:pl-8">
            <p className="jr-eyebrow text-gold">The story</p>
            <h2 className="jr-heading-lg mt-3">Made for a life well-lived</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {shopConfig.brand.name} curates pieces that earn their place in your wardrobe. Fabric-first, quietly designed, priced fairly. Every order supports independent designers and makers across Kenya and beyond.
            </p>
            <Link href="/about" className="jr-btn-outline mt-6 inline-flex">Read our story</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="jr-container py-14">
          <div className="mb-8 text-center">
            <p className="jr-eyebrow text-gold">From our customers</p>
            <h2 className="jr-heading-lg mt-2">What people are saying</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.map((r) => (
              <blockquote key={r.id} className="border border-line bg-surface p-6">
                <div className="mb-3 flex gap-1 text-amber text-lg">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={n <= r.rating ? "text-amber" : "text-line"}>
                      {n <= r.rating ? "\u2605" : "\u2606"}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-espresso/90">
                  "{r.body || r.title}"
                </p>
                <footer className="mt-4 text-[11px] uppercase tracking-wide text-muted">
                  - {r.user.name ?? "Verified buyer"}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* CTA STRIP */}
      <section className="border-t border-line bg-ivory">
        <div className="jr-container py-16 text-center">
          <p className="jr-eyebrow text-gold">Stay in the loop</p>
          <h2 className="jr-heading-lg mt-2 text-espresso">First to know about new drops</h2>
          <p className="mt-3 text-sm text-muted">
            Sign up for occasional emails about new arrivals and offers. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}