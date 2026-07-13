import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/common/Badge";
import { IconButton } from "@/components/common/IconButton";
import { RatingStars } from "@/components/common/RatingStars";
import { StockBadge } from "@/components/product/StockBadge";
import { Button } from "@/components/ui/button";
import { categoryNameBySlug } from "@/data/categories";
import { showCartMutationToast } from "@/lib/cart-feedback";
import { mapAnalyticsItem, trackAddToCart, trackWishlist } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency } from "@/utils";
import { createImageSrcSet } from "@/utils/image";

interface ProductCardProps {
  isWishlisted?: boolean;
  onAddToCart?: (product: CatalogProduct) => void;
  onWishlistToggle?: (product: CatalogProduct) => void;
  product: CatalogProduct;
}

function ProductCardComponent({
  isWishlisted = false,
  onAddToCart,
  onWishlistToggle,
  product,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const storedWishlisted = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const resolvedWishlisted = onWishlistToggle
    ? isWishlisted
    : storedWishlisted;
  const imageUrl = product.images[0];
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const result = addItem(product.id);
    showCartMutationToast(product.name, result);

    if (result.success) {
      trackAddToCart(mapAnalyticsItem(product), { currency: "INR", value: product.price });
      openDrawer();
    }
  };

  const handleWishlistToggle = () => {
    if (onWishlistToggle) {
      onWishlistToggle(product);
      return;
    }

    const active = toggleWishlist(product.id);
    if (active) trackWishlist(mapAnalyticsItem(product), { currency: "INR", value: product.price });
    toast(active ? "Added to wishlist" : "Removed from wishlist", {
      description: product.name,
    });
  };

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-lift transition duration-300 hover:border-gold/60 hover:shadow-elegant"
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-linen">
        {!imageLoaded && imageUrl ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-linen via-ivory to-linen" />
        ) : null}

        <Link
          aria-label={`View ${product.name}`}
          className="block h-full"
          to={`/product/${product.slug}`}
        >
          {imageUrl ? (
            <img
              alt={`${product.name} from House of Patani`}
              className={cn(
                "h-full w-full object-cover transition duration-700 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              decoding="async"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 33vw, 50vw"
              src={imageUrl}
              srcSet={createImageSrcSet(imageUrl, [360, 540, 720, 900])}
            />
          ) : null}
        </Link>

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
          {discount > 0 ? (
            <Badge className="px-2 py-0.5 text-[10px] shadow-lift sm:text-xs" variant="primary">
              {discount}% off
            </Badge>
          ) : null}
          {product.newArrival ? (
            <Badge className="px-2 py-0.5 text-[10px] shadow-lift sm:text-xs">New</Badge>
          ) : null}
        </div>

        <IconButton
          aria-label={
            resolvedWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-2 top-2 h-9 w-9 bg-ivory/92 shadow-lift hover:bg-ivory sm:right-3 sm:top-3"
          onClick={handleWishlistToggle}
          size="sm"
        >
          <Heart
            aria-hidden="true"
            className={cn(resolvedWishlisted && "fill-maroon text-maroon")}
            size={15}
          />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold sm:text-[11px]">
          {categoryNameBySlug[product.category]}
        </p>

        <Link className="mt-1.5" to={`/product/${product.slug}`}>
          <h2 className="line-clamp-2 min-h-[2.35rem] text-[0.95rem] leading-snug transition group-hover:text-maroon sm:min-h-[3rem] sm:text-lg">
            {product.name}
          </h2>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-5 text-muted-foreground sm:text-sm">
          {product.description}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-3">
          <span className="text-sm font-semibold text-maroon sm:text-base">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatCurrency(product.originalPrice)}
          </span>
        </div>

        <div className="mt-2">
          <StockBadge
            status={
              product.stock === 0
                ? "out-of-stock"
                : product.stock <= 6
                  ? "low-stock"
                  : "in-stock"
            }
          />
        </div>

        <Button
          className="mt-3 min-h-10 px-3 text-sm"
          disabled={product.stock === 0}
          fullWidth
          onClick={handleAddToCart}
          variant="outline"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardComponent);
