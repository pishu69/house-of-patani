import { APP_CONFIG } from "@/constants/config";

export type JsonLd = Record<string, unknown>;

interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

export function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

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
