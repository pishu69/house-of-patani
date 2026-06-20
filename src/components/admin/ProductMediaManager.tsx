import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ImageDeleteConfirm } from "@/components/admin/ImageDeleteConfirm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SortableImageList } from "@/components/admin/SortableImageList";
import { UploadProgress } from "@/components/admin/UploadProgress";
import {
  productImageService,
  storageService,
} from "@/services";
import { validateImageFile } from "@/services/storage.service";
import type { ProductMedia } from "@/types/product.types";

interface ProductMediaManagerProps {
  images: ProductMedia[];
  isUploading: boolean;
  onChange: (images: ProductMedia[]) => void;
  onUploadingChange: (isUploading: boolean) => void;
  productId?: string | undefined;
  productName: string;
}

interface UploadState {
  fileName: string;
  id: string;
  progress: number;
}

function createMediaId() {
  return `media-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ProductMediaManager({
  images,
  isUploading,
  onChange,
  onUploadingChange,
  productId,
  productName,
}: ProductMediaManagerProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [imageToDelete, setImageToDelete] = useState<ProductMedia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const objectUrls = useRef(new Set<string>());

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    },
    [],
  );

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    onUploadingChange(true);
    let workingImages = images;

    for (const file of files) {
      const validation = validateImageFile(file);

      if (!validation?.success) {
        toast.error(
          validation?.error.issues[0]?.message ?? "This image is invalid.",
          { description: file.name },
        );
        continue;
      }

      const id = createMediaId();
      const previewUrl = URL.createObjectURL(file);
      objectUrls.current.add(previewUrl);
      const pendingImage: ProductMedia = {
        altText: productName
          ? `${productName} view ${images.length + 1}`
          : file.name.replace(/\.[^/.]+$/, ""),
        id,
        isPrimary: workingImages.length === 0,
        position: workingImages.length,
        storagePath: null,
        url: previewUrl,
      };
      workingImages = [...workingImages, pendingImage];
      onChange(workingImages);
      setUploads((current) => [
        ...current,
        { fileName: file.name, id, progress: 0 },
      ]);

      try {
        const response = await storageService.uploadImage({
          bucket: "product-images",
          file,
          folder: productId ?? "drafts",
          onProgress: (progress) =>
            setUploads((current) =>
              current.map((upload) =>
                upload.id === id ? { ...upload, progress } : upload,
              ),
            ),
        });
        workingImages = workingImages.map((image) =>
            image.id === id
              ? {
                  ...image,
                  storagePath: response.data.path,
                  url: response.data.url,
                }
              : image,
          );
        onChange(workingImages);
        if (response.warning) {
          toast.warning(response.warning.message);
        }
      } catch (error) {
        workingImages = workingImages.filter((image) => image.id !== id);
        onChange(workingImages);
        toast.error(
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
          { description: file.name },
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
        objectUrls.current.delete(previewUrl);
        setUploads((current) =>
          current.filter((upload) => upload.id !== id),
        );
      }
    }

    onUploadingChange(false);
  }

  async function confirmDelete() {
    if (!imageToDelete) return;
    setIsDeleting(true);

    const remaining = images
      .filter((image) => image.id !== imageToDelete.id)
      .map((image, index) => ({
        ...image,
        isPrimary: index === 0,
        position: index,
      }));

    try {
      if (productId) {
        const response = await productImageService.deleteImage(
          productId,
          imageToDelete,
          remaining,
        );
        onChange(response.data);
        if (response.warning) toast.warning(response.warning.message);
      } else {
        await storageService.deleteImage(
          "product-images",
          imageToDelete.storagePath,
        );
        onChange(remaining);
      }
      setImageToDelete(null);
      toast.success("Image deleted.");
    } catch {
      toast.error("The image could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        disabled={isUploading}
        label="Upload product images"
        multiple
        onFilesSelected={(files) => void uploadFiles(files)}
      />

      {uploads.length > 0 ? (
        <div className="space-y-2" aria-live="polite">
          {uploads.map((upload) => (
            <UploadProgress
              fileName={upload.fileName}
              key={upload.id}
              progress={upload.progress}
            />
          ))}
        </div>
      ) : null}

      {images.length > 0 ? (
        <SortableImageList
          images={images}
          onAltTextChange={(id, altText) =>
            onChange(
              images.map((image) =>
                image.id === id ? { ...image, altText } : image,
              ),
            )
          }
          onDelete={setImageToDelete}
          onMove={(sourceIndex, targetIndex) =>
            onChange(
              productImageService.reorderImages(
                images,
                sourceIndex,
                targetIndex,
              ),
            )
          }
          onSetPrimary={(id) =>
            onChange(productImageService.setPrimaryImage(images, id))
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No product images yet. The product can still be saved and completed
          later.
        </p>
      )}

      <ImageDeleteConfirm
        imageName={imageToDelete?.altText || "this image"}
        isDeleting={isDeleting}
        isOpen={imageToDelete !== null}
        onCancel={() => setImageToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
