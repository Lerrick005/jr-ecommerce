"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/outbox", label: "Outbox" }
];

export function AdminSidebar({ managerName }: { managerName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-line bg-surface shrink-0 hidden md:flex flex-col">
      <div className="p-6 border-b border-line">
        <Link href="/admin" className="font-display text-lg tracking-editorial">J&R Admin</Link>
        <p className="mt-1 text-xs text-muted">{managerName}</p>
      </div>
      <nav className="p-3 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 px-3 py-2 text-sm transition-colors " +
                (active ? "bg-gold text-white font-semibold rounded-sm" : "text-espresso hover:bg-ivory rounded-sm")
              }
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-line">
        <Link href="/" className="block px-3 py-2 text-xs text-muted hover:text-espresso">Back to Shop</Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="w-full text-left px-3 py-2 text-xs text-muted hover:text-sale">Sign out</button>
        </form>
      </div>
    </aside>
  );
}