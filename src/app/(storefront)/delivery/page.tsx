import { shopConfig } from "@config";

export const metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Delivery</p>
      <h1 className="jr-heading-xl mt-3">How we deliver</h1>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="jr-heading-lg text-lg">Delivery times</h2>
          <p className="mt-2 text-muted">{shopConfig.policies.deliveryTimes}</p>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Delivery fees</h2>
          <ul className="mt-2 space-y-2 text-muted">
            <li>Â· Orders over KSh 5,000 â€" <strong className="text-espresso">Free delivery</strong></li>
            <li>Â· Nairobi Metro â€" KSh 300</li>
            <li>Â· Countrywide courier â€" KSh 500</li>
          </ul>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Areas we cover</h2>
          <p className="mt-2 text-muted">
            We deliver to all major towns and cities across Kenya, including Nairobi, Mombasa, Kisumu, Nakuru,
            Eldoret, Nyeri, Meru, and more. If your town isn&apos;t listed, contact us and we&apos;ll arrange a
            custom delivery.
          </p>
        </div>

        <div>
          <h2 className="jr-heading-lg text-lg">Tracking your order</h2>
          <p className="mt-2 text-muted">
            Once your order ships, you&apos;ll receive a confirmation via email and SMS with tracking details.
            You can also view the status anytime by signing in and visiting{" "}
            <span className="text-espresso">Account â†' Orders</span>.
          </p>
        </div>
      </div>
    </div>
  );
}