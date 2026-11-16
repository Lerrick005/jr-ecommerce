"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminStatusForm({
  orderNumber,
  allowedNext
}: {
  orderNumber: string;
  allowedNext: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(allowedNext[0] ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/v1/admin/orders/${orderNumber}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json?.error?.message ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border border-line bg-ivory px-3 py-2 text-sm"
      >
        {allowedNext.map((s) => (
          <option key={s} value={s}>{s.replace("_", " ")}</option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note"
        className="w-full border border-line bg-ivory px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="jr-btn-primary w-full disabled:opacity-50"
      >
        {busy ? "Updating..." : "Update status"}
      </button>
      {error && <p className="text-xs text-sale">{error}</p>}
    </div>
  );
}