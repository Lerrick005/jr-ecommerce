import { shopConfig } from "@config";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Legal</p>
      <h1 className="jr-heading-xl mt-3">Terms & Conditions</h1>
      <p className="mt-2 text-xs text-muted">Last updated: {new Date().toLocaleDateString("en-KE")}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-espresso/90">
        <section>
          <h2 className="jr-heading-lg text-lg">Use of this website</h2>
          <p className="mt-2 text-muted">
            By shopping with {shopConfig.brand.name}, you agree to these terms. You must be at least 18
            years old to place an order.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Orders & payment</h2>
          <p className="mt-2 text-muted">
            All orders are subject to availability. Payment is required before dispatch. We accept M-Pesa,
            card, and cash on delivery (within select zones).
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Pricing</h2>
          <p className="mt-2 text-muted">
            All prices are in Kenyan Shillings (KSh) and include VAT. We reserve the right to change prices
            at any time, but changes do not affect orders already placed.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Returns</h2>
          <p className="mt-2 text-muted">
            See our <a href="/returns" className="underline hover:text-gold">Returns & Exchanges</a> page
            for full details. {shopConfig.policies.returnsWindowDays}-day window from delivery.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Contact</h2>
          <p className="mt-2 text-muted">
            For any questions about these terms, email {shopConfig.contact.email}.
          </p>
        </section>
      </div>
    </div>
  );
}