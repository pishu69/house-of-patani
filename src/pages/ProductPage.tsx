import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ErrorState } from "@/components/common/ErrorState";
import { Seo } from "@/components/common/Seo";
import { DeliveryInformation } from "@/components/product/DeliveryInformation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { reviewService } from "@/services";
import type { ProductReview } from "@/types/review.types";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import {
  ProductTabs,
  type ProductTab,
} from "@/components/product/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { StockBadge } from "@/components/product/StockBadge";
import { ROUTES } from "@/constants/routes";
import { categoryNameBySlug } from "@/data/categories";
import { getProductExperience } from "@/data/product-experience";
import { useProductBySlug } from "@/hooks/useProductBySlug";
import { useProducts } from "@/hooks/useProducts";
import { showCartMutationToast } from "@/lib/cart-feedback";
import { createBreadcrumbSchema, absoluteUrl } from "@/lib/seo";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export function ProductPage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const productQuery = useProductBySlug(slug);
  const productsQuery = useProducts();
  const product = productQuery.data?.data ?? null;
  const reviewsQuery = useQuery({
  enabled: Boolean(product?.id),
  queryKey: ["product-reviews", product?.id],
  queryFn: () => reviewService.listByProduct(product?.id ?? ""),
});

const reviews: ProductReview[] =
  reviewsQuery.data?.data.map((review) => ({
    author: review.customer_name,
    comment: review.comment || "",
    createdAt: review.created_at,
    id: review.id,
    rating: review.rating,
    title: review.title || "",
  })) ?? [];
  const reviewCount = reviews.length;

const averageRating =
  reviewCount > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

