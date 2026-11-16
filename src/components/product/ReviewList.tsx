import { StarRating } from "./StarRating";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  user?: { name: string | null } | null;
};

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="mt-16 border-t border-line pt-8">
        <h2 className="jr-heading-lg text-xl mb-4">Customer reviews</h2>
        <div className="border border-line bg-surface p-6 text-center text-sm text-muted">
          No reviews yet. Be the first to review this product!
        </div>
      </div>
    );
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length
  }));

  return (
    <div className="mt-16 border-t border-line pt-8">
      <h2 className="jr-heading-lg text-xl mb-6">Customer reviews</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border border-line bg-surface p-4 h-fit">
          <p className="text-3xl font-display mb-1">{avg.toFixed(1)}</p>
          <StarRating value={avg} />
          <p className="text-xs text-muted mt-1">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 space-y-1">
            {counts.map(({ star, count }) => {
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-amber" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-line pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} />
                  {r.title && <span className="font-semibold text-sm">{r.title}</span>}
                </div>
                <span className="text-xs text-muted">
                  {new Intl.DateTimeFormat("en-KE", { month: "short", year: "numeric" }).format(r.createdAt)}
                </span>
              </div>
              {r.body && <p className="mt-2 text-sm text-espresso/90">{r.body}</p>}
              <p className="mt-2 text-xs text-muted">
                - {r.user?.name ?? "Verified buyer"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}