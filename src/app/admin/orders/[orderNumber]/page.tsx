import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";

const NEXT_STATUS: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED", "FAILED"],
  PAID: ["IN_PREPARATION", "CANCELLED"],
  IN_PREPARATION: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED", "RETURNED"],
  CANCELLED: [],
  FAILED: [],
  RETURN_REQUESTED: ["RETURNED", "EXCHANGED"],
  RETURNED: [],
  EXCHANGED: []
};

export default async function AdminOrderDetail({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!order) notFound();
  const address = order.addressSnapshotJson as Record<string, string>;
  const allowedNext = NEXT_STATUS[order.status] ?? [];

  return (
    <div>
      <nav className="text-xs text-muted mb-4">
        <Link href="/admin/orders" className="hover:text-espresso">Orders</Link> / <span>{order.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="jr-heading-lg">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{formatKes(order.totalCents)}</p>
          <p className="text-xs mt-1 uppercase tracking-wide text-gold">{order.status.replace("_", " ")}</p>
        </div>
      </div>

      {allowedNext.length > 0 && (
        <div className="mt-6 border border-line bg-surface p-4">
          <p className="jr-eyebrow mb-2">Update status</p>
          <AdminStatusForm orderNumber={order.orderNumber} allowedNext={allowedNext} />
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow mb-2">Customer</p>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-xs text-muted mt-1">{order.customerEmail}</p>
          <p className="text-xs text-muted mt-1">{order.customerPhone}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow mb-2">Delivery address</p>
          <p className="text-sm">{address.fullName}</p>
          <p className="text-xs text-muted mt-1">{address.town}, {address.county}</p>
          {address.landmark && <p className="text-xs text-muted mt-1">{address.landmark}</p>}
        </div>
      </div>

      <div className="mt-6 border border-line bg-surface p-4">
        <p className="jr-eyebrow mb-3">Items</p>
        <ul className="space-y-3">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between text-sm">
              <div>
                <p>{it.nameSnapshot}</p>
                <p className="text-xs text-muted mt-0.5">
                  {it.sizeSnapshot ? `Size ${it.sizeSnapshot}` : ""} {it.colourSnapshot ? `Â· ${it.colourSnapshot}` : ""} Â· Qty {it.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatKes(it.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border border-line bg-surface p-4">
        <p className="jr-eyebrow mb-3">Status history</p>
        <ul className="space-y-2 text-xs">
          {order.statusHistory.map((h) => (
            <li key={h.id} className="flex items-start gap-2">
              <span className="text-muted">{new Intl.DateTimeFormat("en-KE", { dateStyle: "short", timeStyle: "short" }).format(h.createdAt)}</span>
              <span className="font-medium">{h.toStatus.replace("_", " ")}</span>
              {h.note && <span className="text-muted">â€" {h.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}