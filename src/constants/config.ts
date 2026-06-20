const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export const APP_CONFIG = {
  CONTACT_EMAIL: "care@houseofpatani.com",
  DESCRIPTION:
    "Discover Indian craft, handwoven textiles, jewelry, home accents, and keepsakes selected with a quiet sense of heritage.",
  NAME: "House of Patani",
  SITE_URL:
    configuredSiteUrl && /^https?:\/\//i.test(configuredSiteUrl)
      ? configuredSiteUrl.replace(/\/+$/, "")
      : "https://houseofpatani.com",
  TAGLINE: "Tradition Woven with Heritage",
} as const;
