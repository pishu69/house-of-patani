import { motion } from "framer-motion";
import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const imageUrl = product.imageUrls?.[0];

  return (
    <motion.article
      className="group overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-lift transition duration-300 hover:border-gold/60"
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-linen">
          {imageUrl ? (
            <img
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
              src={imageUrl}
            />
          ) : null}
          <span className="absolute left-4 top-4 rounded-full bg-ivory px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-maroon shadow-lift">
            Featured
          </span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-2xl leading-tight transition group-hover:text-maroon">
              {product.name}
            </h3>
          </Link>
          <p className="shrink-0 text-sm font-semibold text-maroon">
            {formatCurrency(product.price)}
          </p>
        </div>
        <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
          {product.description}
        </p>
        <Button className="mt-5 w-full" variant="outline">
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardComponent);
