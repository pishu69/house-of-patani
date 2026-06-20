import { z } from "zod";

import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";

export type StorageBucket =
  | "banner-images"
  | "category-images"
  | "product-images"
  | "store-assets";

export interface UploadedImage {
  name: string;
  path: string | null;
  url: string;
}

export interface UploadImageOptions {
  bucket: StorageBucket;
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const imageFileSchema = z
  .custom<File>((value) => value instanceof File, "Choose a valid image file.")
  .refine(
    (file) =>
      ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      ),
    "Only JPG, JPEG, PNG, and WebP images are supported.",
  )
  .refine(
    (file) => /\.(jpe?g|png|webp)$/i.test(file.name),
    "The filename must end in .jpg, .jpeg, .png, or .webp.",
  )
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE,
    "Each image must be 5MB or smaller.",
  );

const LOCAL_PATH_PREFIX = "local/";
const LOCAL_DB_NAME = "house-of-patani-media";
const LOCAL_STORE_NAME = "images";
const localUrlCache = new Map<string, string>();

export function validateImageFile(file: File) {
  return imageFileSchema.safeParse(file);
}

function createLocalPath() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${LOCAL_PATH_PREFIX}${id}`;
}

function openLocalDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(LOCAL_STORE_NAME)) {
        request.result.createObjectStore(LOCAL_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function storeLocalFile(path: string, file: File) {
  const database = await openLocalDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_STORE_NAME, "readwrite");
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
    transaction.objectStore(LOCAL_STORE_NAME).put(file, path);
  });
  database.close();
}

async function getLocalFile(path: string) {
  const database = await openLocalDatabase();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database
      .transaction(LOCAL_STORE_NAME, "readonly")
      .objectStore(LOCAL_STORE_NAME)
      .get(path);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
  });
  database.close();
  return blob;
}

async function deleteLocalFile(path: string) {
  const database = await openLocalDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(LOCAL_STORE_NAME, "readwrite");
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
    transaction.objectStore(LOCAL_STORE_NAME).delete(path);
  });
  database.close();
  const cachedUrl = localUrlCache.get(path);
  if (cachedUrl) URL.revokeObjectURL(cachedUrl);
  localUrlCache.delete(path);
}

async function createLocalUpload(
  file: File,
  onProgress?: (progress: number) => void,
) {
  if (typeof indexedDB !== "undefined") {
    const path = createLocalPath();
    onProgress?.(10);
    await storeLocalFile(path, file);
    onProgress?.(90);
    const url = await storageService.resolveImageUrl(path, path);
    onProgress?.(100);
    return { name: file.name, path, url };
  }

  const url = await readAsDataUrl(file, onProgress);
  return { name: file.name, path: null, url };
}

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${baseName || "image"}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${extension}`;
}

function readAsDataUrl(
  file: File,
  onProgress?: (progress: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("LOCAL_IMAGE_READ_FAILED"));
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 90));
      }
    };
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("LOCAL_IMAGE_READ_FAILED"));
        return;
      }
      onProgress?.(100);
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  getPublicUrl(bucket: StorageBucket, path: string) {
    if (path.startsWith(LOCAL_PATH_PREFIX)) {
      return path;
    }
    if (!supabase) return path;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },

  async resolveImageUrl(url: string, path: string | null) {
    if (!path?.startsWith(LOCAL_PATH_PREFIX)) return url;
    const cachedUrl = localUrlCache.get(path);
    if (cachedUrl) return cachedUrl;
    if (typeof indexedDB === "undefined") return url;

    const blob = await getLocalFile(path);
    if (!blob) return url;
    const objectUrl = URL.createObjectURL(blob);
    localUrlCache.set(path, objectUrl);
    return objectUrl;
  },

  async uploadImage({
    bucket,
    file,
    folder = "uploads",
    onProgress,
  }: UploadImageOptions): Promise<ServiceResponse<UploadedImage>> {
    const validation = validateImageFile(file);
    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message ?? "Invalid image.");
    }

    if (!supabase) {
      return mockResponse(await createLocalUpload(file, onProgress));
    }

    const path = `${folder}/${safeFileName(file.name)}`;

    try {
      onProgress?.(10);
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      onProgress?.(90);
      const url = this.getPublicUrl(bucket, path);
      onProgress?.(100);
      return supabaseResponse({ name: file.name, path, url });
    } catch (error) {
      const localUpload = await createLocalUpload(file, onProgress);
      return fallbackAfterError(
        localUpload,
        error,
        "The image could not be uploaded to storage, so a local copy was kept.",
      );
    }
  },

  async deleteImage(
    bucket: StorageBucket,
    path: string | null,
  ): Promise<ServiceResponse<boolean>> {
    if (!path) return mockResponse(true);
    if (path.startsWith(LOCAL_PATH_PREFIX)) {
      if (typeof indexedDB !== "undefined") await deleteLocalFile(path);
      return mockResponse(true);
    }
    if (!supabase) return mockResponse(true);

    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      return supabaseResponse(true);
    } catch (error) {
      return fallbackAfterError(
        false,
        error,
        "The stored image could not be deleted right now.",
      );
    }
  },
};
