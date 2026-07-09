import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
  type WheelEvent,
} from "react";
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
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const panStart = useRef<{ pointerId: number; x: number; y: number } | null>(
    null,
  );
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const hasPanned = useRef(false);
  const ignoreNextOpen = useRef(false);
  const selectedIndex = activeIndex ?? internalIndex;
  const activeImage = images[selectedIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

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

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!hasMultipleImages || touchStartX.current === null) {
        touchStartX.current = null;
        return;
      }

      const endX = event.changedTouches[0]?.clientX;
      if (endX === undefined) {
        touchStartX.current = null;
        return;
      }

      const deltaX = endX - touchStartX.current;
      touchStartX.current = null;

      if (Math.abs(deltaX) < 42) {
        return;
      }

      ignoreNextOpen.current = true;
      moveImage(deltaX > 0 ? -1 : 1);
      window.setTimeout(() => {
        ignoreNextOpen.current = false;
      }, 0);
    },
    [hasMultipleImages, moveImage],
  );

  const openPreview = useCallback(() => {
    if (ignoreNextOpen.current) {
      return;
    }

    setIsPreviewOpen(true);
  }, []);

  const resetZoom = useCallback(() => {
    setZoom({ scale: 1, x: 0, y: 0 });
    panStart.current = null;
    pinchStart.current = null;
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    resetZoom();
  }, [resetZoom]);

  const toggleZoom = useCallback(() => {
    setZoom((current) =>
      current.scale > 1
        ? { scale: 1, x: 0, y: 0 }
        : { scale: 2.25, x: 0, y: 0 },
    );
  }, []);

  const updateZoomScale = useCallback((nextScale: number) => {
    const scale = Math.min(3, Math.max(1, nextScale));
    setZoom((current) =>
      scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...current, scale },
    );
  }, []);

  const handlePreviewTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const first = event.touches[0];
        const second = event.touches[1];
        if (!first || !second) return;

        pinchStart.current = {
          distance: Math.hypot(
            first.clientX - second.clientX,
            first.clientY - second.clientY,
          ),
          scale: zoom.scale,
        };
        touchStartX.current = null;
        return;
      }

      touchStartX.current = event.touches[0]?.clientX ?? null;
    },
    [zoom.scale],
  );

  const handlePreviewTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2 || !pinchStart.current) {
      return;
    }

    const first = event.touches[0];
    const second = event.touches[1];
    if (!first || !second) return;

    event.preventDefault();
    const distance = Math.hypot(
      first.clientX - second.clientX,
      first.clientY - second.clientY,
    );
    updateZoomScale(
      pinchStart.current.scale * (distance / pinchStart.current.distance),
    );
  }, [updateZoomScale]);

  const handlePreviewTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (pinchStart.current) {
        if (event.touches.length < 2) {
          pinchStart.current = null;
        }
        return;
      }

      if (zoom.scale > 1) {
        touchStartX.current = null;
        return;
      }

      handleTouchEnd(event);
    },
    [handleTouchEnd, zoom.scale],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (zoom.scale <= 1) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      panStart.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      hasPanned.current = false;
    },
    [zoom.scale],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (zoom.scale <= 1 || panStart.current?.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const deltaX = event.clientX - panStart.current.x;
      const deltaY = event.clientY - panStart.current.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        hasPanned.current = true;
      }
      panStart.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      setZoom((current) => ({
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY,
      }));
    },
    [zoom.scale],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (panStart.current?.pointerId === event.pointerId) {
      panStart.current = null;
    }
  }, []);

  const handlePreviewImageTap = useCallback(() => {
    if (hasPanned.current) {
      hasPanned.current = false;
      return;
    }

    toggleZoom();
  }, [toggleZoom]);

  const handlePreviewWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const nextScale = zoom.scale + (event.deltaY < 0 ? 0.22 : -0.22);
      updateZoomScale(nextScale);
    },
    [updateZoomScale, zoom.scale],
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
        closePreview();
      }

      if (event.key === "ArrowLeft" && zoom.scale === 1) {
        moveImage(-1);
      }

      if (event.key === "ArrowRight" && zoom.scale === 1) {
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
  }, [closePreview, isPreviewOpen, moveImage, zoom.scale]);

  useEffect(() => {
    if (!isPreviewOpen || !hasMultipleImages) {
      return;
    }

    const hintKey = "house-of-patani-product-gallery-swipe-hint";
    if (window.sessionStorage.getItem(hintKey)) {
      return;
    }

    window.sessionStorage.setItem(hintKey, "seen");
    setShowSwipeHint(true);
    const timer = window.setTimeout(() => setShowSwipeHint(false), 2600);
    return () => window.clearTimeout(timer);
  }, [hasMultipleImages, isPreviewOpen]);

  useEffect(() => {
    resetZoom();
  }, [activeImage, resetZoom]);

  if (!activeImage) {
    return <div className="aspect-[4/5] rounded-lg bg-linen" />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
        <div className="order-2 flex snap-x gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible">
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
              key={`${image}-${index}`}
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
        <div className="group relative order-1 sm:order-2">
          <ProductImageZoom
            alt={`${productName}, image ${selectedIndex + 1}`}
            className="aspect-[4/5] shadow-elegant"
            onOpen={openPreview}
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
            src={activeImage}
          >
            {hasMultipleImages ? (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-maroon shadow-lift">
                {selectedIndex + 1} / {images.length}
              </span>
            ) : null}
          </ProductImageZoom>
          {hasMultipleImages ? (
            <>
              <IconButton
                aria-label="Previous product image"
                className="absolute left-4 top-1/2 hidden -translate-y-1/2 bg-ivory/90 text-maroon opacity-0 shadow-lift hover:bg-gold group-hover:opacity-100 md:inline-flex"
                onClick={() => moveImage(-1)}
              >
                <ChevronLeft aria-hidden="true" size={20} />
              </IconButton>
              <IconButton
                aria-label="Next product image"
                className="absolute right-4 top-1/2 hidden -translate-y-1/2 bg-ivory/90 text-maroon opacity-0 shadow-lift hover:bg-gold group-hover:opacity-100 md:inline-flex"
                onClick={() => moveImage(1)}
              >
                <ChevronRight aria-hidden="true" size={20} />
              </IconButton>
            </>
          ) : null}
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          aria-label={`${productName} image preview`}
          aria-modal="true"
          className="group fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/92 p-4 backdrop-blur-sm sm:p-8"
          onClick={closePreview}
          onTouchEnd={handlePreviewTouchEnd}
          onTouchMove={handlePreviewTouchMove}
          onTouchStart={handlePreviewTouchStart}
          ref={previewRef}
          role="dialog"
          tabIndex={-1}
        >
          <IconButton
            aria-label="Close image preview"
            className="fixed right-4 top-4 z-[95] min-h-11 min-w-11 bg-charcoal/70 text-ivory shadow-lift backdrop-blur-sm hover:bg-charcoal/85"
            onClick={closePreview}
            variant="ghost"
          >
            <X aria-hidden="true" size={20} />
          </IconButton>
          {hasMultipleImages ? (
            <p className="fixed left-1/2 top-5 z-[94] -translate-x-1/2 rounded-full bg-charcoal/70 px-3.5 py-1.5 text-sm font-semibold text-ivory shadow-lift backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </p>
          ) : null}
          {showSwipeHint ? (
            <p className="pointer-events-none fixed bottom-8 left-1/2 z-[94] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 animate-out fade-out duration-700 rounded-full bg-charcoal/70 px-4 py-2 text-center text-xs font-semibold text-ivory shadow-lift backdrop-blur-sm">
              &larr; Swipe left or right to view more photos &rarr;
            </p>
          ) : null}
          {images.length > 1 ? (
            <>
              <IconButton
                aria-label="Previous image"
                disabled={zoom.scale > 1}
                className="absolute left-3 hidden bg-charcoal/55 text-ivory opacity-0 shadow-lift backdrop-blur-sm transition hover:bg-charcoal/75 group-hover:opacity-100 sm:left-6 md:inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                  moveImage(-1);
                }}
                variant="ghost"
              >
                <ChevronLeft aria-hidden="true" size={22} />
              </IconButton>
              <IconButton
                aria-label="Next image"
                disabled={zoom.scale > 1}
                className="absolute right-3 hidden bg-charcoal/55 text-ivory opacity-0 shadow-lift backdrop-blur-sm transition hover:bg-charcoal/75 group-hover:opacity-100 sm:right-6 md:inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                  moveImage(1);
                }}
                variant="ghost"
              >
                <ChevronRight aria-hidden="true" size={22} />
              </IconButton>
            </>
          ) : null}
          <div
            className={cn(
              "group flex h-full w-full items-center justify-center overflow-hidden",
              zoom.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
            )}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handlePreviewWheel}
            role="presentation"
          >
            <img
              key={activeImage}
              alt={`${productName}, enlarged image ${selectedIndex + 1}`}
              className="max-h-[82vh] max-w-[92vw] animate-in select-none fade-in-0 zoom-in-95 duration-300 object-contain transition-transform sm:max-h-[88vh] sm:max-w-[88vw]"
              draggable={false}
              onClick={handlePreviewImageTap}
              src={activeImage}
              style={{
                transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                touchAction: zoom.scale > 1 ? "none" : "pan-y",
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
