import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageZoomProps {
  alt: string;
  className?: string;
  src: string;
}

export function ProductImageZoom({
  alt,
  className,
  src,
}: ProductImageZoomProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-linen",
        className,
      )}
    >
      <img
        alt={alt}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        src={src}
      />
      <span className="pointer-events-none absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-maroon opacity-0 shadow-lift transition group-hover:opacity-100">
        <ZoomIn aria-hidden="true" size={18} />
      </span>
    </div>
  );
}
