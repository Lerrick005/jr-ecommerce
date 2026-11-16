import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string; pending?: string }>;
}) {
  const sp = await searchParams;
  const orderNumber = sp.order;
  const pending = sp.pending === "1";

  if (!orderNumber) {
    return (
      <div className="jr-container py-16 text-center">
        <h1 className="jr-heading-lg">No order number</h1>
        <Link href="/" className="jr-btn-primary mt-6 inline-flex">Home</Link>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true }
  });

  if (!order) {
    return (
      <div className="jr-container py-16 text-center">
        <h1 className="jr-heading-lg">Order not found</h1>
        <Link href="/" className="jr-btn-primary mt-6 inline-flex">Home</Link>
      </div>
    );
  }

  return (
    <div className="jr-container py-12">
      <div className="max-w-lg mx-auto text-center">
        <p className="jr-eyebrow">Thank you</p>
        <h1 className="jr-heading-lg mt-2">
          {order.status === "PAID" ? "Order confirmed" : pending ? "Waiting for payment" : "Order placed"}
        </h1>
        <p className="mt-2 text-sm text-muted">Order number</p>
        <p className="text-xl font-mono mt-1">{order.orderNumber}</p>

        <div className="mt-6 border border-line bg-surface p-4 text-left text-sm">
          <div className="flex justify-between"><span className="text-muted">Status</span><span>{order.status}</span></div>
          <div className="flex justify-between"><span className="text-muted">Total</span><span>{formatKes(order.totalCents)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Items</span><span>{order.items.length}</span></div>
        </div>

        {pending && (
          <p className="mt-4 text-sm text-muted">
            We sent the M-Pesa prompt to your phone. Once you enter your PIN, this page will update when you refresh.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/shop" className="jr-btn-outline">Continue shopping</Link>
          <Link href="/" className="jr-btn-primary">Home</Link>
        </div>
      </div>
    </div>
  );
}