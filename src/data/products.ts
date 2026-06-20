import type {
  CatalogProduct,
  ProductCategory,
} from "@/types/product.types";
import { generateSlug } from "@/utils";

interface ProductSeed {
  bestSeller?: boolean;
  description: string;
  featured?: boolean;
  name: string;
  newArrival?: boolean;
  originalPrice: number;
  price: number;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
}

const categoryImages: Record<ProductCategory, string[]> = {
  accessories: [
    "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=82",
  ],
  books: [
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=82",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=82",
  ],
  handicrafts: [
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1577702312706-e23ff063064f?auto=format&fit=crop&w=1000&q=82",
  ],
  "home-decor": [
    "https://images.unsplash.com/photo-1602872030490-4a484a7b3ba6?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=82",
  ],
  jewelry: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=82",
  ],
};

const seeds: Record<ProductCategory, ProductSeed[]> = {
  clothing: [
    { name: "Ivory Bagru Kurta", description: "Airy cotton kurta with hand-blocked floral rhythm.", price: 3890, originalPrice: 4590, rating: 4.8, reviewCount: 128, featured: true, bestSeller: true, stock: 18, tags: ["cotton", "bagru", "kurta", "block print"] },
    { name: "Kantha Heritage Stole", description: "Soft layered stole finished with expressive kantha stitches.", price: 4200, originalPrice: 4800, rating: 4.9, reviewCount: 96, featured: true, newArrival: true, stock: 12, tags: ["kantha", "stole", "hand stitched", "textile"] },
    { name: "Maroon Ajrakh Dress", description: "Fluid midi dress carrying a deep archival ajrakh print.", price: 6490, originalPrice: 7290, rating: 4.7, reviewCount: 74, bestSeller: true, stock: 9, tags: ["ajrakh", "dress", "maroon", "cotton"] },
    { name: "Indigo Dabu Shirt", description: "Relaxed unisex shirt made in resist-printed indigo cotton.", price: 3290, originalPrice: 3890, rating: 4.6, reviewCount: 58, stock: 21, tags: ["indigo", "dabu", "shirt", "unisex"] },
    { name: "Chanderi Gold Dupatta", description: "Feather-light chanderi with a restrained woven gold border.", price: 5290, originalPrice: 6100, rating: 4.8, reviewCount: 83, featured: true, stock: 14, tags: ["chanderi", "dupatta", "gold", "festive"] },
    { name: "Handloom Linen Jacket", description: "Structured linen layer with hand-finished contrast seams.", price: 7850, originalPrice: 8900, rating: 4.7, reviewCount: 42, newArrival: true, stock: 7, tags: ["linen", "jacket", "handloom", "layering"] },
    { name: "Kalamkari Wrap Skirt", description: "A versatile wrap skirt printed with narrative kalamkari forms.", price: 4490, originalPrice: 5150, rating: 4.5, reviewCount: 49, stock: 16, tags: ["kalamkari", "skirt", "wrap", "printed"] },
    { name: "Eri Silk Long Kurta", description: "Textured peace silk kurta with a clean, elongated line.", price: 8990, originalPrice: 9900, rating: 4.9, reviewCount: 37, featured: true, newArrival: true, stock: 6, tags: ["eri silk", "kurta", "silk", "heritage"] },
    { name: "Madras Check Lounge Set", description: "Soft checked cotton set designed for easy, quiet mornings.", price: 5790, originalPrice: 6490, rating: 4.6, reviewCount: 65, bestSeller: true, stock: 20, tags: ["madras", "checks", "lounge", "cotton"] },
  ],
  jewelry: [
    { name: "Temple Coin Necklace", description: "A warm brass necklace inspired by old ceremonial coin forms.", price: 7200, originalPrice: 8400, rating: 4.9, reviewCount: 112, featured: true, bestSeller: true, stock: 8, tags: ["temple", "necklace", "brass", "coin"] },
    { name: "Silver Lotus Studs", description: "Small sterling silver studs shaped like unfolding lotus petals.", price: 2400, originalPrice: 2800, rating: 4.8, reviewCount: 89, stock: 24, tags: ["silver", "earrings", "lotus", "studs"] },
    { name: "Navratna Keepsake Ring", description: "A delicate ring set with nine softly colored stones.", price: 5900, originalPrice: 6750, rating: 4.7, reviewCount: 54, newArrival: true, stock: 11, tags: ["navratna", "ring", "gemstone", "heritage"] },
    { name: "Hammered Gold Cuff", description: "A sculptural brass cuff with a muted, hand-hammered finish.", price: 3600, originalPrice: 4200, rating: 4.6, reviewCount: 72, bestSeller: true, stock: 15, tags: ["cuff", "brass", "gold", "hammered"] },
    { name: "Pearl Jhumka Earrings", description: "Classic jhumkas softened with tiny seed pearl details.", price: 4800, originalPrice: 5500, rating: 4.9, reviewCount: 135, featured: true, bestSeller: true, stock: 10, tags: ["jhumka", "pearl", "earrings", "festive"] },
    { name: "Turquoise Silver Pendant", description: "An oxidized silver pendant centered by a calm turquoise stone.", price: 4100, originalPrice: 4700, rating: 4.5, reviewCount: 39, stock: 13, tags: ["turquoise", "silver", "pendant", "stone"] },
    { name: "Kundan Petal Bracelet", description: "A fine kundan-inspired bracelet with a flexible floral line.", price: 6800, originalPrice: 7600, rating: 4.7, reviewCount: 47, newArrival: true, stock: 7, tags: ["kundan", "bracelet", "petal", "occasion"] },
    { name: "Moonstone Drop Earrings", description: "Luminous moonstone drops held in a brushed silver frame.", price: 5200, originalPrice: 5950, rating: 4.8, reviewCount: 61, featured: true, stock: 9, tags: ["moonstone", "earrings", "silver", "drop"] },
    { name: "Enamel Peacock Brooch", description: "A hand-enameled peacock brooch with jewel-toned detailing.", price: 3100, originalPrice: 3600, rating: 4.4, reviewCount: 28, stock: 0, tags: ["enamel", "brooch", "peacock", "accessory"] },
  ],
  handicrafts: [
    { name: "Rosewood Jewelry Box", description: "Carved rosewood keepsake box lined with soft handloom cotton.", price: 3900, originalPrice: 4500, rating: 4.8, reviewCount: 91, featured: true, bestSeller: true, stock: 11, tags: ["rosewood", "box", "carved", "keepsake"] },
    { name: "Dhokra Horse Sculpture", description: "Lost-wax brass sculpture with the lively stance of folk forms.", price: 6200, originalPrice: 7100, rating: 4.9, reviewCount: 67, featured: true, stock: 5, tags: ["dhokra", "brass", "sculpture", "horse"] },
    { name: "Blue Pottery Trinket Dish", description: "A small Jaipur blue pottery dish painted with vines.", price: 1250, originalPrice: 1490, rating: 4.6, reviewCount: 105, bestSeller: true, stock: 32, tags: ["blue pottery", "dish", "jaipur", "ceramic"] },
    { name: "Palm Leaf Storage Basket", description: "Handwoven lidded basket for beautiful everyday organization.", price: 2100, originalPrice: 2450, rating: 4.5, reviewCount: 52, stock: 19, tags: ["basket", "palm leaf", "woven", "storage"] },
    { name: "Bidri Inlay Vase", description: "Dark metal vase finished with fine silver-toned inlay.", price: 7800, originalPrice: 8900, rating: 4.8, reviewCount: 31, newArrival: true, stock: 4, tags: ["bidri", "vase", "inlay", "metal"] },
    { name: "Papier Mache Bird Set", description: "A pair of hand-painted birds made in Kashmir's papier mache tradition.", price: 2750, originalPrice: 3200, rating: 4.7, reviewCount: 44, stock: 14, tags: ["papier mache", "birds", "kashmir", "painted"] },
    { name: "Sandalwood Incense Holder", description: "A carved incense holder with a delicate pierced pattern.", price: 1850, originalPrice: 2200, rating: 4.6, reviewCount: 76, bestSeller: true, stock: 23, tags: ["sandalwood", "incense", "carved", "ritual"] },
    { name: "Lacquered Nesting Bowls", description: "Three turned wood bowls finished in warm lacquered tones.", price: 3400, originalPrice: 3950, rating: 4.5, reviewCount: 36, newArrival: true, stock: 9, tags: ["lacquer", "bowls", "wood", "nesting"] },
    { name: "Bastar Tribal Wall Mask", description: "Hand-cast wall object informed by Bastar's metal craft language.", price: 5600, originalPrice: 6400, rating: 4.8, reviewCount: 29, featured: true, stock: 6, tags: ["bastar", "wall art", "metal", "tribal"] },
  ],
  "home-decor": [
    { name: "Brass Lotus Diya Set", description: "A pair of muted brass diyas shaped like open lotus flowers.", price: 2800, originalPrice: 3300, rating: 4.9, reviewCount: 154, featured: true, bestSeller: true, stock: 26, tags: ["brass", "diya", "lotus", "festive"] },
    { name: "Block Print Cushion Cover", description: "Hand-blocked cotton cushion cover in maroon and old gold.", price: 1450, originalPrice: 1750, rating: 4.7, reviewCount: 119, bestSeller: true, stock: 38, tags: ["cushion", "block print", "cotton", "maroon"] },
    { name: "Handwoven Jute Runner", description: "Textural table runner woven with jute and cotton accents.", price: 2350, originalPrice: 2750, rating: 4.6, reviewCount: 64, stock: 22, tags: ["jute", "runner", "table", "woven"] },
    { name: "Terracotta Urli Bowl", description: "Wide terracotta bowl with a softly burnished earthen finish.", price: 3200, originalPrice: 3700, rating: 4.8, reviewCount: 73, featured: true, stock: 12, tags: ["terracotta", "urli", "bowl", "decor"] },
    { name: "Kashmiri Chain Stitch Rug", description: "A small wool rug covered in expressive chain-stitch florals.", price: 8900, originalPrice: 10200, rating: 4.9, reviewCount: 45, newArrival: true, stock: 5, tags: ["rug", "kashmir", "chain stitch", "wool"] },
    { name: "Carved Mango Wood Lamp", description: "Warm table lamp with a hand-carved mango wood base.", price: 6500, originalPrice: 7450, rating: 4.7, reviewCount: 57, bestSeller: true, stock: 8, tags: ["lamp", "mango wood", "carved", "lighting"] },
    { name: "Indigo Cotton Throw", description: "Lightweight throw quilted in a layered indigo print.", price: 4800, originalPrice: 5500, rating: 4.8, reviewCount: 88, featured: true, stock: 16, tags: ["throw", "indigo", "cotton", "quilted"] },
    { name: "Hammered Brass Planter", description: "Tapered planter with a subtle hand-hammered surface.", price: 3700, originalPrice: 4250, rating: 4.5, reviewCount: 41, stock: 13, tags: ["planter", "brass", "hammered", "home"] },
    { name: "Phulkari Framed Textile", description: "A vibrant embroidered textile fragment mounted for the wall.", price: 7200, originalPrice: 8100, rating: 4.9, reviewCount: 34, newArrival: true, stock: 0, tags: ["phulkari", "wall art", "embroidery", "textile"] },
  ],
  books: [
    { name: "Textiles of the Subcontinent", description: "A richly illustrated survey of weaving, dyeing, and print traditions.", price: 2950, originalPrice: 3400, rating: 4.9, reviewCount: 87, featured: true, bestSeller: true, stock: 20, tags: ["textiles", "design", "craft", "reference"] },
    { name: "The Indian Courtyard", description: "Architecture and domestic rituals seen through historic courtyard homes.", price: 2250, originalPrice: 2600, rating: 4.7, reviewCount: 46, stock: 17, tags: ["architecture", "homes", "india", "photography"] },
    { name: "Spice Routes and Kitchens", description: "Recipes and stories tracing India's old culinary pathways.", price: 1850, originalPrice: 2150, rating: 4.8, reviewCount: 102, bestSeller: true, stock: 29, tags: ["food", "recipes", "spices", "culture"] },
    { name: "Craft Atlas of India", description: "A region-by-region guide to living craft practices and communities.", price: 3400, originalPrice: 3900, rating: 4.9, reviewCount: 63, featured: true, newArrival: true, stock: 13, tags: ["atlas", "craft", "india", "artisan"] },
    { name: "Gardens of the Maharajas", description: "A visual journey through royal gardens and landscape traditions.", price: 2650, originalPrice: 3050, rating: 4.6, reviewCount: 38, stock: 16, tags: ["gardens", "royal", "landscape", "history"] },
    { name: "Handmade Paper Journal", description: "A cloth-bound journal filled with softly textured handmade paper.", price: 950, originalPrice: 1150, rating: 4.7, reviewCount: 141, bestSeller: true, stock: 42, tags: ["journal", "paper", "stationery", "handmade"] },
    { name: "Folk Tales by Lamplight", description: "A keepsake collection of regional stories for slow evening reading.", price: 1250, originalPrice: 1450, rating: 4.5, reviewCount: 55, stock: 24, tags: ["folk tales", "stories", "literature", "gift"] },
    { name: "Jewels of the Deccan", description: "A detailed study of court jewelry, gemstones, and metalwork.", price: 3850, originalPrice: 4400, rating: 4.8, reviewCount: 33, newArrival: true, stock: 10, tags: ["jewelry", "deccan", "history", "art"] },
    { name: "A Weaver's Year", description: "An intimate photographic diary of one weaving community.", price: 2100, originalPrice: 2450, rating: 4.9, reviewCount: 49, featured: true, stock: 15, tags: ["weaving", "photography", "artisan", "community"] },
  ],
  accessories: [
    { name: "Ajrakh Silk Scarf", description: "A fluid silk scarf printed in deep madder and indigo.", price: 3350, originalPrice: 3900, rating: 4.8, reviewCount: 108, featured: true, bestSeller: true, stock: 21, tags: ["ajrakh", "scarf", "silk", "indigo"] },
    { name: "Woven Leather Tote", description: "Structured leather tote with a handwoven front panel.", price: 7800, originalPrice: 8900, rating: 4.7, reviewCount: 62, bestSeller: true, stock: 8, tags: ["tote", "leather", "woven", "bag"] },
    { name: "Block Print Travel Pouch", description: "Quilted cotton pouch for jewelry, cables, or daily essentials.", price: 1350, originalPrice: 1600, rating: 4.6, reviewCount: 129, stock: 35, tags: ["pouch", "travel", "block print", "cotton"] },
    { name: "Brass Buckle Belt", description: "Vegetable-tanned leather belt finished with a sculpted brass buckle.", price: 2900, originalPrice: 3350, rating: 4.5, reviewCount: 43, stock: 19, tags: ["belt", "brass", "leather", "buckle"] },
    { name: "Kantha Laptop Sleeve", description: "Padded sleeve made from layered kantha-stitched cotton.", price: 2600, originalPrice: 3050, rating: 4.8, reviewCount: 77, newArrival: true, stock: 17, tags: ["laptop", "kantha", "sleeve", "work"] },
    { name: "Handloom Cotton Cap", description: "A soft six-panel cap cut from textured handloom cotton.", price: 1750, originalPrice: 2100, rating: 4.4, reviewCount: 31, stock: 22, tags: ["cap", "handloom", "cotton", "unisex"] },
    { name: "Embroidered Potli Bag", description: "Compact occasion bag with restrained metallic embroidery.", price: 4200, originalPrice: 4850, rating: 4.9, reviewCount: 84, featured: true, bestSeller: true, stock: 12, tags: ["potli", "bag", "embroidery", "occasion"] },
    { name: "Indigo Passport Wallet", description: "Slim travel wallet wrapped in durable indigo cotton.", price: 1950, originalPrice: 2300, rating: 4.6, reviewCount: 56, stock: 26, tags: ["passport", "wallet", "indigo", "travel"] },
    { name: "Wool Jacquard Shawl", description: "Warm jacquard shawl woven with a subtle geometric border.", price: 5900, originalPrice: 6800, rating: 4.8, reviewCount: 69, newArrival: true, featured: true, stock: 9, tags: ["shawl", "wool", "jacquard", "winter"] },
  ],
};