const displayRating = reviewCount > 0 ? averageRating : product?.rating ?? 0;
const displayReviewCount =
  reviewCount > 0 ? reviewCount : product?.reviewCount ?? 0;
  const productSeoSchemas = useMemo(() => {
    if (!product) {
      return [];
    }

    const categoryName = categoryNameBySlug[product.category] ?? product.category;

    return [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingCount: product.reviewCount,
          ratingValue: product.rating,
        },
        brand: {
          "@type": "Brand",
          name: "House of Patani",
        },
        category: categoryName,
        description: product.description,
        image: product.images.map(absoluteUrl),
        name: product.name,
        offers: {
          "@type": "Offer",
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          price: product.price,
          priceCurrency: "INR",
          url: absoluteUrl(`/product/${product.slug}`),
        },
        sku: product.sku,
        url: absoluteUrl(`/product/${product.slug}`),
      },
      createBreadcrumbSchema([
        { name: "Home", path: ROUTES.HOME },
        { name: "Shop", path: ROUTES.SHOP },
        {
          name: categoryName,
          path: `${ROUTES.SHOP}?category=${product.category}`,
        },
        { name: product.name, path: `/product/${product.slug}` },
      ]),
    ];
  }, [product]);
  const isWishlisted = useWishlistStore((state) =>
    product ? state.productIds.includes(product.id) : false,
  );
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const relatedProducts = (productsQuery.data?.data ?? []).filter((item) => product && item.category === product.category && item.id !== product.id && item.active).slice(0, 4);

  useEffect(() => {
    setActiveTab("description");
    setQuantity(1);
  }, [product?.id]);

  if (productQuery.isLoading) {
  return (
    <section className="bg-background py-20">
      <div className="section-shell">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 rounded bg-linen" />

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="aspect-square rounded-xl bg-linen" />

            <div className="space-y-4">
              <div className="h-10 w-3/4 rounded bg-linen" />
              <div className="h-6 w-32 rounded bg-linen" />
              <div className="h-5 w-full rounded bg-linen" />
              <div className="h-5 w-5/6 rounded bg-linen" />
              <div className="h-12 w-48 rounded bg-linen" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
  if (!product) {
    return (
      <>
        <Seo
          canonicalPath={`/product/${slug ?? ""}`}
          description="This product is not available in the current House of Patani collection."
          noIndex
          title="Product Not Found"
        />
        <section className="bg-background py-20">
          <div className="section-shell">
            <ErrorState
              action={
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory"
                  to={ROUTES.SHOP}
                >
                  Return to Shop
                </Link>
              }
              description="This piece is no longer available in the current collection."
              title="Product not found"
            />
          </div>
        </section>
      </>
    );
  }

  const categoryName = categoryNameBySlug[product.category] ?? product.category;
  const experience = getProductExperience(product) ?? {
    longDescription: product.description,
    detailNotes: "",
    careInstructions: "",
  };
  
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  const stockStatus =
    product.stock === 0
      ? "out-of-stock"
      : product.stock <= 6
        ? "low-stock"
        : "in-stock";

  const tabs: ProductTab[] = [
    {
      content: <p>{product.longDescription || product.description || experience.longDescription}</p>,
      id: "description",
      label: "Description",
    },
    {
      content: (
        <div className="space-y-3">
          <p>{product.details || experience.detailNotes}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-charcoal">Category</dt>
              <dd>{categoryName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-charcoal">Craft tags</dt>
              <dd>{product.tags.join(", ")}</dd>
            </div>
          </dl>
        </div>
      ),
      id: "details",
      label: "Details",
    },
    {
      content: <p>{product.careInstructions || experience.careInstructions}</p>,
      id: "care",
      label: "Care Instructions",
    },
    {
      content: (
        <div className="space-y-3">
  {(product.shippingReturns ||
    `Orders are carefully packed and typically dispatched within 2–4 business days.

Easy returns are available within 7 days of delivery for eligible unused products in their original condition.`)
    .split("\n\n")
    .map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}
</div>
      ),
      id: "shipping",
      label: "Shipping & Returns",
    },
  ];

  const handleAddToCart = () => {
    const result = addItem(product.id, quantity);
    showCartMutationToast(product.name, result);

    if (result.success) {
      openDrawer();
    }
  };

  const handleWishlistToggle = () => {
    const nextValue = toggleWishlist(product.id);
    toast(nextValue ? "Added to wishlist" : "Removed from wishlist", {
      description: product.name,
    });
  };

  return (
    <>
      <Seo
        canonicalPath={`/product/${product.slug}`}
        description={`${product.description} Shop ${product.name} from House of Patani's ${categoryName.toLowerCase()} collection.`}
        image={product.images[0] ?? "/favicon.svg"}
        imageAlt={product.name}
        jsonLd={productSeoSchemas}
        title={product.name}
        type="product"
      />
      <article className="bg-background">
      <section className="py-8 sm:py-10">
        <div className="section-shell">
          <Breadcrumb
            items={[
              { label: "Shop", to: ROUTES.SHOP },
              {
                label: categoryName,
                to: `${ROUTES.SHOP}?category=${product.category}`,
              },
              { label: product.name },
            ]}
          />
          <div className="mt-7 grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
            <div className="lg:sticky lg:top-28">
              <ProductInfo
                actions={
                  <div className="space-y-6">
                    <ProductPurchaseActions
                      isWishlisted={isWishlisted}
                      onAddToCart={handleAddToCart}
                      onQuantityChange={setQuantity}
                      onStockLimit={() =>
                        toast.error("Stock limit reached", {
                          description: `Only ${product.stock} of ${product.name} are currently available.`,
                        })
                      }
                      onWishlistToggle={handleWishlistToggle}
                      quantity={quantity}
                      stock={product.stock}
                    />
                    <DeliveryInformation product={product} />
                  </div>
                }
                badge={
                  product.newArrival
                    ? "New Arrival"
                    : product.featured
                      ? "Featured"
                      : product.bestSeller
                        ? "Best Seller"
                        : undefined
                }
                category={categoryName}
                description={product.description}
                discount={discount}
                name={product.name}
                originalPrice={product.originalPrice}
                price={product.price}
                rating={displayRating}
reviewCount={displayReviewCount}
                stock={<StockBadge status={stockStatus} />}
                tags={product.tags}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-maroon/10 bg-linen/45 py-12 sm:py-16">
        <div className="section-shell max-w-5xl">
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
          />
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="section-shell">
          <ReviewsSection
            rating={displayRating}
reviewCount={displayReviewCount}
            reviews={reviews}
          />
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="bg-linen/55 py-16 sm:py-20 lg:py-24">
          <div className="section-shell">
            <RelatedProducts products={relatedProducts} />
          </div>
        </section>
      ) : null}
      </article>
    </>
  );
}







