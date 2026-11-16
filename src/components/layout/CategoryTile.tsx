import Link from "next/link";
import Image from "next/image";

export function CategoryTile({ slug, name }: { slug: string; name: string }) {
  const imageUrl = `/images/products/category-${slug}.svg`;

  return (
    <Link href={`/shop/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-line border border-line rounded-sm">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0"></div>
      </div>
      <p className="mt-3 text-center text-[11px] sm:text-xs uppercase tracking-wide font-semibold text-espresso group-hover:text-gold transition-colors">
        {name}
      </p>
    </Link>
  );
}