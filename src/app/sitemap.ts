import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jrecommerce.ke";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { active: true, deletedAt: null },
    select: { slug: true, updatedAt: true, category: { select: { slug: true } } }
  });

  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true }
  });

  const productUrls = products.map((p) => ({
    url: baseUrl + "/shop/" + p.category.slug + "/" + p.slug,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const categoryUrls = categories.map((c) => ({
    url: baseUrl + "/shop/" + c.slug,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: baseUrl + "/shop", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categoryUrls,
    ...productUrls
  ];
}