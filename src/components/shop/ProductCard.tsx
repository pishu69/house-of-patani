import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import { IconButton } from "@/components/common/IconButton";
import { RatingStars } from "@/components/common/RatingStars";
import { StockBadge } from "@/components/product/StockBadge";
import { Button } from "@/components/ui/button";
import { categoryNameBySlug } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency } from "@/utils";

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
  const imageUrl = product.images[0];
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-lift transition duration-300 hover:border-gold/60"
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-linen">
        <Link
          aria-label={`View ${product.name}`}
          className="block h-full"
          to={`/product/${product.slug}`}
        >
          {imageUrl ? (
            <img
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
              src={imageUrl}
            />
          ) : null}
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {discount > 0 ? (
            <Badge className="shadow-lift" variant="primary">
              {discount}% off
            </Badge>
          ) : null}
          {product.newArrival ? (
            <Badge className="shadow-lift">New</Badge>
          ) : null}
        </div>
        <IconButton
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-3 top-3 bg-ivory/90 shadow-lift hover:bg-ivory"
          onClick={() => onWishlistToggle?.(product)}
          size="sm"
        >
          <Heart
            aria-hidden="true"
            className={cn(isWishlisted && "fill-maroon text-maroon")}
            size={17}
          />
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          {categoryNameBySlug[product.category]}
        </p>
        <Link className="mt-2" to={`/product/${product.slug}`}>
          <h2 className="text-2xl leading-tight transition group-hover:text-maroon">
            {product.name}
          </h2>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-maroon">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatCurrency(product.originalPrice)}
          </span>
        </div>
        <div className="mt-3">
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
          className="mt-5"
          disabled={product.stock === 0}
          fullWidth
          onClick={() => onAddToCart?.(product)}
          variant="outline"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardComponent);
