import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  className?: string;
  max?: number;
  rating: number;
  showValue?: boolean;
}

export function RatingStars({
  className,
  max = 5,
  rating,
  showValue = false,
}: RatingStarsProps) {
  const clampedRating = Math.min(Math.max(rating, 0), max);

  return (
    <div
      aria-label={`${clampedRating} out of ${max} stars`}
      className={cn("flex items-center gap-1", className)}
      role="img"
    >
      {Array.from({ length: max }, (_, index) => (
        <Star
          aria-hidden="true"
          className={
            index < Math.round(clampedRating)
              ? "fill-gold text-gold"
              : "fill-transparent text-maroon/20"
          }
          key={index}
          size={16}
        />
      ))}
      {showValue ? (
        <span className="ml-1 text-xs font-semibold text-muted-foreground">
          {clampedRating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
