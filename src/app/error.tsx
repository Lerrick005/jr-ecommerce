"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl text-espresso mb-4">Something went wrong</h1>
        <p className="text-sm text-muted mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="bg-espresso text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
