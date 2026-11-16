import { prisma } from "@/lib/db";
import { AdminProductCreateForm } from "@/components/admin/AdminProductCreateForm";

export default async function AdminProductNewPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="jr-heading-lg mb-6">Add product</h1>
      <AdminProductCreateForm categories={categories} />
    </div>
  );
}