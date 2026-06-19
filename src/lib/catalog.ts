import { categoryNameBySlug } from "@/data/categories";
import type {
  CatalogProduct,
  ProductCategory,
} from "@/types/product.types";

export type ShopSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "best-sellers";

export interface CatalogFilters {
  bestSeller: boolean;
  category: "all" | ProductCategory;
  featured: boolean;
  maxPrice: number;
  minPrice: number;
  newArrival: boolean;
  query: string;
  sort: ShopSort;
}

function sortProducts(items: CatalogProduct[], sort: ShopSort) {
  return [...items].sort((left, right) => {
    switch (sort) {
      case "newest":
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "rating":
        return right.rating - left.rating || right.reviewCount - left.reviewCount;
      case "best-sellers":
        return (
          Number(right.bestSeller) - Number(left.bestSeller) ||
          right.reviewCount - left.reviewCount
        );
      case "featured":
      default:
        return (
          Number(right.featured) - Number(left.featured) ||
          Number(right.bestSeller) - Number(left.bestSeller) ||
          right.rating - left.rating
        );
    }
  });
}

export function filterCatalogProducts(
  items: CatalogProduct[],
  filters: CatalogFilters,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const matches = items.filter((product) => {
    const searchValues = [
      product.name,
      product.category,
      categoryNameBySlug[product.category],
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!normalizedQuery || searchValues.includes(normalizedQuery)) &&
      (filters.category === "all" ||
        product.category === filters.category) &&
      product.price >= filters.minPrice &&
      product.price <= filters.maxPrice &&
      (!filters.featured || product.featured) &&
      (!filters.bestSeller || product.bestSeller) &&
      (!filters.newArrival || product.newArrival)
    );
  });

  return sortProducts(matches, filters.sort);
}
