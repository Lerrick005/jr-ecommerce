export function StarRating({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = rounded >= n;
          const half = !filled && rounded >= n - 0.5;
          return (
            <svg
              key={n}
              width="11"
              height="11"
              viewBox="0 0 20 20"
              className="shrink-0"
              aria-hidden
            >
              <defs>
                <linearGradient id={`half-${n}`}>
                  <stop offset="50%" stopColor="#FFB400" />
                  <stop offset="50%" stopColor="#E2DACD" />
                </linearGradient>
              </defs>
              <path
                d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
                fill={filled ? "#FFB400" : half ? `url(#half-${n})` : "#E2DACD"}
              />
            </svg>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-muted">({count})</span>
      )}
    </div>
  );
}