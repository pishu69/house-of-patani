import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { createImageSrcSet } from "@/utils/image";

interface ProductImageZoomProps {
  alt: string;
  className?: string;
  onOpen?: () => void;
  src: string;
}

export function ProductImageZoom({
  alt,
  className,
  onOpen,
  src,
}: ProductImageZoomProps) {
  return (
    <button
      aria-label={`Open larger preview of ${alt}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg bg-linen text-left",
        className,
      )}
      onClick={onOpen}
      type="button"
    >
      <img
        alt={alt}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        decoding="async"
        fetchPriority="high"
        loading="eager"
        sizes="(min-width: 1024px) 52vw, 100vw"
        src={src}
        srcSet={createImageSrcSet(src, [640, 960, 1280, 1600])}
      />
      <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-maroon shadow-lift transition group-hover:bg-gold group-hover:text-charcoal">
        <ZoomIn aria-hidden="true" size={18} />
      </span>
    </button>
  );
}
