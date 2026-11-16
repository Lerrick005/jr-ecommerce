import { prisma } from "@/lib/db";
import { AdminContentForm } from "@/components/admin/AdminContentForm";

export default async function AdminContentPage() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, any> = {};
  settings.forEach((s) => { map[s.key] = s.valueJson; });

  const defaults = {
    announcementBar: "Complimentary delivery on orders over KSh 5,000 | M-Pesa | Card | Cash on delivery",
    heroHeadline: "Quiet essentials, delivered nationwide.",
    heroSubheadline: "A considered selection of apparel, shoes, bags and home goods - curated for life in Kenya.",
    newsletterCopy: "Sign up for occasional emails about new arrivals and offers. No spam, ever."
  };

  return (
    <div>
      <h1 className="jr-heading-lg">Content</h1>
      <p className="mt-1 text-sm text-muted">Edit the copy that appears across the storefront.</p>
      <div className="mt-6 max-w-2xl">
        <AdminContentForm initial={defaults} settings={map} />
      </div>
    </div>
  );
}