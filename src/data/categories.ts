import type { ProductCategory } from "@/types/product.types";

export interface ShopCategory {
  description: string;
  imagePath: string | null;
  imageUrl: string;
  name: string;
  seoDescription?: string;
  seoTitle?: string;
  slug: ProductCategory;
}

export const shopCategories: ShopCategory[] = [
  {
    description: "Handwoven silhouettes shaped by Indian textile traditions.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=82",
    name: "Clothing",
    seoDescription: "Explore traditional Patani and heritage-inspired attire connected with the clothing traditions of the Koch Rajbanshi community.",
    seoTitle: "Traditional Koch Rajbanshi Patani & Clothing | House of Patani",
    slug: "clothing",
  },
  {
    description: "Quiet statement pieces in silver, brass, and stone.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=82",
    name: "Jewelry",
    seoDescription: "Browse jewellery and culturally inspired accessories selected for the House of Patani collection.",
    seoTitle: "Heritage-Inspired Jewellery | House of Patani",
    slug: "jewelry",
  },
  {
    description: "Objects made slowly through carving, casting, and weaving.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=82",
    name: "Handicrafts",
    seoDescription: "Explore handicrafts, artwork, and decorative objects selected for a collection inspired by Koch Rajbanshi culture and regional craft.",
    seoTitle: "Koch Rajbanshi Handicrafts & Heritage Décor | House of Patani",
    slug: "handicrafts",
  },
  {
    description: "Warm, considered accents for rooms with a sense of memory.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1602872030490-4a484a7b3ba6?auto=format&fit=crop&w=1000&q=82",
    name: "Home Decor",
    seoDescription: "Discover considered home décor and heritage-inspired objects from the House of Patani collection.",
    seoTitle: "Heritage-Inspired Home Décor | House of Patani",
    slug: "home-decor",
  },
  {
    description: "Art, culture, food, and craft stories worth keeping close.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1000&q=82",
    name: "Books",
    seoDescription: "Discover available books connected with history, literature, identity, art, and cultural heritage.",
    seoTitle: "Koch Rajbanshi Books, History & Literature | House of Patani",
    slug: "books",
  },
  {
    description: "Finishing pieces with material depth and everyday ease.",
    imagePath: null,
    imageUrl:
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=1000&q=82",
    name: "Accessories",
    seoDescription: "Browse culturally inspired accessories and practical finishing pieces from House of Patani.",
    seoTitle: "Heritage-Inspired Accessories | House of Patani",
    slug: "accessories",
  },
];

export const categoryNameBySlug = Object.fromEntries(
  shopCategories.map((category) => [category.slug, category.name]),
) as Record<ProductCategory, string>;
