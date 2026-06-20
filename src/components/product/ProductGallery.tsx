import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/common/IconButton";
import { ProductImageZoom } from "@/components/product/ProductImageZoom";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  activeIndex?: number;
  images: string[];
  onImageChange?: (index: number) => void;
  productName: string;
}

export function ProductGallery({
  activeIndex,
  images,
  onImageChange,
  productName,
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const selectedIndex = activeIndex ?? internalIndex;
  const activeImage = images[selectedIndex] ?? images[0];

  const selectImage = useCallback(
    (index: number) => {
      setInternalIndex(index);
      onImageChange?.(index);
    },
    [onImageChange],
  );

  const moveImage = useCallback(
    (direction: -1 | 1) => {
      if (images.length === 0) {
        return;
      }

      selectImage((selectedIndex + direction + images.length) % images.length);
    },
    [images.length, selectImage, selectedIndex],
  );

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }

      if (event.key === "ArrowLeft") {
        moveImage(-1);
      }

      if (event.key === "ArrowRight") {
        moveImage(1);
      }

      if (event.key === "Tab" && previewRef.current) {
        const focusableElements = Array.from(
          previewRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previewRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isPreviewOpen, moveImage]);

  if (!activeImage) {
    return <div className="aspect-[4/5] rounded-lg bg-linen" />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
        <div className="order-2 flex snap-x gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col">
          {images.map((image, index) => (
            <button
              aria-label={`View ${productName} image ${index + 1}`}
              aria-pressed={index === selectedIndex}
              className={cn(
                "h-20 w-20 shrink-0 snap-start overflow-hidden rounded-md border-2 transition",
                index === selectedIndex
                  ? "border-maroon"
                  : "border-transparent hover:border-gold/60",
              )}
              key={image}
              onClick={() => selectImage(index)}
              type="button"
            >
              <img
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                src={image}
              />
            </button>
          ))}
        </div>
        <ProductImageZoom
          alt={`${productName}, image ${selectedIndex + 1}`}
          className="order-1 aspect-[4/5] shadow-elegant sm:order-2"
          onOpen={() => setIsPreviewOpen(true)}
          src={activeImage}
        />
      </div>

      {isPreviewOpen ? (
        <div
          aria-label={`${productName} image preview`}
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/90 p-4 sm:p-8"
          ref={previewRef}
          role="dialog"
          tabIndex={-1}
        >
          <IconButton
            aria-label="Close image preview"
            className="absolute right-4 top-4 border-ivory/25 text-ivory hover:bg-ivory/10"
            onClick={() => setIsPreviewOpen(false)}
            variant="outline"
          >
            <X aria-hidden="true" size={20} />
          </IconButton>
          {images.length > 1 ? (
            <>
              <IconButton
                aria-label="Previous image"
                className="absolute left-3 border-ivory/25 text-ivory hover:bg-ivory/10 sm:left-6"
                onClick={() => moveImage(-1)}
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" size={22} />
              </IconButton>
              <IconButton
                aria-label="Next image"
                className="absolute right-3 border-ivory/25 text-ivory hover:bg-ivory/10 sm:right-6"
                onClick={() => moveImage(1)}
                variant="outline"
              >
                <ChevronRight aria-hidden="true" size={22} />
              </IconButton>
            </>
          ) : null}
          <img
            alt={`${productName}, enlarged image ${selectedIndex + 1}`}
            className="max-h-[88vh] max-w-[88vw] object-contain"
            src={activeImage}
          />
          <p className="absolute bottom-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/70">
            {selectedIndex + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
