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
  Json,
  ProductImageRow,
  ProductRow,
} from "@/types/database.types";
import { defaultProductContentFields } from "@/types/product.types";
import type {
  CatalogProduct,
  ProductAttribute,
  ProductCategory,
  ProductInput,
} from "@/types/product.types";

function isProductCategory(value: string): value is ProductCategory {
  return shopCategories.some((category) => category.slug === value);
}

function normalizeProductAttributes(value: Json | null | undefined): ProductAttribute[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];

    const record = item as Record<string, Json | undefined>;
    const key = typeof record.key === "string" ? record.key : "";
    const label = typeof record.label === "string" ? record.label : "";
    const rawValue = record.value;

    if (!key || !label) return [];

    return [
      {
        key,
        label,
        value:
          typeof rawValue === "string" ||
          typeof rawValue === "number" ||
          typeof rawValue === "boolean"
            ? String(rawValue)
            : "",
      },
    ];
  });
}

function normalizeInputProductAttributes(
  attributes: ProductAttribute[] | null | undefined,
): ProductAttribute[] {
  if (!Array.isArray(attributes)) return [];

  return attributes.flatMap((attribute) => {
    if (!attribute || typeof attribute !== "object") return [];

    const record = attribute as unknown as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key : "";
    const label = typeof record.label === "string" ? record.label : "";
    const rawValue = record.value;
    const value =
      typeof rawValue === "string" ||
      typeof rawValue === "number" ||
      typeof rawValue === "boolean"
        ? String(rawValue)
        : "";

    return key && label ? [{ key, label, value }] : [];
  });
}

function productAttributesToJson(attributes?: ProductAttribute[] | null): Json {
  return normalizeInputProductAttributes(attributes).map((attribute) => ({
    key: attribute.key,
    label: attribute.label,
    value: attribute.value,
  }));
}

