import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { WriteReviewForm } from "@/components/product/WriteReviewForm";

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber, userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true } } }
      }
    }
  });

  if (!order) notFound();

  const isDelivered = order.status === "DELIVERED";

  // Fetch any existing reviews for these products by this user
  const existingReviews = isDelivered
    ? await prisma.review.findMany({
        where: {
          userId: session.user.id,
          productId: { in: order.items.map((i) => i.productId) }
        }
      })
    : [];

  const address = order.addressSnapshotJson as Record<string, string>;

  return (
    <div className="jr-container py-8 max-w-3xl">
      <nav className="text-xs text-muted mb-6">
        <Link href="/account" className="hover:text-espresso">Account</Link>
        {" / "}
        <Link href="/account/orders" className="hover:text-espresso">Orders</Link>
        {" / "}
        <span className="text-espresso">{order.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="jr-heading-lg">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted mt-1">
            Placed on {new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{formatKes(order.totalCents)}</p>
          <p className="text-xs mt-1 uppercase tracking-wide text-gold">{order.status.replace("_", " ")}</p>
        </div>
      </div>

      <OrderTimeline currentStatus={order.status} />

      <div className="mt-8 border border-line bg-surface">
        <div className="p-4 sm:p-6 border-b border-line">
          <p className="jr-eyebrow mb-4">Items</p>
          <ul className="space-y-6">
            {order.items.map((item) => {
              const existing = existingReviews.find((r) => r.productId === item.productId);
              return (
                <li key={item.id} className="border-b border-line pb-6 last:border-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-ivory shrink-0 border border-line">
                      <img src="/images/placeholder.svg" alt="img" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.nameSnapshot}</p>
                      <p className="text-xs text-muted mt-1">
                        {item.sizeSnapshot ? `Size ${item.sizeSnapshot}` : ""} {item.colourSnapshot ? `Â· ${item.colourSnapshot}` : ""}
                      </p>
                      <p className="text-xs text-muted mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-2">{formatKes(item.lineTotalCents)}</p>
                    </div>
                  </div>
                  {isDelivered && (
                    <div className="mt-3 pl-20">
                      <WriteReviewForm
                        productId={item.productId}
                        existingReview={existing ? { rating: existing.rating, title: existing.title, body: existing.body } : null}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-6 bg-surface">
          <div>
            <p className="jr-eyebrow mb-2">Delivery address</p>
            <p className="text-sm">{address.fullName}</p>
            <p className="text-xs text-muted mt-1">{address.phone}</p>
            <p className="text-xs text-muted mt-1">{address.town}, {address.county}</p>
          </div>
          <div>
            <p className="jr-eyebrow mb-2">Payment summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatKes(order.subtotalCents)}</span></div>
              <div className="flex justify-between text-muted"><span>Delivery</span><span>{formatKes(order.deliveryFeeCents)}</span></div>
              <div className="flex justify-between text-muted"><span>VAT</span><span>{formatKes(order.vatCents)}</span></div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-line"><span>Total</span><span>{formatKes(order.totalCents)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/account/orders" className="jr-btn-outline">Back to orders</Link>
      </div>
    </div>
  );
}