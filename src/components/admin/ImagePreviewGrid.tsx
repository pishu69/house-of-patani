import {
  ArrowLeft,
  ArrowRight,
  Star,
  Trash2,
} from "lucide-react";

import { PrimaryImageBadge } from "@/components/admin/PrimaryImageBadge";
import type { ProductMedia } from "@/types/product.types";

interface ImagePreviewGridProps {
  images: ProductMedia[];
  onAltTextChange: (id: string, altText: string) => void;
  onDelete: (image: ProductMedia) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onSetPrimary: (id: string) => void;
}

export function ImagePreviewGrid({
  images,
  onAltTextChange,
  onDelete,
  onMove,
  onSetPrimary,
}: ImagePreviewGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((image, index) => (
        <article
          className="overflow-hidden rounded-lg border border-maroon/10 bg-background"
          key={image.id}
        >
          <div className="relative aspect-[4/3] bg-linen">
            <img
              alt={image.altText}
              className="h-full w-full object-cover"
              loading="lazy"
              src={image.url}
            />
            {image.isPrimary ? (
              <span className="absolute left-3 top-3">
                <PrimaryImageBadge />
              </span>
            ) : null}
          </div>
          <div className="space-y-3 p-3">
            <label className="block text-xs font-semibold text-charcoal">
              Alt text
              <input
                className="mt-1 h-9 w-full rounded-md border border-maroon/15 bg-card px-3 text-sm font-normal"
                maxLength={160}
                onChange={(event) =>
                  onAltTextChange(image.id, event.target.value)
                }
                value={image.altText}
              />
            </label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  aria-label={`Move image ${index + 1} left`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition hover:bg-maroon/5 disabled:opacity-35"
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                  title="Move left"
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                </button>
                <button
                  aria-label={`Move image ${index + 1} right`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition hover:bg-maroon/5 disabled:opacity-35"
                  disabled={index === images.length - 1}
                  onClick={() => onMove(index, index + 1)}
                  title="Move right"
                  type="button"
                >
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={`Set image ${index + 1} as primary`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-maroon transition hover:bg-maroon/5 disabled:opacity-50"
                  disabled={image.isPrimary}
                  onClick={() => onSetPrimary(image.id)}
                  title="Set as primary"
                  type="button"
                >
                  <Star aria-hidden="true" size={16} />
                </button>
                <button
                  aria-label={`Delete image ${index + 1}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive transition hover:bg-destructive/5"
                  onClick={() => onDelete(image)}
                  title="Delete image"
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
