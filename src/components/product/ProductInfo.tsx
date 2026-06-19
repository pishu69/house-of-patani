import type { ReactNode } from "react";
import { Badge } from "@/components/common/Badge";
import { RatingStars } from "@/components/common/RatingStars";
import { formatCurrency } from "@/utils";

interface ProductInfoProps {
  actions?: ReactNode;
  badge?: string;
  description: string;
  name: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  stock?: ReactNode;
}

export function ProductInfo({
  actions,
  badge,
  description,
  name,
  price,
  rating,
  reviewCount,
  stock,
}: ProductInfoProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {badge ? <Badge>{badge}</Badge> : null}
        {stock}
      </div>
      <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
        {name}
      </h1>
      {rating !== undefined ? (
        <div className="mt-4 flex items-center gap-3">
          <RatingStars rating={rating} showValue />
          {reviewCount !== undefined ? (
            <span className="text-sm text-muted-foreground">
              {reviewCount} reviews
            </span>
          ) : null}
        </div>
      ) : null}
      <p className="mt-5 text-2xl font-semibold text-maroon">
        {formatCurrency(price)}
      </p>
      <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
        {description}
      </p>
      {actions ? <div className="mt-8">{actions}</div> : null}
    </div>
  );
}