function mapProduct(
  row: ProductRow,
  categories: Map<string, CategoryRow>,
  images: ProductImageRow[],
  inventoryStockByProductId = new Map<string, number>(),
): CatalogProduct | null {
  const fallback =
    adminStorage.products
      .list()
      .find((product) => product.id === row.id || product.slug === row.slug) ??
    mockProducts.find((product) => product.slug === row.slug);
  const override = adminStorage.productOverrides.get(row.id);
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
    ...defaultProductContentFields,
    active: override?.active ?? row.active,
    bestSeller: override?.bestSeller ?? row.best_seller,
    category: categorySlug,
    createdAt: row.created_at,
    description:
      override?.description ??
      row.short_description ??
      row.description ??
      "",
    shortDescription:
      override?.description ??
      row.short_description ??
      "",
    longDescription:
      override?.longDescription ??
      row.long_description ??
      "",
    details:
      override?.details ??
      row.details ??
      "",
    careInstructions:
      override?.careInstructions ??
      row.care_instructions ??
      "",
    shippingReturns:
      override?.shippingReturns ??
      row.shipping_returns ??
      "",
    shippingWeightKg:
      override?.shippingWeightKg ?? Number(row.shipping_weight_kg ?? 0.7),
    packageLengthCm:
      override?.packageLengthCm ?? Number(row.package_length_cm ?? 30),
    packageBreadthCm:
      override?.packageBreadthCm ?? Number(row.package_breadth_cm ?? 25),
    packageHeightCm:
      override?.packageHeightCm ?? Number(row.package_height_cm ?? 5),
    attributes:
      override?.attributes === undefined
        ? normalizeProductAttributes(row.attributes)
        : normalizeInputProductAttributes(override.attributes),
    deliveryCodTitle:
      override?.deliveryCodTitle ??
      row.delivery_cod_title ??
      "",
    deliveryCodDescription:
      override?.deliveryCodDescription ??
      row.delivery_cod_description ??
      "",
    deliveryPaymentTitle:
      override?.deliveryPaymentTitle ??
      row.delivery_payment_title ??
      "",
    deliveryPaymentDescription:
      override?.deliveryPaymentDescription ??
      row.delivery_payment_description ??
      "",
    deliveryShippingTitle:
      override?.deliveryShippingTitle ??
      row.delivery_shipping_title ??
      "",
    deliveryShippingDescription:
      override?.deliveryShippingDescription ??
      row.delivery_shipping_description ??
      "",
    deliveryReturnsTitle:
      override?.deliveryReturnsTitle ??
      row.delivery_returns_title ??
      "",
    deliveryReturnsDescription:
      override?.deliveryReturnsDescription ??
      row.delivery_returns_description ??
      "",
    deliveryCareTitle:
      override?.deliveryCareTitle ??
      row.delivery_care_title ??
      "",
    deliveryCareDescription:
      override?.deliveryCareDescription ??
      row.delivery_care_description ??
      "",
    deliveryPackagingTitle:
      override?.deliveryPackagingTitle ??
      row.delivery_packaging_title ??
      "",
    deliveryPackagingDescription:
      override?.deliveryPackagingDescription ??
      row.delivery_packaging_description ??
      "",
    featured: override?.featured ?? row.featured,
    id: row.id,
    images: resolvedMedia.map((image) => image.url),
    media: resolvedMedia,
    name: override?.name ?? row.name,
    newArrival: override?.newArrival ?? row.new_arrival,
    originalPrice: override?.originalPrice ?? row.original_price,
    price: override?.price ?? row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    sku: override?.sku ?? row.sku,
    slug: override?.slug ?? row.slug,
    stock: inventoryStockByProductId.get(row.id) ?? override?.stock ?? row.stock,
    tags: override?.tags ?? row.tags,
    warehouseId: override?.warehouseId ?? row.warehouse_id ?? null,
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

  const [
  productsResult,
  categoriesResult,
  imagesResult,
  inventoryResult,
] = await Promise.all([
  productsQuery,
  supabase.from("categories").select("*").eq("active", true),
  supabase
    .from("product_images")
    .select("*")
    .order("position", { ascending: true }),
  supabase.from("inventory_items").select("product_id, stock_quantity"),
]);

  const error =
  productsResult.error ??
  categoriesResult.error ??
  imagesResult.error ??
  inventoryResult.error;

  if (error) {
    throw error;
  }

  const categories = new Map(
    (categoriesResult.data ?? []).map((category) => [
      category.id,
      category,
    ]),
  );
  const inventoryStockByProductId = new Map(
  (inventoryResult.data ?? []).map((item) => [
    item.product_id,
    Number(item.stock_quantity ?? 0),
  ]),
);

  return (productsResult.data ?? []).flatMap<CatalogProduct>((product) => {
    const mapped = mapProduct(
  product,
  categories,
  imagesResult.data ?? [],
  inventoryStockByProductId,
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
    long_description: input.longDescription,
    details: input.details,
    care_instructions: input.careInstructions,
    shipping_returns: input.shippingReturns,
    attributes: productAttributesToJson(input.attributes),
    delivery_cod_title: input.deliveryCodTitle,
    delivery_cod_description: input.deliveryCodDescription,
    delivery_payment_title: input.deliveryPaymentTitle,
    delivery_payment_description: input.deliveryPaymentDescription,
    delivery_shipping_title: input.deliveryShippingTitle,
    delivery_shipping_description: input.deliveryShippingDescription,
    delivery_returns_title: input.deliveryReturnsTitle,
    delivery_returns_description: input.deliveryReturnsDescription,
    delivery_care_title: input.deliveryCareTitle,
    delivery_care_description: input.deliveryCareDescription,
    delivery_packaging_title: input.deliveryPackagingTitle,
    delivery_packaging_description: input.deliveryPackagingDescription,
    featured: input.featured,
    name: input.name,
    new_arrival: input.newArrival,
    original_price: input.originalPrice,
    package_breadth_cm: input.packageBreadthCm,
    package_height_cm: input.packageHeightCm,
    package_length_cm: input.packageLengthCm,
    price: input.price,
    short_description: input.description,
    shipping_weight_kg: input.shippingWeightKg,
    sku: input.sku,
    slug: input.slug,
    stock: input.stock,
    tags: input.tags,
    warehouse_id: input.warehouseId || null,
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
    ...(input.longDescription === undefined ? {} : { long_description: input.longDescription }),
    ...(input.details === undefined ? {} : { details: input.details }),
    ...(input.careInstructions === undefined ? {} : { care_instructions: input.careInstructions }),
    ...(input.shippingReturns === undefined ? {} : { shipping_returns: input.shippingReturns }),
    ...(input.attributes === undefined ? {} : { attributes: productAttributesToJson(input.attributes) }),
    ...(input.deliveryCodTitle === undefined ? {} : { delivery_cod_title: input.deliveryCodTitle }),
    ...(input.deliveryCodDescription === undefined ? {} : { delivery_cod_description: input.deliveryCodDescription }),
    ...(input.deliveryPaymentTitle === undefined ? {} : { delivery_payment_title: input.deliveryPaymentTitle }),
    ...(input.deliveryPaymentDescription === undefined ? {} : { delivery_payment_description: input.deliveryPaymentDescription }),
    ...(input.deliveryShippingTitle === undefined ? {} : { delivery_shipping_title: input.deliveryShippingTitle }),
    ...(input.deliveryShippingDescription === undefined ? {} : { delivery_shipping_description: input.deliveryShippingDescription }),
    ...(input.deliveryReturnsTitle === undefined ? {} : { delivery_returns_title: input.deliveryReturnsTitle }),
    ...(input.deliveryReturnsDescription === undefined ? {} : { delivery_returns_description: input.deliveryReturnsDescription }),
    ...(input.deliveryCareTitle === undefined ? {} : { delivery_care_title: input.deliveryCareTitle }),
    ...(input.deliveryCareDescription === undefined ? {} : { delivery_care_description: input.deliveryCareDescription }),
    ...(input.deliveryPackagingTitle === undefined ? {} : { delivery_packaging_title: input.deliveryPackagingTitle }),
    ...(input.deliveryPackagingDescription === undefined ? {} : { delivery_packaging_description: input.deliveryPackagingDescription }),
    ...(input.featured === undefined ? {} : { featured: input.featured }),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.newArrival === undefined
      ? {}
      : { new_arrival: input.newArrival }),
    ...(input.originalPrice === undefined
      ? {}
      : { original_price: input.originalPrice }),
    ...(input.packageBreadthCm === undefined
      ? {}
      : { package_breadth_cm: input.packageBreadthCm }),
    ...(input.packageHeightCm === undefined
      ? {}
      : { package_height_cm: input.packageHeightCm }),
    ...(input.packageLengthCm === undefined
      ? {}
      : { package_length_cm: input.packageLengthCm }),
    ...(input.price === undefined ? {} : { price: input.price }),
    ...(input.shippingWeightKg === undefined
      ? {}
      : { shipping_weight_kg: input.shippingWeightKg }),
    ...(input.sku === undefined ? {} : { sku: input.sku }),
    ...(input.slug === undefined ? {} : { slug: input.slug }),
    ...(input.stock === undefined ? {} : { stock: input.stock }),
    ...(input.tags === undefined ? {} : { tags: input.tags }),
    ...(input.warehouseId === undefined
      ? {}
      : { warehouse_id: input.warehouseId || null }),
  };
}

function logProductWriteError(
  operation: "insert" | "update",
  error: unknown,
) {
  const value =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};

  console.error(`Supabase product ${operation} failed.`, {
    code: value.code ?? null,
    details: value.details ?? null,
    hint: value.hint ?? null,
    message:
      value.message ??
      (error instanceof Error ? error.message : String(error)),
  });
}

