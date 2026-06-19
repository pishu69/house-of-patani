import { RatingStars } from "@/components/common/RatingStars";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  ReviewCard,
  type ReviewCardData,
} from "@/components/product/ReviewCard";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews: ReviewCardData[];
}

export function ReviewsSection({
  rating,
  reviewCount,
  reviews,
}: ReviewsSectionProps) {
  return (
    <section aria-labelledby="reviews-heading" id="reviews">
      <div id="reviews-heading">
        <SectionHeading
          description="Considered impressions from the House of Patani community."
          eyebrow="Customer Notes"
          title="Reviews"
        />
      </div>
      <div className="mx-auto mt-8 flex max-w-md flex-col items-center rounded-lg border border-maroon/10 bg-card p-6 text-center shadow-lift">
        <p className="font-serif text-5xl text-charcoal">{rating.toFixed(1)}</p>
        <RatingStars className="mt-2" rating={rating} />
        <p className="mt-2 text-sm text-muted-foreground">
          Based on {reviewCount} verified reviews
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
