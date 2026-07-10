import type { ReactNode } from "react";
import { Badge } from "@/components/common/Badge";
import { RatingStars } from "@/components/common/RatingStars";
import { formatCurrency } from "@/utils";

interface ProductInfoProps {
  actions?: ReactNode;
  badge?: string | undefined;
  category: string;
  description: string;
  discount?: number;
  name: string;
  originalPrice?: number;
  price: number;
  rating?: number;
  reviewCount?: number;
  stock?: ReactNode;
  tags?: string[];
}

export function ProductInfo({
  actions,
  badge,
  category,
  description,
  discount,
  name,
  originalPrice,
  price,
  rating,
  reviewCount,
  stock,
  tags = [],
}: ProductInfoProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {badge ? <Badge>{badge}</Badge> : null}
        {stock}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {category}
      </p>
      <h1 className="mt-2 text-4xl leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
        {name}
      </h1>
      {rating !== undefined ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <RatingStars rating={rating} showValue />
          {reviewCount !== undefined ? (
            <a
              className="text-sm text-muted-foreground underline-offset-4 hover:text-maroon hover:underline"
              href="#reviews"
            >
              {reviewCount} reviews
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <p className="text-2xl font-semibold text-maroon sm:text-3xl">
          {formatCurrency(price)}
        </p>
        {originalPrice && originalPrice > price ? (
          <p className="text-sm text-muted-foreground line-through">
            {formatCurrency(originalPrice)}
          </p>
        ) : null}
        {discount && discount > 0 ? (
          <Badge className="bg-maroon/8 text-maroon" variant="ghost">
            {discount}% off
          </Badge>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
        {description}
      </p>
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Product tags">
          {tags.map((tag) => (
            <Badge key={tag} variant="ghost">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
      {actions ? <div className="mt-6">{actions}</div> : null}
    </div>
  );
}
