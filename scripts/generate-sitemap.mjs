import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productSource = await readFile(
  path.join(projectRoot, "src", "data", "products.ts"),
  "utf8",
);
const configuredUrl = process.env.VITE_SITE_URL?.trim();
const siteUrl =
  configuredUrl && /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl.replace(/\/+$/, "")
    : "https://houseofpatani.com";
const seedSection = productSource.slice(
  productSource.indexOf("const seeds:"),
  productSource.indexOf("const categoryOrder:"),
);
const names = [...seedSection.matchAll(/\{\s*name:\s*"([^"]+)"/g)].map(
  (match) => match[1],
);

if (names.length < 50) {
  throw new Error(
    `Expected at least 50 product names while generating the sitemap, found ${names.length}.`,
  );
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const pages = [
  { path: "/" },
  { path: "/shop" },
  { path: "/about" },
  { path: "/contact" },
  { path: "/policies" },
  ...names.map((name) => ({
    path: `/product/${slugify(name)}`,
  })),
];
const uniquePages = [...new Map(pages.map((page) => [page.path, page])).values()];
const urls = uniquePages
  .map(
    ({ path: pagePath }) => `  <url><loc>${escapeXml(`${siteUrl}${pagePath}`)}</loc></url>`,
  )
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
const publicDirectory = path.join(projectRoot, "public");

await mkdir(publicDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(publicDirectory, "robots.txt"), robots, "utf8"),
  writeFile(path.join(publicDirectory, "sitemap.xml"), sitemap, "utf8"),
]);
console.log(`Generated sitemap with ${uniquePages.length} URLs.`);
