import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import { storageService } from "@/services/storage.service";
import type { ProductImageRow } from "@/types/database.types";
import type { ProductMedia } from "@/types/product.types";

function normalizeMedia(media: ProductMedia[]) {
  const primaryIndex = Math.max(
    0,
    media.findIndex((image) => image.isPrimary),
  );

  return media.map((image, index) => ({
    ...image,
    isPrimary: index === primaryIndex,
    position: index,
  }));
}

function mapRow(row: ProductImageRow): ProductMedia {
  return {
    altText: row.alt_text ?? "",
    id: row.id,
    isPrimary: row.is_primary,
    position: row.position,
    storagePath: row.storage_path,
    url: row.image_url,
  };
}

export const productImageService = {
  async list(productId: string): Promise<ServiceResponse<ProductMedia[]>> {
    const fallbackMedia =
      adminStorage.productMedia.get(productId) ??
      adminStorage.products.list().find((product) => product.id === productId)
        ?.media ??
      [];
    const fallback = await Promise.all(
      fallbackMedia.map(async (image) => ({
        ...image,
        url: await storageService.resolveImageUrl(
          image.url,
          image.storagePath,
        ),
      })),
    );

    if (!supabase) return mockResponse(fallback);

    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("position");
      if (error) throw error;
      return supabaseResponse((data ?? []).map(mapRow));
    } catch (error) {
      return fallbackAfterError(
        fallback,
        error,
        "Product images could not be refreshed right now.",
      );
    }
  },

  async replaceAll(
    productId: string,
    media: ProductMedia[],
  ): Promise<ServiceResponse<ProductMedia[]>> {
    const normalized = normalizeMedia(media);
    const storedMedia = normalized.map((image) => ({
      ...image,
      url: image.storagePath?.startsWith("local/")
        ? image.storagePath
        : image.url,
    }));

    if (
      !supabase ||
      normalized.some((image) => image.storagePath?.startsWith("local/"))
    ) {
      adminStorage.products.setMedia(productId, storedMedia);
      return mockResponse(normalized);
    }

    try {
      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);
      if (deleteError) throw deleteError;

      if (normalized.length > 0) {
        const { error: insertError } = await supabase
          .from("product_images")
          .insert(
            normalized.map((image) => ({
              alt_text: image.altText,
              image_url: image.url,
              is_primary: image.isPrimary,
              position: image.position,
              product_id: productId,
              storage_path: image.storagePath,
            })),
          );
        if (insertError) throw insertError;
      }

      return supabaseResponse(normalized);
    } catch (error) {
      adminStorage.products.setMedia(productId, storedMedia);
      return fallbackAfterError(
        normalized,
        error,
        "Image details could not be saved to the database, so they were kept locally.",
      );
    }
  },

  reorderImages(media: ProductMedia[], sourceIndex: number, targetIndex: number) {
    const next = [...media];
    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) return media;
    next.splice(targetIndex, 0, moved);
    return normalizeMedia(next);
  },

  setPrimaryImage(media: ProductMedia[], imageId: string) {
    const selected = media.find((image) => image.id === imageId);
    if (!selected) return media;
    return normalizeMedia([
      { ...selected, isPrimary: true },
      ...media
        .filter((image) => image.id !== imageId)
        .map((image) => ({ ...image, isPrimary: false })),
    ]);
  },

  async deleteImage(
    productId: string,
    image: ProductMedia,
    remainingMedia: ProductMedia[],
  ) {
    const storageResult = await storageService.deleteImage(
      "product-images",
      image.storagePath,
    );
    const metadataResult = await this.replaceAll(productId, remainingMedia);

    return {
      data: metadataResult.data,
      source:
        storageResult.source === "supabase" &&
        metadataResult.source === "supabase"
          ? ("supabase" as const)
          : ("mock" as const),
      warning: storageResult.warning ?? metadataResult.warning,
    };
  },
};
