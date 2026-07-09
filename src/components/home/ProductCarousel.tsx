import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/components/common/IconButton";
import { ProductCard } from "@/components/shop/ProductCard";
import type { CatalogProduct } from "@/types/product.types";

interface ProductCarouselProps {
  ariaLabel?: string;
  products: CatalogProduct[];
}

export function ProductCarousel({
  ariaLabel = "Products",
  products,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      behavior: "smooth",
      left: direction * Math.min(trackRef.current.clientWidth, 420),
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <IconButton
          aria-label="Previous products"
          onClick={() => scroll(-1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </IconButton>
        <IconButton
          aria-label="Next products"
          onClick={() => scroll(1)}
          size="sm"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" size={18} />
        </IconButton>
      </div>
      <div
        aria-label={ariaLabel}
        className="grid snap-x snap-mandatory auto-cols-[44%] grid-flow-col gap-3 overflow-x-auto pb-4 sm:auto-cols-[31%] sm:gap-4 lg:auto-cols-[23%] xl:auto-cols-[18.5%]"
        ref={trackRef}
        role="region"
        tabIndex={0}
      >
        {products.map((product) => (
          <div className="snap-start" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
