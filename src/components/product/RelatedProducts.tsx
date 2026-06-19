import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import type { Product } from "@/types/product.types";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section>
      <SectionHeading
        description="Pieces selected to sit naturally alongside your current choice."
        eyebrow="Complete the Story"
        title="You may also appreciate"
      />
      <div className="mt-10">
        <ProductCarousel ariaLabel="Related products" products={products} />
      </div>
    </section>
  );
}
