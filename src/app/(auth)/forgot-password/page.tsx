"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setLoading(false);
    setDone(true);
  }

  return (
    <div>
      <h1 className="jr-heading-lg mb-6">Reset password</h1>
      {done ? (
        <p className="text-sm">
          If that email exists, a reset link has been sent. Check the server console in dev.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="jr-eyebrow mb-1 block" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          </div>
          <button type="submit" disabled={loading} className="jr-btn-primary w-full">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}