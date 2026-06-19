import type {
  CatalogProduct,
  ProductCategory,
} from "@/types/product.types";
import type { ProductReview } from "@/types/review.types";

interface CategoryExperience {
  careInstructions: string;
  detailNotes: string;
  longDescription: string;
}

const categoryExperience: Record<ProductCategory, CategoryExperience> = {
  accessories: {
    careInstructions:
      "Store in a dry place away from direct sunlight. Clean gently with a soft cloth and avoid prolonged contact with moisture.",
    detailNotes:
      "Designed as an everyday companion with heritage textiles, considered hardware, and careful internal finishing.",
    longDescription:
      "A practical piece elevated by material character and artisanal detail. It is designed to move easily through everyday life while carrying the warmth of traditional Indian making.",
  },
  books: {
    careInstructions:
      "Keep away from moisture and direct sunlight. Support the spine while reading and store upright on a dry shelf.",
    detailNotes:
      "Thoughtfully printed and bound for repeated reading, gifting, and long-term reference.",
    longDescription:
      "This volume is selected for the way it keeps craft, culture, food, architecture, and lived histories within reach. It belongs as comfortably on a working table as it does in a considered library.",
  },
  clothing: {
    careInstructions:
      "Gentle hand wash separately in cold water with mild detergent. Dry in shade and use a warm iron on the reverse.",
    detailNotes:
      "Natural variations in print, weave, and stitch are part of the handmade character of each garment.",
    longDescription:
      "Designed for ease and quiet presence, this piece brings together breathable material, artisanal surface work, and a silhouette made for contemporary wardrobes. Subtle variations are a reminder of the hands behind the cloth.",
  },
  handicrafts: {
    careInstructions:
      "Dust with a soft dry cloth. Avoid abrasive cleaners, standing water, and prolonged exposure to strong sunlight.",
    detailNotes:
      "Handmade using regionally rooted techniques. Minor tonal and textural variations make every piece distinct.",
    longDescription:
      "An object shaped slowly through practiced hands and material knowledge. Its surface, weight, and small irregularities carry the visual language of a living craft tradition.",
  },
  "home-decor": {
    careInstructions:
      "Dust or spot clean gently according to material. Keep away from excess moisture, harsh chemicals, and direct heat.",
    detailNotes:
      "Created to bring texture and warmth into layered, lived-in interiors. Handmade variations are expected.",
    longDescription:
      "Made to settle naturally into the home, this piece balances ornament with restraint. Its color, texture, and hand-finished details create a sense of familiarity without feeling overly formal.",
  },
  jewelry: {
    careInstructions:
      "Store separately in a soft pouch. Avoid perfume, water, and household chemicals. Wipe gently after wear.",
    detailNotes:
      "Hand-finished metalwork and stone settings may carry subtle variations that reflect the making process.",
    longDescription:
      "A quietly expressive piece that draws from ceremonial forms, regional metalwork, and heirloom proportions. Designed to feel special while remaining easy to wear.",
  },
};

const reviewAuthors = [
  "Ananya Rao",
  "Meera Khanna",
  "Rhea Sen",
  "Kavya Menon",
  "Ishita Bose",
  "Naina Kapoor",
] as const;

const reviewTemplates = [
  {
    comment:
      "The material and finishing feel thoughtful, and the piece looks even richer in person. It arrived beautifully packed.",
    title: "Quietly beautiful",
  },
  {
    comment:
      "It has the warmth of something handmade without feeling delicate or difficult to use. The details are lovely.",
    title: "Craft with everyday ease",
  },
  {
    comment:
      "The colors are refined and the quality feels substantial. It has quickly become one of my favorite pieces.",
    title: "Even better in person",
  },
] as const;

export function getProductExperience(product: CatalogProduct) {
  return categoryExperience[product.category];
}

export function getProductReviews(product: CatalogProduct): ProductReview[] {
  const numericId = Number(product.id.replace(/\D/g, "")) || 1;

  return reviewTemplates.map((template, index) => ({
    author: reviewAuthors[(numericId + index) % reviewAuthors.length] ?? "Asha",
    comment: template.comment,
    createdAt: new Date(
      Date.UTC(2026, 4 - index, 18 - ((numericId + index) % 10)),
    ).toISOString(),
    id: `${product.id}-review-${index + 1}`,
    rating: Math.max(4, Math.min(5, Math.round(product.rating - index * 0.2))),
    title: template.title,
  }));
}
