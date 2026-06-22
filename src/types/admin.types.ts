export interface StoreSettings {
  address: string;
  codEnabled: boolean;
  email: string;
  facebook: string;
  freeShippingThreshold: number;
  homepageBanner: string;
  homepageBannerPath: string;
  heroSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  heroQuote: string;
  instagram: string;
  logoPath: string;
  logoUrl: string;
  razorpayEnabled: boolean;
  shippingCharge: number;
  storeName: string;
  whatsappNumber: string;
}

export interface CouponInput {
  active: boolean;
  code: string;
  expiresAt: string | null;
  minimumOrderValue: number;
  type: "fixed" | "percentage";
  usageLimit: number | null;
  value: number;
}

