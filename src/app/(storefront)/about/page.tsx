import { shopConfig } from "@config";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="jr-container py-16 max-w-3xl">
      <p className="jr-eyebrow text-gold">Our story</p>
      <h1 className="jr-heading-xl mt-3">Made for a life well-lived</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-espresso/90">
        <p>
          {shopConfig.brand.name} was founded on a simple idea: that Kenyans deserve access to beautiful,
          well-made products without the markup or the wait. We curate every piece in our catalogue personally,
          choosing items that are built to last, honest in price, and worth keeping.
        </p>
        <p>
          From apparel and accessories to home goods and electronics, every order is fulfilled from our Nairobi
          warehouse and delivered anywhere in Kenya within 2â€"5 business days. Pay with M-Pesa, card, or cash on
          delivery â€" whatever works for you.
        </p>
        <p>
          We believe in doing business the right way. Our prices are transparent. Our return window is generous.
          Our customer service is real humans who reply within hours, not days.
        </p>
        <p>
          Thank you for choosing {shopConfig.brand.name}. We're glad you're here.
        </p>
      </div>
    </div>
  );
}