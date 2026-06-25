import { shopCategories, type ShopCategory } from "@/data/categories";
import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { storageService } from "@/services/storage.service";
import { fallbackAfterError } from "@/services/service.utils";
import type { ProductCategory } from "@/types/product.types";
export const categoryService = {
  async list(): Promise<ServiceResponse<ShopCategory[]>> {
    if (!supabase) {
      return mockResponse(
        await Promise.all(
          adminStorage.categories.list().map(async (category) => ({
            ...category,
            imageUrl: await storageService.resolveImageUrl(
              category.imageUrl,
              category.imagePath,
            ),
          })),
        ),
      );
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

      const localCategories = new Map(
        adminStorage.categories
          .list()
          .map((category) => [category.slug, category]),
      );
      const categories = (data ?? []).map<ShopCategory>((category) => ({
        description: category.description ?? "",
        imagePath:
          localCategories.get(category.slug)?.imagePath ??
          category.image_path,
        imageUrl: localCategories.get(category.slug)?.imagePath
          ? localCategories.get(category.slug)?.imageUrl ?? ""
          : category.image_url ?? "",
        name: category.name,
        slug: category.slug,
      }));

      return categories.length > 0
        ? supabaseResponse(
            await Promise.all(
              categories.map(async (category) => ({
                ...category,
                imageUrl: await storageService.resolveImageUrl(
                  category.imageUrl,
                  category.imagePath,
                ),
              })),
            ),
          )
        : mockResponse(shopCategories);
    } catch (error) {
      return fallbackAfterError(
        shopCategories,
        error,
        "We could not refresh the product categories right now.",
      );
    }
  },

  async create(input: {
    name: string;
    slug: string;
    description: string;
  }): Promise<ServiceResponse<ShopCategory>> {
    const localFallback = () =>
      adminStorage.categories.create({
        description: input.description,
        name: input.name,
        slug: input.slug,
      });

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          active: true,
          description: input.description,
          name: input.name,
          slug: input.slug,
        })
        .select("*")
        .single();

      if (error) throw error;

      localFallback();

      return supabaseResponse({
        description: data.description ?? "",
        imagePath: data.image_path,
        imageUrl: data.image_url ?? "",
        name: data.name,
        slug: data.slug,
      });
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The category could not be saved to the database, so it was saved locally.",
      );
    }
  },

  async update(
    slug: string,
    input: Partial<{
      description: string;
      name: string;
      slug: string;
    }>,
  ): Promise<ServiceResponse<ShopCategory | null>> {
    const localFallback = () => adminStorage.categories.update(slug, input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const updates: {
        description?: string | null;
        name?: string;
        slug?: string;
      } = {};

      if (input.description !== undefined) updates.description = input.description;
      if (input.name !== undefined) updates.name = input.name;
      if (input.slug !== undefined) updates.slug = input.slug;

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("slug", slug)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      localFallback();

      return supabaseResponse(
        data
          ? {
              description: data.description ?? "",
              imagePath: data.image_path,
              imageUrl: data.image_url ?? "",
              name: data.name,
              slug: data.slug,
            }
          : null,
      );
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The category could not be updated in the database, so it was saved locally.",
      );
    }
  },

  async remove(slug: string): Promise<ServiceResponse<boolean>> {
    const localFallback = () => adminStorage.categories.remove(slug);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ active: false })
        .eq("slug", slug);

      if (error) throw error;

      localFallback();

      return supabaseResponse(true);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The category could not be deleted from the database, so it was removed locally.",
      );
    }
  },
  async updateImage(
    slug: ProductCategory,
    imageUrl: string,
    imagePath: string | null,
  ): Promise<ServiceResponse<ShopCategory | null>> {
    const storedUrl = imagePath?.startsWith("local/") ? imagePath : imageUrl;
    const localFallback = () =>
      adminStorage.categories.updateImage(slug, storedUrl, imagePath);

    if (!supabase || imagePath?.startsWith("local/")) {
      localFallback();
      const category = adminStorage.categories
        .list()
        .find((item) => item.slug === slug);
      return mockResponse(
        category
          ? {
              ...category,
              imageUrl: await storageService.resolveImageUrl(
                category.imageUrl,
                category.imagePath,
              ),
            }
          : null,
      );
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ image_path: imagePath, image_url: imageUrl })
        .eq("slug", slug)
        .select("*")
        .single();
      if (error) throw error;

      return supabaseResponse({
        description: data.description ?? "",
        imagePath: data.image_path,
        imageUrl: data.image_url ?? "",
        name: data.name,
        slug,
      });
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The category image could not be saved to the database, so it was kept locally.",
      );
    }
  },
};





