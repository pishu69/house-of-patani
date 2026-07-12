import { APP_CONFIG } from "@/constants/config";

export type JsonLd = Record<string, unknown>;

interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

export function absoluteUrl(pathOrUrl: string, fallback = APP_CONFIG.DEFAULT_SOCIAL_IMAGE) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const url = new URL(pathOrUrl);
      if (url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) return url.href;
    } catch { /* Use the public fallback. */ }
    return absoluteUrl(fallback);
  }

  if (/^(blob:|data:)/i.test(pathOrUrl)) return absoluteUrl(fallback);

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${APP_CONFIG.SITE_URL}${normalizedPath}`;
}

export function createBreadcrumbSchema(
  items: BreadcrumbSchemaItem[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export const organizationSchema: JsonLd = {
  "@context": "https://schema.org",
  "@id": `${APP_CONFIG.SITE_URL}/#organization`,
  "@type": "Organization",
  description: APP_CONFIG.DESCRIPTION,
  email: APP_CONFIG.CONTACT_EMAIL,
  logo: absoluteUrl("/favicon.svg"),
  name: APP_CONFIG.NAME,
  telephone: "+91 8290366530",
  url: APP_CONFIG.SITE_URL,
};

export const websiteSchema: JsonLd = {
  "@context": "https://schema.org",
  "@id": `${APP_CONFIG.SITE_URL}/#website`,
  "@type": "WebSite",
  description: APP_CONFIG.DESCRIPTION,
  name: APP_CONFIG.NAME,
  potentialAction: {
    "@type": "SearchAction",
    "query-input": "required name=search_term_string",
    target: `${absoluteUrl("/shop")}?q={search_term_string}`,
  },
  publisher: {
    "@id": `${APP_CONFIG.SITE_URL}/#organization`,
  },
  url: APP_CONFIG.SITE_URL,
};
