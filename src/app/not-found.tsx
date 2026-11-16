import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="text-center max-w-md">
        <p className="text-[11px] uppercase tracking-widest text-gold font-semibold mb-2">404</p>
        <h1 className="font-display text-4xl text-espresso mb-4">Page not found</h1>
        <p className="text-sm text-muted mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex bg-espresso text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
