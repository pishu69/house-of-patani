import { ImagePlus } from "lucide-react";
import { useId } from "react";

interface ImageUploaderProps {
  accept?: string;
  disabled?: boolean;
  helperText?: string;
  label?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
}

export function ImageUploader({
  accept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
  disabled = false,
  helperText = "JPG, JPEG, PNG, or WebP. Maximum 5MB each.",
  label = "Upload images",
  multiple = false,
  onFilesSelected,
}: ImageUploaderProps) {
  const inputId = useId();

  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-maroon/25 bg-linen/35 px-6 py-10 text-center transition hover:border-maroon hover:bg-linen/55 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
      htmlFor={inputId}
    >
      <ImagePlus aria-hidden="true" className="text-gold" size={30} />
      <span className="mt-3 text-sm font-semibold text-charcoal">{label}</span>
      <span className="mt-1 text-xs text-muted-foreground">
        {helperText}
      </span>
      <input
        accept={accept}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        multiple={multiple}
        onChange={(event) => {
          onFilesSelected?.(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
        type="file"
      />
    </label>
  );
}
