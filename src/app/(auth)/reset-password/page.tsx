"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json?.error?.message ?? "Reset failed");
      return;
    }
    router.push("/login");
  }

  if (!token) {
    return (
      <div>
        <h1 className="jr-heading-lg mb-4">Reset password</h1>
        <p className="text-sm text-sale">Missing reset token. Open the link from your email.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="jr-heading-lg mb-6">Set new password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="jr-eyebrow mb-1 block" htmlFor="password">New password (min 10 chars)</label>
          <input id="password" type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </div>
        {error && <p className="text-sm text-sale">{error}</p>}
        <button type="submit" disabled={loading} className="jr-btn-primary w-full">
          {loading ? "Saving..." : "Set password"}
        </button>
      </form>
    </div>
  );
}