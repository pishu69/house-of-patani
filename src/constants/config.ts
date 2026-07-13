const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export const APP_CONFIG = {
  CONTACT_EMAIL: "hello@houseofpatani.com",
  DESCRIPTION:
    "Discover Koch Rajbanshi traditional clothing, Patani, books, handicrafts, home décor, and heritage-inspired products from House of Patani.",
  DEFAULT_SOCIAL_IMAGE: "/images/social/home-share-v1.jpg",
  DEFAULT_TITLE: "House of Patani | Koch Rajbanshi Heritage, Patani, Books & Handicrafts",
  ENABLE_PHONE_OTP_LOGIN: false,
  NAME: "House of Patani",
  LOCALE: "en_IN",
  PRODUCTION_SITE_URL: "https://houseofpatani.com",
  SITE_URL:
    configuredSiteUrl && /^https?:\/\//i.test(configuredSiteUrl)
      ? configuredSiteUrl.replace(/\/+$/, "")
      : "https://houseofpatani.com",
  TAGLINE: "Tradition Woven with Heritage",
  TWITTER_CARD_TYPE: "summary_large_image",
} as const;
