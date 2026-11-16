/**
 * J&R Ecommerce â€” central brand & business configuration.
 */
export const shopConfig = {
  brand: {
    name: "J&R Ecommerce",
    tagline: "Curated essentials for modern Kenyan living.",
    focus: "MIXED" as const,
    style: "Contemporary",
    logo: { light: "/images/logo-light.svg", dark: "/images/logo-dark.svg" },
    model: "single-vendor" as const
  },

  layout: {
    productGrid: { mobileColumns: 2, tabletColumns: 3, desktopColumns: 4 },
    showDiscountBadges: true,
    showStarRatings: true,
    showCategoryStrip: true,
    showFlashDealsRow: true
  },

  colours: {
    ivory:    "#FFFFFF",
    surface:  "#FAFAFA",
    espresso: "#2B1A10",
    muted:    "#7A6353",
    line:     "#E5E5E5",
    gold:     { DEFAULT: "#C45A3B", hover: "#A8492E" },
    sale:     "#D32F2F",
    success:  "#2E7D32",
    amber:    "#F5A623",
    ink:      "#1A120B"
  },

  fonts: { display: "Georgia, serif", sans: "system-ui, sans-serif" },

  location: {
    city: "Nairobi, Kenya",
    pickupPoint: "Westlands, Nairobi",
    deliveryCounties: ["Nairobi", "Kiambu", "Machakos", "Kajiado"]
  },

  contact: {
    phone: "+254140450296",
    whatsapp: "+254140450296",
    email: "hello@jrecommerce.ke",
    instagram: "@jr_ecommerce",
    tiktok: "@jr_ecommerce"
  },

  payments: {
    mpesa:  { paybill: "Coming Soon", till: "Coming Soon" },
    card:   "NONE" as "NONE" | "PESAPAL" | "FLUTTERWAVE" | "PAYSTACK",
    cashOnDelivery: true
  },

  policies: {
    returnsWindowDays: 14,
    deliveryTimes: "1â€“2 days Nairobi Â· 2â€“5 days countrywide",
    fittingAndAlterations: "Contact us for alterations"
  },

  currency: {
    code: "KES" as const,
    locale: "en-KE",
    vatPercent: 16,
    pricesIncludeVat: true
  },

  featureFlags: {
    loyalty: false,
    giftCards: false,
    drops: false,
    preOrders: false,
    alterations: false,
    cashOnDelivery: true,
    dataSaverMode: true,
    pwa: true,
    marketplace: false
  },

  social: { enableInstagramLink: false }
} as const;

export type ShopConfig = typeof shopConfig;