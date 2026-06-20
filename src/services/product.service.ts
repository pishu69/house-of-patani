import { shopCategories } from "@/data/categories";
import { products as mockProducts } from "@/data/products";
import {
  mockResponse,
  supabaseResponse,
  toSafeError,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { storageService } from "@/services/storage.service";
import { fallbackAfterError } from "@/services/service.utils";
import type {
  CategoryRow,
  ProductImageRow,
  ProductRow,
} from "@/types/database.types";
import type {
  CatalogProduct,
  ProductCategory,
  ProductInput,
} from "@/types/product.types";

function isProductCategory(value: string): value is ProductCategory {
  return shopCategories.some((category) => category.slug === value);
}

function mapProduct(
  row: ProductRow,
  categories: Map<string, CategoryRow>,
  images: ProductImageRow[],
): CatalogProduct | null {
  const fallback =
    adminStorage.products
      .list()
      .find((product) => product.id === row.id || product.slug === row.slug) ??
    mockProducts.find((product) => product.slug === row.slug);
  const categorySlug = row.category_id
    ? categories.get(row.category_id)?.slug
    : undefined;
  const productImages = images
    .filter((image) => image.product_id === row.id)
    .sort(
      (left, right) =>
        Number(right.is_primary) - Number(left.is_primary) ||
        left.position - right.position,
    );
  const media = productImages.map((image) => ({
    altText: image.alt_text ?? row.name,
    id: image.id,
    isPrimary: image.is_primary,
    position: image.position,
    storagePath: image.storage_path,
    url: image.image_url,
  }));
  const fallbackMedia =
    adminStorage.productMedia.get(row.id) ?? fallback?.media ?? [];
  const resolvedMedia = media.length > 0 ? media : fallbackMedia;

  if (!categorySlug || !isProductCategory(categorySlug)) {
    return null;
  }

  return {
    active: row.active,
    bestSeller: row.best_seller,
    category: categorySlug,
    createdAt: row.created_at,
    description: row.short_description ?? row.description ?? "",
    featured: row.featured,
    id: row.id,
    images: resolvedMedia.map((image) => image.url),
    media: resolvedMedia,
    name: row.name,
    newArrival: row.new_arrival,
    originalPrice: row.original_price,
    price: row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    sku: row.sku,
    slug: row.slug,
    stock: row.stock,
    tags: row.tags,
  };
}

async function listFromSupabase(activeOnly: boolean) {
  if (!supabase) {
    return null;
  }

  let productsQuery = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) {
    productsQuery = productsQuery.eq("active", true);
  }

  const [productsResult, categoriesResult, imagesResult] = await Promise.all([
    productsQuery,
    supabase.from("categories").select("*").eq("active", true),
    supabase
      .from("product_images")
      .select("*")
      .order("position", { ascending: true }),
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

async function getCategoryId(category: ProductCategory) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (error) throw error;
  return data.id;
}

function toDatabaseInput(input: ProductInput, categoryId: string | null) {
  return {
    active: input.active,
    best_seller: input.bestSeller,
    category_id: categoryId,
    description: input.description,
    featured: input.featured,
    name: input.name,
    new_arrival: input.newArrival,
    original_price: input.originalPrice,
    price: input.price,
    short_description: input.description,
    sku: input.sku,
    slug: input.slug,
    stock: input.stock,
    tags: input.tags,
  };
}

function toDatabaseUpdate(
  input: Partial<ProductInput>,
  categoryId?: string | null,
) {
  return {
    ...(input.active === undefined ? {} : { active: input.active }),
    ...(input.bestSeller === undefined
      ? {}
      : { best_seller: input.bestSeller }),
    ...(categoryId === undefined ? {} : { category_id: categoryId }),
    ...(input.description === undefined
      ? {}
      : {
          description: input.description,
          short_description: input.description,
        }),
    ...(input.featured === undefined ? {} : { featured: input.featured }),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.newArrival === undefined
      ? {}
      : { new_arrival: input.newArrival }),
    ...(input.originalPrice === undefined
      ? {}
      : { original_price: input.originalPrice }),
    ...(input.price === undefined ? {} : { price: input.price }),
    ...(input.sku === undefined ? {} : { sku: input.sku }),
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    ...(input.stock === undefined ? {} : { stock: input.stock }),
    ...(input.tags === undefined ? {} : { tags: input.tags }),
  };
}

async function hydrateProduct(product: CatalogProduct) {
  const media = (
    await Promise.all(
    product.media.map(async (image) => ({
      ...image,
      url: await storageService.resolveImageUrl(image.url, image.storagePath),
    })),
    )
  ).sort(
    (left, right) =>
      Number(right.isPrimary) - Number(left.isPrimary) ||
      left.position - right.position,
  );

  return {
    ...product,
    images: media.map((image) => image.url),
    media,
  };
}

async function hydrateProducts(products: CatalogProduct[]) {
  return Promise.all(products.map(hydrateProduct));
}

export const productService = {
  async getBySlug(
    slug: string,
  ): Promise<ServiceResponse<CatalogProduct | null>> {
    const fallback =
      adminStorage.products
        .list()
        .find((product) => product.slug === slug && product.active) ?? null;

    if (!supabase) {
      return mockResponse(fallback ? await hydrateProduct(fallback) : null);
    }

    try {
      const products = await listFromSupabase(true);
      const product = products?.find((item) => item.slug === slug);
      return product !== undefined
        ? supabaseResponse(await hydrateProduct(product))
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
      return mockResponse(
        await hydrateProducts(
          adminStorage.products.list().filter((product) => product.active),
        ),
      );
    }

    try {
      const products = await listFromSupabase(true);
      return products && products.length > 0
        ? supabaseResponse(await hydrateProducts(products))
        : mockResponse(mockProducts);
    } catch (error) {
      return mockResponse(
        await hydrateProducts(
          adminStorage.products.list().filter((product) => product.active),
        ),
        toSafeError(
          error,
          "We could not refresh the product catalogue right now.",
        ),
      );
    }
  },

  async listAdmin(): Promise<ServiceResponse<CatalogProduct[]>> {
    if (!supabase) {
      return mockResponse(
        await hydrateProducts(adminStorage.products.list()),
      );
    }

    try {
      return supabaseResponse(
        await hydrateProducts((await listFromSupabase(false)) ?? []),
      );
    } catch (error) {
      return mockResponse(
        await hydrateProducts(adminStorage.products.list()),
        toSafeError(
          error,
          "We could not refresh the admin catalogue right now.",
        ),
      );
    }
  },

  async create(
    input: ProductInput,
  ): Promise<ServiceResponse<CatalogProduct>> {
    if (!supabase) {
      return mockResponse(adminStorage.products.create(input));
    }

    try {
      const categoryId = await getCategoryId(input.category);
      const { data, error } = await supabase
        .from("products")
        .insert(toDatabaseInput(input, categoryId))
        .select("*")
        .single();

      if (error) throw error;
      const mapped = mapProduct(
        data,
        new Map([
          [
            categoryId ?? "",
            {
              active: true,
              created_at: data.created_at,
              description: null,
              id: categoryId ?? "",
              image_path: null,
              image_url: null,
              name: input.category,
              slug: input.category,
              updated_at: data.updated_at,
            },
          ],
        ]),
        [],
      );

      if (!mapped) throw new Error("PRODUCT_MAPPING_FAILED");
      return supabaseResponse(mapped);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.products.create(input),
        error,
        "The product could not be saved to the database, so it was kept locally.",
      );
    }
  },

  async update(
    id: string,
    input: Partial<ProductInput>,
  ): Promise<ServiceResponse<CatalogProduct | null>> {
    const localFallback = () => adminStorage.products.update(id, input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const categoryId = input.category
        ? await getCategoryId(input.category)
        : undefined;
      const databaseInput = toDatabaseUpdate(input, categoryId);
      const { error } = await supabase
        .from("products")
        .update(databaseInput)
        .eq("id", id);

      if (error) throw error;
      const product = (await listFromSupabase(false))?.find(
        (item) => item.id === id,
      );
      return supabaseResponse(product ?? null);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The product could not be updated in the database, so the change was kept locally.",
      );
    }
  },

  async remove(id: string): Promise<ServiceResponse<boolean>> {
    const localMedia =
      adminStorage.productMedia.get(id) ??
      adminStorage.products.list().find((item) => item.id === id)?.media ??
      [];
    await Promise.all(
      localMedia.map((image) =>
        storageService.deleteImage("product-images", image.storagePath),
      ),
    );
    adminStorage.productMedia.remove(id);

    if (!supabase) {
      return mockResponse(adminStorage.products.remove(id));
    }

    try {
      const { data: imageRows, error: imageError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", id);
      if (imageError) throw imageError;
      await Promise.all(
        (imageRows ?? []).map((image) =>
          storageService.deleteImage(
            "product-images",
            image.storage_path,
          ),
        ),
      );
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return supabaseResponse(true);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.products.remove(id),
        error,
        "The product could not be deleted from the database, so it was removed locally.",
      );
    }
  },
};
