import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const statusFilter = sp.status;
  const query = sp.q?.trim();

  const where: any = {};
  if (statusFilter && statusFilter !== "ALL") where.status = statusFilter;
  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { customerEmail: { contains: query, mode: "insensitive" } },
      { customerName: { contains: query, mode: "insensitive" } }
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-semibold text-espresso mb-6">Orders</h1>

      <form className="mb-6 flex flex-col sm:flex-row gap-2">
        <input name="q" defaultValue={query ?? ""} placeholder="Search by order #, name, email" className="flex-1 border border-line bg-white px-4 py-2 text-sm focus:border-gold focus:outline-none rounded-sm shadow-sm" />
        <select name="status" defaultValue={statusFilter ?? "ALL"} className="border border-line bg-white px-4 py-2 text-sm rounded-sm shadow-sm focus:border-gold focus:outline-none">
          {["ALL", "PENDING_PAYMENT", "PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <button type="submit" className="bg-espresso text-white px-6 py-2 text-xs font-bold uppercase tracking-wide rounded-sm shadow-sm hover:bg-gold transition-colors">Filter</button>
      </form>

      <div className="bg-white border border-line rounded-sm shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-8 text-sm text-center text-muted">No orders match your filter.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F9F9F9] border-b border-line text-[10px] uppercase tracking-widest text-muted">
              <tr>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F9F9F9] transition-colors">
                  <td className="p-4 font-mono text-xs">
                    <Link href={"/admin/orders/" + o.orderNumber} className="font-semibold text-gold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-espresso">{o.customerName}</p>
                    <p className="text-xs text-muted">{o.customerEmail}</p>
                  </td>
                  <td className="p-4 font-semibold text-espresso">{formatKes(o.totalCents)}</td>
                  <td className="p-4">
                    <span className="inline-block bg-[#F5EFE6] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold rounded-sm">
                      {o.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted">
                    {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}