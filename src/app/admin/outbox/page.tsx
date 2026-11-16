import { prisma } from "@/lib/db";

export default async function AdminOutboxPage() {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: "outbox_" } },
    orderBy: { key: "desc" },
    take: 50
  });

  const entries = rows.map((r) => r.valueJson as {
    type: string;
    to: string;
    subject: string;
    body: string;
    status: string;
    sentAt: string;
  });

  return (
    <div>
      <h1 className="jr-heading-lg">Outbox</h1>
      <p className="mt-1 text-sm text-muted">
        Every email and SMS the system tried to send. In dev mode, this is a log â€" add
        RESEND_API_KEY / AT_API_KEY in .env to send for real.
      </p>

      {entries.length === 0 ? (
        <div className="mt-6 border border-line bg-surface p-6 text-sm text-muted">
          No notifications yet. Place an order or update an order status to trigger one.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {entries.map((e, i) => (
            <div key={i} className="border border-line bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <div className="flex gap-2 items-baseline">
                  <span className="font-semibold uppercase tracking-wide text-gold">{e.type}</span>
                  <span className="text-muted">â†' {e.to}</span>
                </div>
                <span className="text-muted">
                  {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(e.sentAt))}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">{e.subject}</p>
              <p className="mt-1 text-xs text-muted whitespace-pre-wrap">{e.body}</p>
              <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 ${e.status === "sent" ? "bg-success/10 text-success" : "bg-line text-muted"}`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}