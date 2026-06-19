import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { CatalogProduct } from "@/types/product.types";

interface RelatedProductsProps {
  products: CatalogProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section>
      <SectionHeading
        description="Pieces selected to sit naturally alongside your current choice."
        eyebrow="Complete the Story"
        title="You may also appreciate"
      />
      <ProductGrid className="mt-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </section>
  );
}
