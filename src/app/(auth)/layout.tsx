import Link from "next/link";
import { shopConfig } from "@config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line">
        <div className="jr-container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-editorial">
            {shopConfig.brand.name}
          </Link>
          <Link href="/" className="text-xs uppercase tracking-wide text-muted hover:text-espresso">
            Back to shop
          </Link>
        </div>
      </header>
      <main className="jr-container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}