const categoryOrder: ProductCategory[] = [
  "clothing",
  "jewelry",
  "handicrafts",
  "home-decor",
  "books",
  "accessories",
];

export const products: CatalogProduct[] = categoryOrder.flatMap(
  (category, categoryIndex) =>
    seeds[category].map((seed, productIndex) => {
      const sequence = categoryIndex * 9 + productIndex + 1;
      const createdAt = new Date(
        Date.UTC(2026, 5, 15 - sequence * 3),
      ).toISOString();

      const media = categoryImages[category].map((image, imageIndex) => ({
        altText: `${seed.name} view ${imageIndex + 1}`,
        id: `media-${sequence}-${imageIndex + 1}`,
        isPrimary: imageIndex === 0,
        position: imageIndex,
        storagePath: null,
        url: `${image}&sig=${sequence}-${imageIndex}`,
      }));

      return {
        active: true,
        bestSeller: seed.bestSeller ?? false,
        category,
        createdAt,
        description: seed.description,
        featured: seed.featured ?? false,
        id: `hop-${String(sequence).padStart(3, "0")}`,
        images: media.map((image) => image.url),
        media,
        name: seed.name,
        newArrival: seed.newArrival ?? false,
        originalPrice: seed.originalPrice,
        price: seed.price,
        rating: seed.rating,
        reviewCount: seed.reviewCount,
        sku: `HOP-${String(sequence).padStart(4, "0")}`,
        slug: generateSlug(seed.name),
        stock: seed.stock,
        tags: seed.tags,
      };
    }),
);

export const MAX_PRODUCT_PRICE = Math.ceil(
  Math.max(...products.map((product) => product.price)) / 1000,
) * 1000;
