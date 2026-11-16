import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  const role = (session.user as { role?: string }).role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return (
      <main className="jr-container py-16 text-center">
        <h1 className="jr-heading-lg">Forbidden</h1>
        <p className="mt-2 text-muted">You need a manager account.</p>
        <Link href="/" className="jr-btn-outline mt-6 inline-flex">Back to shop</Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar managerName={session.user.name ?? "Manager"} />
      <div className="flex-1">
        <main className="jr-container py-8">{children}</main>
      </div>
    </div>
  );
}