export type ProductSort = "newest" | "price-asc" | "price-desc" | "best-selling";

export type ProductFilter = {
  categorySlug?: string;
  q?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export const DEFAULT_PAGE_SIZE = 24;