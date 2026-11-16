import { shopConfig } from "@config";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Legal</p>
      <h1 className="jr-heading-xl mt-3">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted">Last updated: {new Date().toLocaleDateString("en-KE")}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-espresso/90">
        <section>
          <h2 className="jr-heading-lg text-lg">What we collect</h2>
          <p className="mt-2 text-muted">
            When you register, order, or contact us, we collect: your name, email, phone number, delivery
            address, and order history. We do not store payment card numbers on our servers.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Why we collect it</h2>
          <p className="mt-2 text-muted">
            To process your order, arrange delivery, provide customer support, and (if you opt in) send
            you marketing emails about new arrivals and offers.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Your rights</h2>
          <p className="mt-2 text-muted">
            Under the Kenya Data Protection Act (2019), you have the right to access, correct, or delete
            your personal data at any time. Email {shopConfig.contact.email} to exercise any of these rights.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Who we share with</h2>
          <p className="mt-2 text-muted">
            We share only the information necessary to complete your order: your delivery details go to
            our courier partners, and your phone number goes to M-Pesa to process payment.
          </p>
        </section>

        <section>
          <h2 className="jr-heading-lg text-lg">Contact</h2>
          <p className="mt-2 text-muted">
            {shopConfig.contact.email} Â· {shopConfig.contact.phone}
          </p>
        </section>
      </div>
    </div>
  );
}