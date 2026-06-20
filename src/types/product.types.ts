export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrls?: string[];
  isActive: boolean;
}

export type ProductCategory =
  | "clothing"
  | "jewelry"
  | "handicrafts"
  | "home-decor"
  | "books"
  | "accessories";

export interface CatalogProduct {
  active: boolean;
  bestSeller: boolean;
  category: ProductCategory;
  createdAt: string;
  description: string;
  featured: boolean;
  id: string;
  images: string[];
  name: string;
  newArrival: boolean;
  originalPrice: number;
  price: number;
  rating: number;
  reviewCount: number;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
}

export interface ProductInput {
  active: boolean;
  bestSeller: boolean;
  category: ProductCategory;
  description: string;
  featured: boolean;
  name: string;
  newArrival: boolean;
  originalPrice: number;
  price: number;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
}
