"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatKes, computeTotals } from "@/lib/money";

type Zone = {
  id: string;
  name: string;
  counties: string[];
  baseFeeCents: number;
  freeAboveCents: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

type Props = {
  zones: Zone[];
  defaultEmail: string;
  defaultName: string;
};

const COUNTIES = [
  "Nairobi", "Kiambu", "Machakos", "Kajiado", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu",
  "Nyeri", "Meru", "Kakamega", "Bungoma", "Kilifi", "Kisii", "Narok", "Laikipia",
  "Murang'a", "Embu", "Kitui", "Bomet", "Kericho", "Trans Nzoia", "Busia", "Siaya"
];

export function CheckoutFlow({ zones, defaultEmail, defaultName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [town, setTown] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => `co_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

  const zone = zones.find((z) => z.id === zoneId);

  async function submitPayment() {
    setBusy(true);
    setError(null);

    // 1. Create order
    const orderRes = await fetch("/api/v1/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        address: { fullName, phone, county, town, area, landmark, deliveryNotes: notes },
        deliveryZoneId: zoneId,
        paymentMethod: "MPESA",
        mpesaPhone,
        idempotencyKey
      })
    });
    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      setBusy(false);
      setError(orderJson?.error?.message ?? "Could not create order");
      return;
    }
    const orderNumber = orderJson.data.orderNumber;

    // 2. Initiate M-Pesa
    const initRes = await fetch("/api/v1/payments/mpesa/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone: mpesaPhone })
    });
    const initJson = await initRes.json();
    if (!initRes.ok) {
      setBusy(false);
      setError(initJson?.error?.message ?? "M-Pesa prompt failed");
      return;
    }

    // 3. Mock mode: simulate callback after 2s, then go to success
    if (initJson.data.mode === "mock") {
      setTimeout(async () => {
        await fetch("/api/v1/payments/mpesa/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mock: true, checkoutRequestId: initJson.data.checkoutRequestId, success: true })
        });
        router.push(`/checkout/success?order=${orderNumber}`);
      }, 1500);
      return;
    }

    // Live mode: go to "waiting for phone" state
    router.push(`/checkout/success?order=${orderNumber}&pending=1`);
  }

  const totals = computeTotals({
    subtotalCents: 0,
    deliveryFeeCents: zone?.baseFeeCents ?? 0,
    vatPercent: 16,
    pricesIncludeVat: true
  });

  return (
    <div className="jr-container py-8">
      <h1 className="jr-heading-lg">Checkout</h1>
      <p className="mt-1 text-sm text-muted">Step {step} of 3</p>

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {step === 1 && (
            <section className="space-y-4">
              <h2 className="jr-heading-lg">Contact & delivery</h2>
              <div>
                <label className="jr-eyebrow mb-1 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Phone (+254...)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254712345678" required className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">County</label>
                <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none">
                  {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Town / area</label>
                <input value={town} onChange={(e) => setTown(e.target.value)} required className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Specific area (optional)</label>
                <input value={area} onChange={(e) => setArea(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Landmark (optional)</label>
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="jr-eyebrow mb-1 block">Delivery notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-line bg-surface px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <button type="button" onClick={() => setStep(2)} disabled={!email || !fullName || !phone || !town} className="jr-btn-primary w-full disabled:opacity-50">Continue</button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-3">
              <h2 className="jr-heading-lg">Delivery method</h2>
              {zones.map((z) => (
                <label key={z.id} className={"flex items-start gap-3 border p-3 cursor-pointer " + (z.id === zoneId ? "border-espresso bg-surface" : "border-line")}>
                  <input type="radio" name="zone" checked={z.id === zoneId} onChange={() => setZoneId(z.id)} className="mt-1" />
                  <div>
                    <p className="text-sm font-medium">{z.name}</p>
                    <p className="text-xs text-muted">
                      {z.counties.includes("*") ? "Countrywide" : z.counties.join(", ")} Â· {z.estimatedDaysMin}â€"{z.estimatedDaysMax} days
                    </p>
                    <p className="text-sm font-semibold">{formatKes(z.baseFeeCents)}</p>
                  </div>
                </label>
              ))}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="jr-btn-outline">Back</button>
                <button type="button" onClick={() => setStep(3)} className="jr-btn-primary flex-1">Continue</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-3">
              <h2 className="jr-heading-lg">Payment</h2>
              <div className="border border-line bg-surface p-4">
                <p className="jr-eyebrow mb-1">M-Pesa</p>
                <p className="text-xs text-muted mb-3">Enter the M-Pesa number to receive the STK Push prompt.</p>
                <input
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="+254712345678"
                  className="w-full border border-line bg-ivory px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-sale">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="jr-btn-outline">Back</button>
                <button type="button" onClick={submitPayment} disabled={busy || !mpesaPhone} className="jr-btn-primary flex-1 disabled:opacity-50">
                  {busy ? "Processing..." : "Place order & pay"}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="border border-line bg-surface p-4 h-fit">
          <p className="jr-eyebrow">Summary</p>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted">Items</span><span>(see cart)</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatKes(totals.deliveryFeeCents)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}