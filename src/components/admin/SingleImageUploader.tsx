import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageDeleteConfirm } from "@/components/admin/ImageDeleteConfirm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { UploadProgress } from "@/components/admin/UploadProgress";
import { storageService, type StorageBucket } from "@/services/storage.service";

interface SingleImageUploaderProps {
  alt: string;
  bucket: StorageBucket;
  folder: string;
  label: string;
  onChange: (url: string, path: string | null) => void | Promise<void>;
  path: string | null;
  url: string;
}

export function SingleImageUploader({
  alt,
  bucket,
  folder,
  label,
  onChange,
  path,
  url,
}: SingleImageUploaderProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function upload(file: File) {
    setFileName(file.name);
    setProgress(0);

    try {
      const response = await storageService.uploadImage({
        bucket,
        file,
        folder,
        onProgress: setProgress,
      });
      if (path && path !== response.data.path) {
        await storageService.deleteImage(bucket, path);
      }
      await onChange(response.data.url, response.data.path);
      if (response.warning) toast.warning(response.warning.message);
      toast.success(`${label} updated.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The image could not upload.",
      );
    } finally {
      setProgress(null);
      setFileName("");
    }
  }

  async function remove() {
    setIsDeleting(true);
    const response = await storageService.deleteImage(bucket, path);

    if (response.data) {
      await onChange("", null);
      setConfirmOpen(false);
      toast.success(`${label} removed.`);
    } else {
      toast.error(response.warning?.message ?? "The image could not be removed.");
    }
    setIsDeleting(false);
  }

  return (
    <div className="space-y-3">
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-maroon/10 bg-linen">
          <img
            alt={alt}
            className="aspect-[16/7] w-full object-cover"
            loading="lazy"
            src={url}
          />
          <button
            aria-label={`Delete ${label.toLowerCase()}`}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card text-destructive shadow-lift transition hover:bg-destructive hover:text-white"
            onClick={() => setConfirmOpen(true)}
            title={`Delete ${label.toLowerCase()}`}
            type="button"
          >
            <Trash2 aria-hidden="true" size={16} />
          </button>
        </div>
      ) : (
        <ImageUploader
          disabled={progress !== null}
          label={label}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file) void upload(file);
          }}
        />
      )}

      {progress !== null ? (
        <UploadProgress fileName={fileName} progress={progress} />
      ) : null}

      {url ? (
        <ImageUploader
          disabled={progress !== null}
          helperText="Choose a replacement image. JPG, PNG, or WebP up to 5MB."
          label={`Replace ${label.toLowerCase()}`}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file) void upload(file);
          }}
        />
      ) : null}

      <ImageDeleteConfirm
        imageName={label.toLowerCase()}
        isDeleting={isDeleting}
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
