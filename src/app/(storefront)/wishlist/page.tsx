import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listWishlist } from "@/server/repositories/wishlist.repo";
import { formatKes } from "@/lib/money";
import { WishlistRemoveButton } from "@/components/bag/WishlistRemoveButton";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/wishlist");

  const items = await listWishlist(session.user.id);

  if (items.length === 0) {
    return (
      <div className="jr-container py-16 text-center">
        <h1 className="jr-heading-lg">Your wishlist is empty</h1>
        <p className="mt-3 text-sm text-muted">Tap Save on a product to keep it here.</p>
        <Link href="/shop" className="jr-btn-primary mt-6 inline-flex">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="jr-container py-8">
      <h1 className="jr-heading-lg">Your wishlist</h1>
      <p className="mt-1 text-sm text-muted">{items.length} item{items.length === 1 ? "" : "s"}</p>
      <div className="mt-6 grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
        {items.map((it) => {
          const image = it.product.images[0];
          const href = `/shop/${it.product.category.slug}/${it.product.slug}`;
          return (
            <div key={it.id} className="bg-surface">
              <div className="relative aspect-square overflow-hidden bg-ivory">
                <Link href={href}>
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText ?? it.product.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
                  )}
                </Link>
                <WishlistRemoveButton productId={it.product.id} />
              </div>
              <div className="p-1.5 sm:p-2">
                <Link href={href} className="line-clamp-2 text-[11px] leading-tight sm:text-xs hover:underline">
                  {it.product.name}
                </Link>
                <p className="mt-1 text-sm font-semibold">{formatKes(it.product.basePriceCents)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}