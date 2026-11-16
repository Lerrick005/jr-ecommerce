"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Content = {
  announcementBar: string;
  heroHeadline: string;
  heroSubheadline: string;
  newsletterCopy: string;
};

export function AdminContentForm({
  initial,
  settings
}: {
  initial: Content;
  settings: Record<string, any>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Content>({
    announcementBar: settings.announcementBar?.text ?? initial.announcementBar,
    heroHeadline: settings.heroHeadline?.text ?? initial.heroHeadline,
    heroSubheadline: settings.heroSubheadline?.text ?? initial.heroSubheadline,
    newsletterCopy: settings.newsletterCopy?.text ?? initial.newsletterCopy
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof Content>(k: K, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, { text: v }])
    );
    const res = await fetch("/api/v1/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Saved. Refresh the shop to see changes.");
      router.refresh();
    } else {
      const json = await res.json();
      setMsg(json?.error?.message ?? "Save failed");
    }
  }

  const fields: Array<{ key: keyof Content; label: string; multiline?: boolean }> = [
    { key: "announcementBar", label: "Announcement bar (top of site)" },
    { key: "heroHeadline", label: "Hero headline" },
    { key: "heroSubheadline", label: "Hero subheadline", multiline: true },
    { key: "newsletterCopy", label: "Newsletter section copy", multiline: true }
  ];

  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="jr-eyebrow block mb-1">{f.label}</label>
          {f.multiline ? (
            <textarea
              rows={3}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
          ) : (
            <input
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
          )}
        </div>
      ))}
      <div className="pt-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="jr-btn-primary disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
        {msg && <p className="mt-3 text-xs text-gold">{msg}</p>}
      </div>
    </div>
  );
}