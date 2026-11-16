"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function strength(pw: string): { score: number; label: string; colour: string } {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Weak", colour: "#9B2C2C" };
  if (s <= 3) return { score: 2, label: "Fair", colour: "#B8935A" };
  return { score: 3, label: "Strong", colour: "#2F6B4F" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const pw = strength(form.password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(json?.error?.message ?? "Registration failed");
      return;
    }
    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false
    });
    setLoading(false);
    if (login?.error) {
      setError("Account created, but sign-in failed. Please try signing in.");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div>
      <h1 className="jr-heading-lg mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="jr-eyebrow mb-1 block" htmlFor="name">Full name</label>
          <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="jr-eyebrow mb-1 block" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="jr-eyebrow mb-1 block" htmlFor="phone">Phone (+254...)</label>
          <input id="phone" required placeholder="+254712345678" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="jr-eyebrow mb-1 block" htmlFor="password">Password (min 10 chars)</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={10}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full border border-line bg-surface px-3 py-2 pr-10 text-sm focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-espresso"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 flex-1 bg-line">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(pw.score / 3) * 100}%`,
                    backgroundColor: pw.colour
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: pw.colour }}>{pw.label}</span>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-sale">{error}</p>}
        <button type="submit" disabled={loading} className="jr-btn-primary w-full">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link href="/login" className="jr-link">Sign in</Link>
      </p>
    </div>
  );
}