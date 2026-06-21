import { SectionHeader } from "@/components/common/SectionHeader";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { products } from "@/data/products";

const featuredProducts = products
  .filter((product) => product.featured)
  .slice(0, 8);

export function FeaturedProductsSection() {
  return (
    <section className="bg-linen/75 py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeader
          description="A considered edit of signature pieces, selected for their texture, warmth, and enduring presence."
          eyebrow="Featured Edit"
          title="Objects with a sense of lineage"
        />
        <div className="mt-8 sm:mt-10">
          <ProductCarousel
            ariaLabel="Featured products"
            products={featuredProducts}
          />
        </div>
      </div>
    </section>
  );
}
