import { useEffect } from "react";
import { APP_CONFIG } from "@/constants/config";
import { absoluteUrl, type JsonLd } from "@/lib/seo";

const EMPTY_SCHEMAS: JsonLd[] = [];

interface SeoProps {
  canonicalPath: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageHeight?: number;
  imageType?: string;
  imageWidth?: number;
  jsonLd?: JsonLd[];
  noIndex?: boolean;
  title: string;
  type?: "website" | "product";
  price?: number;
}

function setMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.content = content;
}

function setCanonical(href: string) {
  let element =
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }

  element.href = href;
}

function removeMeta(attribute: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function serializeJsonLd(value: JsonLd) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function inferImageMimeType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

export function Seo({
  canonicalPath,
  description,
  image = APP_CONFIG.DEFAULT_SOCIAL_IMAGE,
  imageAlt = `${APP_CONFIG.NAME} heritage craft`,
  imageHeight,
  imageType,
  imageWidth,
  jsonLd = EMPTY_SCHEMAS,
  noIndex = false,
  title,
  type = "website",
  price,
}: SeoProps) {
  useEffect(() => {
    const resolvedTitle = title.includes(APP_CONFIG.NAME)
      ? title
      : `${title} | ${APP_CONFIG.NAME}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = absoluteUrl(image, APP_CONFIG.DEFAULT_SOCIAL_IMAGE);

    document.title = resolvedTitle;
    document.documentElement.lang = "en-IN";

    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noIndex ? "noindex, follow" : "index, follow, max-image-preview:large",
    );
    setMeta("property", "og:locale", APP_CONFIG.LOCALE);
    setMeta("property", "og:site_name", APP_CONFIG.NAME);
    setMeta("property", "og:title", resolvedTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", imageUrl);
setMeta("property", "og:image:secure_url", imageUrl);
setMeta("property", "og:image:type", imageType ?? inferImageMimeType(imageUrl));
setMeta("property", "og:image:alt", imageAlt);
if (imageWidth && imageHeight) {
  setMeta("property", "og:image:width", String(imageWidth));
  setMeta("property", "og:image:height", String(imageHeight));
} else if (type === "website" && image === APP_CONFIG.DEFAULT_SOCIAL_IMAGE) {
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
} else {
  removeMeta("property", "og:image:width");
  removeMeta("property", "og:image:height");
}
    if (type === "product" && typeof price === "number") {
      setMeta("property", "product:price:amount", String(price));
      setMeta("property", "product:price:currency", "INR");
    } else {
      removeMeta("property", "product:price:amount");
      removeMeta("property", "product:price:currency");
    }
    setMeta("name", "twitter:card", APP_CONFIG.TWITTER_CARD_TYPE);
    setMeta("name", "twitter:title", resolvedTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    setCanonical(canonicalUrl);

    document.head
      .querySelectorAll('script[data-house-of-patani-schema="true"]')
      .forEach((element) => element.remove());

    jsonLd.forEach((schema) => {
      const script = document.createElement("script");
      script.dataset.houseOfPataniSchema = "true";
      script.type = "application/ld+json";
      script.text = serializeJsonLd(schema);
      document.head.append(script);
    });
  }, [
    canonicalPath,
    description,
    image,
    imageAlt,
    imageHeight,
    imageType,
    imageWidth,
    jsonLd,
    noIndex,
    price,
    title,
    type,
  ]);

  return null;
}
