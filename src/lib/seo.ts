import { APP_CONFIG } from "@/constants/config";

export type JsonLd = Record<string, unknown>;

export interface SocialImage {
  height?: number;
  type: string;
  url: string;
  width?: number;
}

const PRODUCT_IMAGE_ORIGIN = "https://drlphuhxfplgctkjoucs.supabase.co";
const PRODUCT_IMAGE_PATH = "/storage/v1/object/public/product-images/";

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

function imageMimeType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

export function productSocialImage(primaryImage?: string): SocialImage {
  const originalImage = absoluteUrl(
    primaryImage || APP_CONFIG.DEFAULT_SOCIAL_IMAGE,
    APP_CONFIG.DEFAULT_SOCIAL_IMAGE,
  );

  try {
    const source = new URL(originalImage);
    const isAllowedProductImage =
      source.origin === PRODUCT_IMAGE_ORIGIN &&
      source.pathname.startsWith(PRODUCT_IMAGE_PATH);

    if (!isAllowedProductImage) {
      return { type: imageMimeType(originalImage), url: originalImage };
    }

    const transformation = new URL("/.netlify/images", APP_CONFIG.SITE_URL);
    transformation.searchParams.set("url", originalImage);
    transformation.searchParams.set("w", "1200");
    transformation.searchParams.set("h", "630");
    transformation.searchParams.set("fit", "contain");
    transformation.searchParams.set("position", "center");
    transformation.searchParams.set("fm", "jpg");
    transformation.searchParams.set("q", "82");

    return {
      height: 630,
      type: "image/jpeg",
      url: transformation.href,
      width: 1200,
    };
  } catch {
    return {
      type: imageMimeType(absoluteUrl(APP_CONFIG.DEFAULT_SOCIAL_IMAGE)),
      url: absoluteUrl(APP_CONFIG.DEFAULT_SOCIAL_IMAGE),
    };
  }
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
