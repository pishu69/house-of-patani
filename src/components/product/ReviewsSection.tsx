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
  const hasReviews = reviews.length > 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

    return {
      count,
      percentage,
      star,
    };
  });

  return (
    <section aria-labelledby="reviews-heading" id="reviews">
      <div id="reviews-heading">
        <SectionHeading
          description={
            hasReviews
              ? "Verified impressions from House of Patani customers."
              : "Reviews will appear here after verified customers share their experience."
          }
          eyebrow="Customer Notes"
          title="Reviews"
        />
      </div>

      {hasReviews ? (
        <>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 rounded-lg border border-maroon/10 bg-card p-6 shadow-lift md:grid-cols-[0.85fr_1.15fr] md:p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="font-serif text-5xl text-charcoal">
                {rating.toFixed(1)}
              </p>
              <RatingStars className="mt-2" rating={rating} />
              <p className="mt-2 text-sm text-muted-foreground">
                Based on {reviewCount} verified reviews
              </p>
            </div>

            <div className="space-y-3">
              {ratingBreakdown.map(({ count, percentage, star }) => (
                <div
                  className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm"
                  key={star}
                >
                  <span className="font-semibold text-charcoal">
                    {star}★
                  </span>

                  <div className="h-2 overflow-hidden rounded-full bg-linen">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-maroon/10 bg-card p-8 text-center shadow-lift">
          <p className="font-serif text-3xl text-charcoal">No reviews yet</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Only verified customers who have purchased this product will be able
            to leave a review.
          </p>
        </div>
      )}
    </section>
  );
}