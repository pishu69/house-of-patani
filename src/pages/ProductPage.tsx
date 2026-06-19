import { Check, Heart, Truck, type LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Divider } from "@/components/common/Divider";
import { ErrorState } from "@/components/common/ErrorState";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { StockBadge } from "@/components/product/StockBadge";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Button } from "@/components/ui/button";
import { categoryNameBySlug } from "@/data/categories";
import { products } from "@/data/products";
import { ROUTES } from "@/constants/routes";

interface ProductBenefit {
  Icon: LucideIcon;
  text: string;
}

const productBenefits: ProductBenefit[] = [
  {
    Icon: Check,
    text: "Crafted with considered materials",
  },
  {
    Icon: Truck,
    text: "Elegant delivery presentation",
  },
  {
    Icon: Heart,
    text: "Designed for keepsake value",
  },
];

export function ProductPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.slug === productId);

  if (!product) {
    return (
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
    );
  }

  const stockStatus =
    product.stock === 0
      ? "out-of-stock"
      : product.stock <= 6
        ? "low-stock"
        : "in-stock";

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="section-shell">
        <Breadcrumb
          items={[
            { label: "Shop", to: ROUTES.SHOP },
            {
              label: categoryNameBySlug[product.category],
              to: `${ROUTES.SHOP}?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} />
          <div className="flex flex-col justify-center">
            <ProductInfo
              actions={
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <QuantitySelector quantity={1} />
                    <Button
                      className="min-w-44 flex-1"
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <WishlistButton />
                  </div>
                  <Divider />
                  <div className="grid gap-3">
                    {productBenefits.map(({ Icon, text }) => (
                      <div
                        className="flex items-center gap-3 text-sm"
                        key={text}
                      >
                        <span className="rounded-full bg-gold/15 p-2 text-maroon">
                          <Icon aria-hidden="true" size={17} />
                        </span>
                        <span className="text-muted-foreground">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }
              badge={
                product.newArrival
                  ? "New Arrival"
                  : product.featured
                    ? "Featured"
                    : categoryNameBySlug[product.category]
              }
              description={product.description}
              name={product.name}
              price={product.price}
              rating={product.rating}
              reviewCount={product.reviewCount}
              stock={<StockBadge status={stockStatus} />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
