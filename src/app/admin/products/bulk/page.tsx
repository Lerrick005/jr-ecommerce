"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type UploadedFile = {
  originalName: string;
  url: string;
  assignedProductId: string;
};

export default function BulkUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch products for the dropdown
  useEffect(() => {
    fetch("/api/v1/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data || []));
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]!);
    }

    const res = await fetch("/api/v1/admin/bulk-upload", { method: "POST", body: formData });
    const json = await res.json();
    setUploading(false);

    if (res.ok) {
      const newFiles = json.data.map((f: any) => ({ ...f, assignedProductId: "" }));
      setFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Uploaded ${json.data.length} images.`);
    } else {
      toast.error("Upload failed.");
    }
  }

  async function saveAll() {
    setSaving(true);
    let success = 0;
    
    for (const file of files) {
      if (!file.assignedProductId) continue;
      
      const res = await fetch(`/api/v1/admin/products/${file.assignedProductId}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file.url })
      });
      if (res.ok) success++;
    }

    setSaving(false);
    toast.success(`Updated ${success} products.`);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="jr-heading-lg">Bulk Image Upload</h1>
          <p className="text-sm text-muted mt-1">Upload multiple photos, then assign them to products.</p>
        </div>
        <Link href="/admin/products" className="jr-btn-outline">Back to Products</Link>
      </div>

      <div className="border-2 border-dashed border-line bg-surface rounded-lg p-10 text-center mb-8">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="bulk-file-input"
        />
        <label htmlFor="bulk-file-input" className="cursor-pointer flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold mb-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="text-sm font-semibold text-espresso hover:text-gold transition-colors">
            {uploading ? "Uploading..." : "Click to select multiple images"}
          </span>
          <span className="text-xs text-muted mt-1">JPG, PNG or WEBP. Max 10MB each.</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2">Uploaded Images</h2>
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-4 border border-line p-3 bg-white">
              <img src={file.url} alt="upload" className="w-16 h-20 object-cover border border-line" />
              <div className="flex-1">
                <p className="text-xs text-muted mb-1 truncate">{file.originalName}</p>
                <select
                  value={file.assignedProductId}
                  onChange={(e) => {
                    const newFiles = [...files];
                    newFiles[i]!.assignedProductId = e.target.value;
                    setFiles(newFiles);
                  }}
                  className="w-full border border-line px-3 py-2 text-sm"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          
          <button
            onClick={saveAll}
            disabled={saving || !files.some(f => f.assignedProductId)}
            className="jr-btn-primary w-full py-4 mt-4 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All Assignments"}
          </button>
        </div>
      )}
    </div>
  );
}