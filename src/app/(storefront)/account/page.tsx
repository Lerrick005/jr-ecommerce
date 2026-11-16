import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/money";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { orders: true, wishlistItems: true, addresses: true } }
    }
  });

  if (!user) redirect("/login");

  const latestOrder = user.orders[0];
  const isManager = user.role === "MANAGER" || user.role === "SUPER_ADMIN";

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="jr-container max-w-5xl">
        
        <div className="mb-8">
          <p className="jr-eyebrow">My Account</p>
          <h1 className="jr-heading-lg mt-1 text-espresso">Welcome back, {user.name?.split(" ")[0] || "there"}</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="md:col-span-1">
            <div className="bg-white border border-line rounded-sm overflow-hidden sticky top-24">
              
              {/* ONLY SHOW THIS IF LOGGED IN AS MANAGER */}
              {isManager && (
                <Link href="/admin" className="flex items-center gap-3 px-5 py-4 bg-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-gold-hover transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  Admin Dashboard
                </Link>
              )}

              <nav className="flex flex-col">
                <Link href="/account" className="flex items-center gap-3 px-5 py-4 bg-espresso text-white text-sm font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Overview
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-5 py-4 text-sm text-espresso hover:bg-ivory border-b border-line transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  Orders
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-5 py-4 text-sm text-espresso hover:bg-ivory border-b border-line transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  Wishlist
                </Link>
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="w-full flex items-center gap-3 px-5 py-4 text-sm text-sale hover:bg-red-50 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white border border-line p-6 rounded-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-espresso mb-2">Profile Details</h2>
                <p className="text-sm text-espresso"><span className="text-muted">Name:</span> {user.name}</p>
                <p className="text-sm text-espresso mt-1"><span className="text-muted">Email:</span> {user.email}</p>
                <p className="text-sm text-espresso mt-1"><span className="text-muted">Phone:</span> {user.phone || "Not set"}</p>
              </div>
              <button className="border border-line px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:border-espresso transition-colors">
                Edit Profile
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Link href="/account/orders" className="bg-white border border-line p-4 rounded-sm text-center hover:border-gold transition-colors">
                <p className="text-2xl font-display text-gold">{user._count.orders}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Orders</p>
              </Link>
              <Link href="/wishlist" className="bg-white border border-line p-4 rounded-sm text-center hover:border-gold transition-colors">
                <p className="text-2xl font-display text-gold">{user._count.wishlistItems}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Wishlist</p>
              </Link>
              <div className="bg-white border border-line p-4 rounded-sm text-center">
                <p className="text-2xl font-display text-gold">{user._count.addresses}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Addresses</p>
              </div>
            </div>

            {/* Recent Order Card */}
            <div className="bg-white border border-line p-6 rounded-sm">
              <div className="flex items-center justify-between mb-4 border-b border-line pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-espresso">Recent Order</h2>
                <Link href="/account/orders" className="text-xs font-semibold text-gold hover:text-espresso transition-colors">View All</Link>
              </div>
              
              {latestOrder ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-espresso">{latestOrder.orderNumber}</p>
                    <p className="text-xs text-muted mt-1">Placed on {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(latestOrder.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-muted mb-1">Status</p>
                      <span className="inline-block bg-gold/10 text-gold px-2 py-1 text-[10px] font-bold uppercase rounded-sm">
                        {latestOrder.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-muted mb-1">Total</p>
                      <p className="text-sm font-bold text-espresso">{formatKes(latestOrder.totalCents)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted mb-4">You haven't placed any orders yet.</p>
                  <Link href="/shop" className="jr-btn-primary inline-flex">Start Shopping</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}