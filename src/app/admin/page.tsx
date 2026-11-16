import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";

export default async function AdminDashboard() {
  const [orderCount, productCount, customerCount, revenue, recentOrders] = await Promise.all([
    prisma.order.count({ where: { status: { not: "FAILED" } } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED"] } },
      _sum: { totalCents: true }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, customerName: true, totalCents: true, status: true, createdAt: true }
    })
  ]);

  const paidOrders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED"] } },
    select: { createdAt: true, totalCents: true }
  });

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = last7Days.map(date => {
    const dayTotal = paidOrders
      .filter(o => o.createdAt.toISOString().split("T")[0] === date)
      .reduce((sum, o) => sum + o.totalCents, 0);
    return { date: new Date(date).toLocaleDateString("en-KE", { weekday: "short" }), revenue: dayTotal / 100 };
  });

  const stats = [
    { label: "Total Revenue", value: formatKes(revenue._sum.totalCents ?? 0), bg: "bg-green-50", text: "text-green-700" },
    { label: "Total Orders", value: orderCount.toString(), bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Active Products", value: productCount.toString(), bg: "bg-orange-50", text: "text-orange-700" },
    { label: "Customers", value: customerCount.toString(), bg: "bg-purple-50", text: "text-purple-700" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-espresso">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Here is what is happening in your store today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="bg-white border border-line text-espresso px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-espresso transition-colors rounded-sm shadow-sm">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="bg-espresso text-white px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-gold transition-colors rounded-sm shadow-sm">
            View Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={"border border-line p-6 rounded-sm " + s.bg}>
            <p className="text-[11px] uppercase tracking-widest text-muted font-semibold">{s.label}</p>
            <p className={"mt-2 text-2xl font-bold " + s.text}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white border border-line p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-espresso">Revenue (Last 7 Days)</h2>
            <Link href="/admin/analytics" className="text-xs text-gold font-semibold hover:underline">Full Report</Link>
          </div>
          <AdminDashboardCharts data={chartData} />
        </div>

        <div className="bg-white border border-line p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-espresso">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold font-semibold hover:underline">View All</Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((o) => (
                <Link key={o.id} href={"/admin/orders/" + o.orderNumber} className="flex items-center justify-between border-b border-line pb-3 last:border-0 group">
                  <div>
                    <p className="text-sm font-semibold text-espresso group-hover:text-gold transition-colors">{o.customerName}</p>
                    <p className="text-xs text-muted font-mono mt-0.5">{o.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatKes(o.totalCents)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-gold mt-0.5">{o.status.replace("_", " ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}