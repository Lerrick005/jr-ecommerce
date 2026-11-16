"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function WriteReviewForm({
  productId,
  existingReview
}: {
  productId: string;
  existingReview?: { rating: number; title: string | null; body: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/v1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(json?.error?.message ?? "Could not submit review");
      return;
    }
    toast.success("Review submitted. Thank you!");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="jr-btn-outline text-xs"
      >
        {existingReview ? "Edit your review" : "Write a review"}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line bg-surface p-4 mt-3 space-y-3">
      <div>
        <p className="jr-eyebrow mb-1">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="text-2xl"
              aria-label={`${n} star`}
            >
              <span className={n <= rating ? "text-amber" : "text-line"}>â˜...</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="jr-eyebrow block mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Beautiful quality!"
          className="w-full border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="jr-eyebrow block mb-1">Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What did you like or dislike?"
          className="w-full border border-line px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="jr-btn-primary disabled:opacity-50">
          {busy ? "Submitting..." : "Submit review"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="jr-btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}