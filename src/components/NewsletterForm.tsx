"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Thanks! You're subscribed.");
        setEmail("");
      } else {
        const json = await res.json();
        setStatus("error");
        setMessage(json?.error?.message ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          disabled={status === "loading" || status === "success"}
          className="flex-1 border border-line bg-surface px-4 py-3 text-sm text-espresso placeholder:text-muted/50 focus:border-gold focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="jr-btn-primary disabled:opacity-60 min-w-[100px]"
        >
          {status === "loading" ? "..." : status === "success" ? "Done" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-xs font-medium ${status === "error" ? "text-sale" : "text-success"}`}>
          {message}
        </p>
      )}
    </form>
  );
}