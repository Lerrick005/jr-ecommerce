import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default async function AdminProductEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true }
  });

  if (!product) notFound();

  return (
    <div>
      <h1 className="jr-heading-lg mb-6">Edit product</h1>
      <AdminProductForm product={product} />
    </div>
  );
}