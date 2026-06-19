import type { ProductCategory } from "@/types/product.types";

export interface ShopCategory {
  description: string;
  imageUrl: string;
  name: string;
  slug: ProductCategory;
}

export const shopCategories: ShopCategory[] = [
  {
    description: "Handwoven silhouettes shaped by Indian textile traditions.",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=82",
    name: "Clothing",
    slug: "clothing",
  },
  {
    description: "Quiet statement pieces in silver, brass, and stone.",
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=82",
    name: "Jewelry",
    slug: "jewelry",
  },
  {
    description: "Objects made slowly through carving, casting, and weaving.",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=82",
    name: "Handicrafts",
    slug: "handicrafts",
  },
  {
    description: "Warm, considered accents for rooms with a sense of memory.",
    imageUrl:
      "https://images.unsplash.com/photo-1602872030490-4a484a7b3ba6?auto=format&fit=crop&w=1000&q=82",
    name: "Home Decor",
    slug: "home-decor",
  },
  {
    description: "Art, culture, food, and craft stories worth keeping close.",
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1000&q=82",
    name: "Books",
    slug: "books",
  },
  {
    description: "Finishing pieces with material depth and everyday ease.",
    imageUrl:
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=1000&q=82",
    name: "Accessories",
    slug: "accessories",
  },
];

export const categoryNameBySlug = Object.fromEntries(
  shopCategories.map((category) => [category.slug, category.name]),
) as Record<ProductCategory, string>;
