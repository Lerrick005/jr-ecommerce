import { shopConfig } from "@config";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="jr-container py-16 max-w-2xl">
      <p className="jr-eyebrow text-gold">Get in touch</p>
      <h1 className="jr-heading-xl mt-3">We'd love to hear from you</h1>
      <p className="mt-4 text-sm text-muted">
        Questions about a product, an order, or anything else? Reach us through any channel below.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href={`tel:${shopConfig.contact.phone}`} className="block border border-line bg-surface p-6 hover:border-gold transition-colors">
          <p className="jr-eyebrow">Phone</p>
          <p className="mt-2 text-sm">{shopConfig.contact.phone}</p>
          <p className="mt-1 text-xs text-muted">Monâ€"Sat Â· 9amâ€"6pm</p>
        </a>
        <a href={`https://wa.me/${shopConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener" className="block border border-line bg-surface p-6 hover:border-gold transition-colors">
          <p className="jr-eyebrow">WhatsApp</p>
          <p className="mt-2 text-sm">{shopConfig.contact.whatsapp}</p>
          <p className="mt-1 text-xs text-muted">Fastest response Â· 24/7</p>
        </a>
        <a href={`mailto:${shopConfig.contact.email}`} className="block border border-line bg-surface p-6 hover:border-gold transition-colors">
          <p className="jr-eyebrow">Email</p>
          <p className="mt-2 text-sm">{shopConfig.contact.email}</p>
          <p className="mt-1 text-xs text-muted">Replies within 24 hours</p>
        </a>
        <div className="block border border-line bg-surface p-6">
          <p className="jr-eyebrow">Visit</p>
          <p className="mt-2 text-sm">{shopConfig.location.pickupPoint}</p>
          <p className="mt-1 text-xs text-muted">Pickup by appointment</p>
        </div>
      </div>
    </div>
  );
}