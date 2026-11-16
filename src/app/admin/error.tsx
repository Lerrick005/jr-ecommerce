"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-2xl text-espresso mb-4">Admin error</h1>
      <p className="text-sm text-muted mb-6">{error.message || "Something went wrong."}</p>
      <button
        onClick={() => reset()}
        className="bg-espresso text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