function productWriteError(error: unknown) {
  const value =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const code = String(value.code ?? "");
  const message = String(value.message ?? "");

  if (
    code === "42703" ||
    code === "PGRST204" ||
    message.toLowerCase().includes("warehouse_id")
  ) {
    return new Error(
      "The products.warehouse_id column is unavailable. Apply migration 202607090001_product_warehouse_assignment.sql, then retry.",
    );
  }

  if (code === "23503") {
    return new Error(
      "The selected fulfillment warehouse no longer exists. Refresh the page and choose an active warehouse.",
    );
  }

  return null;
}

async function validateWarehouseId(warehouseId: string | null | undefined) {
  const normalized = warehouseId?.trim() || null;

  if (!supabase || !normalized) return null;

  const { data, error } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", normalized)
    .maybeSingle();

  if (error) {
    logProductWriteError("update", error);
    throw error;
  }

  if (!data) {
    throw new Error(
      "The selected fulfillment warehouse no longer exists. Refresh the page and choose an active warehouse.",
    );
  }

  return normalized;
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
      const warehouseId = await validateWarehouseId(input.warehouseId);
      const categoryId = await getCategoryId(input.category);
      const normalizedInput = { ...input, warehouseId };
      const { data, error } = await supabase
        .from("products")
        .insert(toDatabaseInput(normalizedInput, categoryId))
        .select("*")
        .single();

      if (error) {
        logProductWriteError("insert", error);
        throw error;
      }
      console.debug("Supabase product warehouse assignment saved.", {
        productId: data.id,
        warehouse_id: data.warehouse_id ?? null,
      });
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
      const actionableError = productWriteError(error);
      if (actionableError) throw actionableError;

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
      const warehouseId =
        input.warehouseId === undefined
          ? undefined
          : await validateWarehouseId(input.warehouseId);
      const categoryId = input.category
        ? await getCategoryId(input.category)
        : undefined;
      const normalizedInput =
        warehouseId === undefined ? input : { ...input, warehouseId };
      const databaseInput = toDatabaseUpdate(
        normalizedInput,
        categoryId,
      );
      const { error } = await supabase
        .from("products")
        .update(databaseInput)
        .eq("id", id);

      if (error) {
        logProductWriteError("update", error);
        throw error;
      }
      const product = (await listFromSupabase(false))?.find(
        (item) => item.id === id,
      );
      console.debug("Supabase product warehouse assignment updated.", {
        productId: id,
        warehouse_id: product?.warehouseId ?? null,
      });
      return supabaseResponse(product ?? null);
    } catch (error) {
      const actionableError = productWriteError(error);
      if (actionableError) throw actionableError;

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











