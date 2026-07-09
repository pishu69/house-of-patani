import { ZoomIn } from "lucide-react";
import type { ReactNode, TouchEventHandler } from "react";
import { cn } from "@/lib/utils";
import { createImageSrcSet } from "@/utils/image";

interface ProductImageZoomProps {
  alt: string;
  children?: ReactNode;
  className?: string;
  onOpen?: () => void;
  onTouchEnd?: TouchEventHandler<HTMLButtonElement>;
  onTouchStart?: TouchEventHandler<HTMLButtonElement>;
  src: string;
}

export function ProductImageZoom({
  alt,
  children,
  className,
  onOpen,
  onTouchEnd,
  onTouchStart,
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
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
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
      {children}
    </button>
  );
}
