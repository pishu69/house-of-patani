# SEO content audit

## Current strengths

- The homepage has one H1, crawlable category cards, product links, descriptive section headings, and visible brand/story content.
- Shop product images and names are real links. Product breadcrumbs link Home, Shop, the selected category filter, and the product, matching BreadcrumbList schema.
- The About page contains substantial Patani and Koch Rajbanshi context and now closes with a descriptive Shop link.
- Product media uses standard responsive images with stable URLs; the hero is eagerly loaded and below-fold imagery is lazy loaded.

## Manual content priorities

- Review all live Supabase products before indexing. The local seed catalog contains polished names, but many descriptions remain broad retail copy rather than verified, product-specific cultural or material information.
- Clothing and Books deserve the first editorial pass because they are closest to the Patani and Koch Rajbanshi search themes. Add verified materials, authors, languages, subjects, ISBNs, and editions only where known.
- Category introductions are now unique in local configuration. Confirm the same categories are active and non-empty in Supabase before indexing them.
- No obviously weak seed names such as “Book 1”, “Yellow Cloth”, or “Traditional Item” were found. Continue flagging similarly generic names during admin entry.
- Do not generate filler for empty categories. Empty category filters retain the general Shop metadata.

## Data recommendations (not added)

- Optional `seo_title`, `seo_description`, and `short_description` product fields would improve editorial control.
- Book-specific author, language, subject, ISBN, edition, and publisher fields would make Book schema safe and useful.
- Per-image view/type metadata would allow accurate “front view”, “side view”, and “detail view” alt text.
