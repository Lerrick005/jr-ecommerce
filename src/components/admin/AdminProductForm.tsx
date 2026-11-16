"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [priceKes, setPriceKes] = useState((product.basePriceCents / 100).toString());
  const [desc, setDesc] = useState(product.description || "");
  const [imageUrl, setImageUrl] = useState(product.images[0]?.url || "");
  
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/v1/admin/upload", {
      method: "POST",
      body: formData
    });

    const json = await res.json();
    setUploading(false);

    if (res.ok) {
      setImageUrl(json.data.url);
    } else {
      setMsg(json?.error?.message || "Upload failed");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const res = await fetch(`/api/v1/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: desc,
        basePriceCents: Math.round(parseFloat(priceKes) * 100),
        imageUrl
      })
    });

    setBusy(false);
    if (res.ok) {
      setMsg("Saved successfully!");
      router.refresh();
    } else {
      const json = await res.json();
      setMsg(json?.error?.message || "Failed to save.");
    }
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <div>
        <label className="jr-eyebrow block mb-1">Name</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-line px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="jr-eyebrow block mb-1">Price (KES)</label>
        <input required type="number" step="0.01" value={priceKes} onChange={e => setPriceKes(e.target.value)} className="w-full border border-line px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="jr-eyebrow block mb-1">Description</label>
        <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full border border-line px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="jr-eyebrow block mb-1">Product Image</label>
        
        {/* IMAGE UPLOAD UI */}
        <div className="flex items-start gap-4 mt-2">
          {imageUrl ? (
            <div className="h-32 w-24 bg-line border border-line relative">
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-32 w-24 bg-ivory border border-line flex items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <input 
              type="file" 
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-ivory file:text-espresso hover:file:bg-line"
            />
            <p className="text-[10px] text-muted">
              Upload a photo from your device. {uploading && "Uploading..."}
            </p>
            <div className="pt-1">
              <input 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                placeholder="Or paste an image URL" 
                className="w-full border border-line px-2 py-1 text-xs" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button type="submit" disabled={busy || uploading} className="jr-btn-primary disabled:opacity-50">
          {busy ? "Saving..." : "Save changes"}
        </button>
        {msg && <span className="text-sm text-gold">{msg}</span>}
      </div>
    </form>
  );
}