import type { Product } from "@/types/product.types";

export interface CategoryCard {
  name: string;
  description: string;
  imageUrl: string;
}

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
}

export const categories: CategoryCard[] = [
  {
    name: "Clothing",
    description: "Handwoven silhouettes with heirloom detail.",
    imageUrl:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Jewelry",
    description: "Quiet statement pieces inspired by royal craft.",
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Handicrafts",
    description: "Objects shaped by patient hands and old memory.",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home Decor",
    description: "Warm accents for considered, lived-in spaces.",
    imageUrl:
      "https://images.unsplash.com/photo-1602872030490-4a484a7b3ba6?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Books",
    description: "Stories, craft notes, and cultural keepsakes.",
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    description: "Finishing touches with artisanal restraint.",
    imageUrl:
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=900&q=80",
  },
];

export const featuredProducts: Product[] = [
  {
    id: "kantha-heritage-stole",
    name: "Kantha Heritage Stole",
    slug: "kantha-heritage-stole",
    description: "A soft hand-finished layer with maroon threadwork.",
    price: 4200,
    imageUrls: [
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80",
    ],
    isActive: true,
  },
  {
    id: "brass-lotus-diya-set",
    name: "Brass Lotus Diya Set",
    slug: "brass-lotus-diya-set",
    description: "Muted gold brasswork made for festive tables.",
    price: 2800,
    imageUrls: [
      "https://images.unsplash.com/photo-1605245540434-4f6b587f5bad?auto=format&fit=crop&w=900&q=80",
    ],
    isActive: true,
  },
  {
    id: "ivory-block-print-kurta",
    name: "Ivory Block Print Kurta",
    slug: "ivory-block-print-kurta",
    description: "Breathable cotton with a refined archival motif.",
    price: 5600,
    imageUrls: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    ],
    isActive: true,
  },
  {
    id: "rosewood-jewelry-box",
    name: "Rosewood Jewelry Box",
    slug: "rosewood-jewelry-box",
    description: "A keepsake box with carved floral detailing.",
    price: 3900,
    imageUrls: [
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80",
    ],
    isActive: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Ananya Rao",
    location: "Bengaluru",
    quote:
      "The pieces feel deeply Indian without feeling dated. Everything has a quiet, heirloom quality.",
  },
  {
    name: "Meera Khanna",
    location: "Delhi",
    quote:
      "House of Patani captures the warmth of craft with the polish of a luxury boutique.",
  },
  {
    name: "Rhea Sen",
    location: "Mumbai",
    quote:
      "The packaging, textures, and palette feel personal. It is familiar, but much more refined.",
  },
];
