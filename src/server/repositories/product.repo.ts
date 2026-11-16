import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { ProductFilter } from "@/lib/product";
import { DEFAULT_PAGE_SIZE } from "@/lib/product";
import { unstable_cache } from "next/cache";

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  basePriceCents: true,
  compareAtCents: true,
  currency: true,
  category: { select: { slug: true, name: true } },
  images: {
    orderBy: { position: "asc" as const },
    take: 2,
    select: { url: true, altText: true, colour: true }
  },
  variants: {
    where: { active: true, deletedAt: null },
    select: { id: true, size: true, colour: true, stock: true }
  },
  reviews: {
    where: { approved: true },
    select: { rating: true }
  }
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

async function _listProductsCached(filter: ProductFilter) {
  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const pageSize = filter.pageSize && filter.pageSize > 0 ? Math.min(filter.pageSize, 60) : DEFAULT_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {
    active: true,
    deletedAt: null,
    ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
    ...(filter.minPriceCents || filter.maxPriceCents
      ? {
          basePriceCents: {
            ...(filter.minPriceCents ? { gte: filter.minPriceCents } : {}),
            ...(filter.maxPriceCents ? { lte: filter.maxPriceCents } : {})
          }
        }
      : {})
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filter.sort === "price-asc" ? { basePriceCents: "asc" } :
    filter.sort === "price-desc" ? { basePriceCents: "desc" } :
    { createdAt: "desc" };

  // If search query present, use fuzzy matching via raw SQL for typo tolerance
  if (filter.q) {
    const q = filter.q.trim();
    // similarity('laptp', name) returns a score 0-1
    const fuzzyIds = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Product"
      WHERE active = true AND "deletedAt" IS NULL
        AND (similarity(name, ${q}) > 0.2 OR name ILIKE ${'%' + q + '%'})
      LIMIT 200
    `;
    const ids = fuzzyIds.map((r) => r.id);
    where.id = { in: ids };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: productCardSelect
    }),
    prisma.product.count({ where })
  ]);

  return { items, total, page, pageSize };
}

export async function listProducts(filter: ProductFilter) {
  const cacheKey = ["products-list", JSON.stringify(filter)];
  return unstable_cache(
    () => _listProductsCached(filter),
    cacheKey,
    { revalidate: 60, tags: ["products"] }
  )();
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { where: { active: true, deletedAt: null }, orderBy: [{ colour: "asc" }, { size: "asc" }] },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }
    }
  });
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, take = 6) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: excludeProductId }, active: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
    select: productCardSelect
  });
}

export async function listCategories() {
  return unstable_cache(
    async () => prisma.category.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true }
    }),
    ["categories-list"],
    { revalidate: 300, tags: ["categories"] }
  )();
}