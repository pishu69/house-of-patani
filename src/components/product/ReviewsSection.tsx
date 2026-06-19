import { SectionHeading } from "@/components/common/SectionHeading";
import {
  ReviewCard,
  type ReviewCardData,
} from "@/components/product/ReviewCard";

interface ReviewsSectionProps {
  reviews: ReviewCardData[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section aria-labelledby="reviews-heading">
      <div id="reviews-heading">
        <SectionHeading
          description={`${reviews.length} considered impressions from the House of Patani community.`}
          eyebrow="Customer Notes"
          title="Reviews"
        />
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
