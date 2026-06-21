import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ErrorState } from "@/components/common/ErrorState";
import { Seo } from "@/components/common/Seo";
import { DeliveryInformation } from "@/components/product/DeliveryInformation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
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
import {
  getProductExperience,
  getProductReviews,
} from "@/data/product-experience";
import { useProductBySlug } from "@/hooks/useProductBySlug";
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
  const product = productQuery.data?.data ?? null;
  const productSeoSchemas = useMemo(() => {
    if (!product) {
      return [];
    }

    const categoryName = categoryNameBySlug[product.category];

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

  const relatedProducts: [] = [];

  useEffect(() => {
    setActiveTab("description");
    setQuantity(1);
  }, [product?.id]);

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

  const categoryName = categoryNameBySlug[product.category];
  const experience = getProductExperience(product);
  const reviews = getProductReviews(product);
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
      content: <p>{product.description || experience.longDescription}</p>,
      id: "description",
      label: "Description",
    },
    {
      content: (
        <div className="space-y-3">
          <p>{experience.detailNotes}</p>
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
      content: <p>{experience.careInstructions}</p>,
      id: "care",
      label: "Care Instructions",
    },
    {
      content: (
        <div className="space-y-3">
          <p>
            Orders are carefully packed and typically dispatched within 2-4
            business days.
          </p>
          <p>
            Easy returns are available within 7 days of delivery for eligible
            unused products in their original condition.
          </p>
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
                    <DeliveryInformation />
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
                rating={product.rating}
                reviewCount={product.reviewCount}
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
            rating={product.rating}
            reviewCount={product.reviewCount}
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

