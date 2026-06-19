import { ProductImageZoom } from "@/components/product/ProductImageZoom";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  activeIndex?: number;
  images: string[];
  onImageChange?: (index: number) => void;
  productName: string;
}

export function ProductGallery({
  activeIndex = 0,
  images,
  onImageChange,
  productName,
}: ProductGalleryProps) {
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return <div className="aspect-[4/5] rounded-lg bg-linen" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
        {images.map((image, index) => (
          <button
            aria-label={`View ${productName} image ${index + 1}`}
            className={cn(
              "h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition",
              index === activeIndex
                ? "border-maroon"
                : "border-transparent hover:border-gold/60",
            )}
            key={image}
            onClick={() => onImageChange?.(index)}
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
        alt={productName}
        className="order-1 aspect-[4/5] shadow-elegant sm:order-2"
        src={activeImage}
      />
    </div>
  );
}
