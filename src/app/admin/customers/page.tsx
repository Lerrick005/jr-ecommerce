import { prisma } from "@/lib/db";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-semibold text-espresso mb-6">Customers</h1>
      <div className="bg-white border border-line rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F9F9F9] border-b border-line text-[10px] uppercase tracking-widest text-muted">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold text-center">Orders</th>
              <th className="p-4 font-semibold text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-[#F9F9F9] transition-colors">
                <td className="p-4 font-medium text-espresso">{c.name}</td>
                <td className="p-4 text-muted">{c.email}</td>
                <td className="p-4 text-muted">{c.phone || "-"}</td>
                <td className="p-4 text-center font-semibold text-espresso">{c._count.orders}</td>
                <td className="p-4 text-right text-xs text-muted">
                  {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(c.createdAt)}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}