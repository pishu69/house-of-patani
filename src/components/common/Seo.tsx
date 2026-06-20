import { useEffect } from "react";
import { APP_CONFIG } from "@/constants/config";
import { absoluteUrl, type JsonLd } from "@/lib/seo";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&h=630&q=88";
const EMPTY_SCHEMAS: JsonLd[] = [];

interface SeoProps {
  canonicalPath: string;
  description: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: JsonLd[];
  noIndex?: boolean;
  title: string;
  type?: "website" | "product";
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

function serializeJsonLd(value: JsonLd) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function Seo({
  canonicalPath,
  description,
  image = DEFAULT_IMAGE,
  imageAlt = `${APP_CONFIG.NAME} heritage craft`,
  jsonLd = EMPTY_SCHEMAS,
  noIndex = false,
  title,
  type = "website",
}: SeoProps) {
  useEffect(() => {
    const resolvedTitle = title.includes(APP_CONFIG.NAME)
      ? title
      : `${title} | ${APP_CONFIG.NAME}`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = absoluteUrl(image);

    document.title = resolvedTitle;
    document.documentElement.lang = "en-IN";

    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );
    setMeta("property", "og:locale", "en_IN");
    setMeta("property", "og:site_name", APP_CONFIG.NAME);
    setMeta("property", "og:title", resolvedTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", imageAlt);
    setMeta("name", "twitter:card", "summary_large_image");
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
    jsonLd,
    noIndex,
    title,
    type,
  ]);

  return null;
}
