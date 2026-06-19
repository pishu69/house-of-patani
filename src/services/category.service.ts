import { shopCategories, type ShopCategory } from "@/data/categories";
import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { ProductCategory } from "@/types/product.types";

function isProductCategory(value: string): value is ProductCategory {
  return shopCategories.some((category) => category.slug === value);
}

export const categoryService = {
  async list(): Promise<ServiceResponse<ShopCategory[]>> {
    if (!supabase) {
      return mockResponse(shopCategories);
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) {
        throw error;
      }

      const categories = (data ?? []).flatMap<ShopCategory>((category) =>
        isProductCategory(category.slug)
          ? [
              {
                description: category.description ?? "",
                imageUrl: category.image_url ?? "",
                name: category.name,
                slug: category.slug,
              },
            ]
          : [],
      );

      return categories.length > 0
        ? supabaseResponse(categories)
        : mockResponse(shopCategories);
    } catch (error) {
      return fallbackAfterError(
        shopCategories,
        error,
        "We could not refresh the product categories right now.",
      );
    }
  },
};
