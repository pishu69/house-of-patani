import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { useProducts } from "@/hooks/useProducts";
import { reviewService } from "@/services";

export function FeaturedProductsSection() {
  const productsQuery = useProducts();

  const reviewsQuery = useQuery({
    queryKey: ["home-review-stats"],
    queryFn: reviewService.listAll,
    staleTime: 5 * 60 * 1000,
  });

  const approvedReviews =
    reviewsQuery.data?.data.filter((review) => review.approved) ?? [];

  const products = productsQuery.data?.data ?? [];

  const productsWithRatings = products.map((product) => {
    const productReviews = approvedReviews.filter(
      (review) => review.product_id === product.id,
    );

    if (productReviews.length === 0) {
      return {
        ...product,
        rating: 0,
        reviewCount: 0,
      };
    }

    const averageRating =
      productReviews.reduce((sum, review) => sum + review.rating, 0) /
      productReviews.length;

    return {
      ...product,
      rating: averageRating,
      reviewCount: productReviews.length,
    };
  });

  const featuredProducts = productsWithRatings
    .filter((product) => product.featured && product.active)
    .slice(0, 8);

  if (productsQuery.isLoading || reviewsQuery.isLoading) {
    return null;
  }

  if (featuredProducts.length === 0) {
    return null;
  }

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