import { shopCategories } from "@/data/categories";
import { products as mockProducts } from "@/data/products";
import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
} from "@/types/database.types";
import type {
  CatalogProduct,
  ProductCategory,
} from "@/types/product.types";

function isProductCategory(value: string): value is ProductCategory {
  return shopCategories.some((category) => category.slug === value);
}

function mapProduct(
  row: ProductRow,
  categories: Map<string, CategoryRow>,
  images: ProductImageRow[],
): CatalogProduct | null {
  const fallback = mockProducts.find((product) => product.slug === row.slug);
  const categorySlug = row.category_id
    ? categories.get(row.category_id)?.slug
    : undefined;
  const productImages = images
    .filter((image) => image.product_id === row.id)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((image) => image.image_url);

  if (!categorySlug || !isProductCategory(categorySlug)) {
    return null;
  }

  return {
    bestSeller: row.best_seller,
    category: categorySlug,
    createdAt: row.created_at,
    description: row.short_description ?? row.description ?? "",
    featured: row.featured,
    id: row.id,
    images:
      productImages.length > 0
        ? productImages
        : (fallback?.images ?? []),
    name: row.name,
    newArrival: row.new_arrival,
    originalPrice: row.original_price,
    price: row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    slug: row.slug,
    stock: row.stock,
    tags: row.tags,
  };
}

async function listFromSupabase() {
  if (!supabase) {
    return null;
  }

  const [productsResult, categoriesResult, imagesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("active", true),
    supabase
      .from("product_images")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const error =
    productsResult.error ?? categoriesResult.error ?? imagesResult.error;

  if (error) {
    throw error;
  }

  const categories = new Map(
    (categoriesResult.data ?? []).map((category) => [
      category.id,
      category,
    ]),
  );

  return (productsResult.data ?? []).flatMap<CatalogProduct>((product) => {
    const mapped = mapProduct(
      product,
      categories,
      imagesResult.data ?? [],
    );
    return mapped ? [mapped] : [];
  });
}

export const productService = {
  async getBySlug(
    slug: string,
  ): Promise<ServiceResponse<CatalogProduct | null>> {
    const fallback =
      mockProducts.find((product) => product.slug === slug) ?? null;

    if (!supabase) {
      return mockResponse(fallback);
    }

    try {
      const products = await listFromSupabase();
      const product = products?.find((item) => item.slug === slug);
      return product !== undefined
        ? supabaseResponse(product)
        : mockResponse(fallback);
    } catch (error) {
      return fallbackAfterError(
        fallback,
        error,
        "We could not load this product from the catalogue right now.",
      );
    }
  },

  async list(): Promise<ServiceResponse<CatalogProduct[]>> {
    if (!supabase) {
      return mockResponse(mockProducts);
    }

    try {
      const products = await listFromSupabase();
      return products && products.length > 0
        ? supabaseResponse(products)
        : mockResponse(mockProducts);
    } catch (error) {
      return fallbackAfterError(
        mockProducts,
        error,
        "We could not refresh the product catalogue right now.",
      );
    }
  },
};
