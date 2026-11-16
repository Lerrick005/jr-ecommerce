const STAGES = [
  { key: "PENDING_PAYMENT", label: "Order Placed" },
  { key: "PAID", label: "Paid" },
  { key: "IN_PREPARATION", label: "In Preparation" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" }
];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const isCancelled = ["CANCELLED", "FAILED", "RETURNED"].includes(currentStatus);

  return (
    <div className="mt-6 border-t border-line pt-6">
      <p className="jr-eyebrow mb-4">Order status</p>
      {isCancelled ? (
        <div className="text-sm text-sale uppercase tracking-wide font-semibold">
          {currentStatus.replace("_", " ")}
        </div>
      ) : (
        <div className="relative flex justify-between">
          {STAGES.map((stage, i) => {
            const isActive = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={stage.key} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`h-3 w-3 rounded-full border-2 ${isActive ? "bg-gold border-gold" : "bg-surface border-line"} ${isCurrent ? "ring-4 ring-gold/20" : ""}`} />
                <p className={`mt-2 text-[10px] uppercase tracking-wide text-center ${isActive ? "text-espresso font-semibold" : "text-muted"}`}>
                  {stage.label}
                </p>
                {i < STAGES.length - 1 && (
                  <div className={`absolute top-1.5 left-1/2 w-full h-[1px] ${isActive ? "bg-gold" : "bg-line"} -z-10`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}