import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });

  return (
    <div className="jr-container py-8">
      <nav className="text-xs text-muted mb-4">
        <Link href="/account" className="hover:text-espresso">Account</Link>
        {" / "}
        <span className="text-espresso">Orders</span>
      </nav>
      <h1 className="jr-heading-lg">Your orders</h1>
      <p className="mt-1 text-sm text-muted">Track and manage your purchases.</p>

      {orders.length === 0 ? (
        <div className="mt-10 text-center border border-line bg-surface p-8">
          <p className="text-muted">You haven't placed any orders yet.</p>
          <Link href="/shop" className="jr-btn-primary mt-4 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-line bg-surface p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Order {o.orderNumber}</p>
                  <p className="text-sm mt-1">
                    {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(o.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatKes(o.totalCents)}</p>
                  <p className="text-xs mt-1 uppercase tracking-wide text-gold">{o.status.replace("_", " ")}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-4 overflow-x-auto">
                {o.items.map((item) => (
                  <div key={item.id} className="w-16 shrink-0 text-center">
                    <div className="aspect-square bg-ivory border border-line">
                      <img src="/images/placeholder.svg" alt="img" className="h-full w-full object-cover" />
                    </div>
                    <p className="text-[10px] text-muted mt-1 truncate">{item.nameSnapshot}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-3 items-center justify-between">
                <p className="text-xs text-muted">{o.items.length} item(s)  Delivered to {o.customerName}</p>
                <div className="flex gap-2">
                  <Link href={`/account/orders/${o.orderNumber}`} className="jr-btn-outline !py-2 !px-4 !text-xs !min-h-[auto]">
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}