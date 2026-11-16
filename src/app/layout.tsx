import type { Metadata, Viewport } from "next";
import { shopConfig } from "@config";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: shopConfig.brand.name + " - Kenyan Ecommerce",
    template: "%s | " + shopConfig.brand.name
  },
  description: shopConfig.brand.tagline,
  openGraph: { type: "website", siteName: shopConfig.brand.name, locale: "en_KE" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: shopConfig.colours.ivory,
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-center" theme="light" />
      </body>
    </html>
  );
}