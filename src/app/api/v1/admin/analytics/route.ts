import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED"] } },
    include: {
      items: { include: { product: { include: { category: true } } } }
    },
    orderBy: { createdAt: "asc" }
  });

  const revenueByDay: Record<string, number> = {};
  for (const o of orders) {
    const day = o.createdAt.toISOString().split("T")[0] ?? o.createdAt.toISOString().slice(0, 10);
    revenueByDay[day] = (revenueByDay[day] ?? 0) + o.totalCents;
  }
  const revenueData = Object.entries(revenueByDay).map(([date, cents]) => ({
    date,
    revenue: cents / 100
  }));

  const salesByCategory: Record<string, number> = {};
  for (const o of orders) {
    for (const item of o.items) {
      const catName = item.product.category.name;
      salesByCategory[catName] = (salesByCategory[catName] ?? 0) + item.lineTotalCents;
    }
  }
  const categoryData = Object.entries(salesByCategory).map(([name, cents]) => ({
    name,
    value: cents / 100
  }));

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalCents, 0) / 100;
  const totalOrders = orders.length;
  const itemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    data: {
      revenueData,
      categoryData,
      summary: { totalRevenue, totalOrders, itemsSold, averageOrderValue }
    }
  });
}