import { ImagePlus } from "lucide-react";
import { useId } from "react";

interface ImageUploaderProps {
  accept?: string;
  label?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
}

export function ImageUploader({
  accept = "image/*",
  label = "Upload images",
  multiple = false,
  onFilesSelected,
}: ImageUploaderProps) {
  const inputId = useId();

  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-maroon/25 bg-linen/35 px-6 py-10 text-center transition hover:border-maroon hover:bg-linen/55"
      htmlFor={inputId}
    >
      <ImagePlus aria-hidden="true" className="text-gold" size={30} />
      <span className="mt-3 text-sm font-semibold text-charcoal">{label}</span>
      <span className="mt-1 text-xs text-muted-foreground">
        PNG, JPG, or WebP
      </span>
      <input
        accept={accept}
        className="sr-only"
        id={inputId}
        multiple={multiple}
        onChange={(event) =>
          onFilesSelected?.(Array.from(event.target.files ?? []))
        }
        type="file"
      />
    </label>
  );
}
