import { shopConfig } from "@config";

export const metadata = { title: "Returns & Exchanges" };

export default function ReturnsPage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Returns</p>
      <h1 className="jr-heading-xl mt-3">Returns & exchanges</h1>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="jr-heading-lg text-lg">{shopConfig.policies.returnsWindowDays}-day return window</h2>
          <p className="mt-2 text-muted">
            If you&apos;re not completely satisfied with your purchase, you can return it within{" "}
            {shopConfig.policies.returnsWindowDays} days of delivery for a full refund or exchange. Items
            must be unused, unworn, and in their original packaging with tags attached.
          </p>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">How to return</h2>
          <ol className="mt-2 space-y-2 text-muted list-decimal list-inside">
            <li>Sign in and go to <strong className="text-espresso">Account â†' Orders</strong></li>
            <li>Open the order and click <strong className="text-espresso">Request return</strong></li>
            <li>Choose the item(s) and reason</li>
            <li>We&apos;ll arrange pickup or you can drop off at our Nairobi office</li>
          </ol>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Refunds</h2>
          <p className="mt-2 text-muted">
            Once we receive and inspect your return, we&apos;ll process your refund within 3â€"5 business days.
            Refunds are sent back to your original payment method (M-Pesa, card, or cash).
          </p>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Exceptions</h2>
          <p className="mt-2 text-muted">
            For hygiene reasons, we cannot accept returns on beauty products, underwear, or earrings unless
            they are faulty. Clearance items are final sale.
          </p>
        </div>
      </div>
    </div>
  );
}