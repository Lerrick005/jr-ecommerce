"use client";

import Link from "next/link";
import Image from "next/image";
import { formatKes, discountPercent } from "@/lib/money";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { useState } from "react";

type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  compareAtCents: number | null;
  category: { slug: string };
  images: Array<{ url: string; altText: string | null }>;
  variants: Array<{ id: string; size: string | null; colour: string | null; stock: number }>;
  reviews?: Array<{ rating: number }>;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const [loading, setLoading] = useState(false);
  const discount = discountPercent(product.basePriceCents, product.compareAtCents);
  const primary = product.images[0]?.url ?? "/images/placeholder.svg";
  
  const inStock = product.variants.some((v) => v.stock > 0);
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0);
  
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigating to product page
    if (!firstAvailableVariant) return;
    setLoading(true);
    
    const res = await fetch("/api/v1/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: firstAvailableVariant.id, quantity: 1 })
    });
    
    setLoading(false);
    if (res.ok) {
      toast.success("Added to bag");
    } else {
      toast.error("Could not add to bag");
    }
  }

  return (
    <div className="group flex flex-col bg-white border border-line rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      
      {/* Image area */}
      <Link href={`/shop/${product.category.slug}/${product.slug}`} className="relative aspect-[4/5] bg-[#F7F7F7] overflow-hidden block">
        <Image
          src={primary}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount !== null && (
            <span className="bg-sale text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="bg-espresso text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-muted hover:text-sale transition-colors z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </Link>

      {/* Content area */}
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/shop/${product.category.slug}/${product.slug}`}>
          <h3 className="text-sm font-semibold text-espresso line-clamp-1 hover:text-gold transition-colors">{product.name}</h3>
        </Link>
        
        <div className="mt-1 flex items-center gap-1.5">
          {reviewCount > 0 && <StarRating value={avgRating} count={reviewCount} />}
        </div>

        <div className="mt-2 flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-espresso">{formatKes(product.basePriceCents)}</span>
          {product.compareAtCents && (
            <span className="text-xs text-muted line-through">{formatKes(product.compareAtCents)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={addToCart}
          disabled={loading || !inStock}
          className="mt-auto w-full border border-espresso bg-transparent text-espresso py-2 text-[11px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-espresso hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          {loading ? "Adding..." : inStock ? "Add to Cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}