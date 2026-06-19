import { Avatar } from "@/components/common/Avatar";
import { Card } from "@/components/common/Card";
import { RatingStars } from "@/components/common/RatingStars";
import { formatDate } from "@/utils";

export interface ReviewCardData {
  author: string;
  comment: string;
  createdAt: string;
  id: string;
  rating: number;
  title?: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <Avatar alt={review.author} fallback={review.author} />
        <div>
          <p className="text-sm font-semibold text-charcoal">{review.author}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>
      <RatingStars className="mt-4" rating={review.rating} />
      {review.title ? (
        <h3 className="mt-4 text-2xl">{review.title}</h3>
      ) : null}
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {review.comment}
      </p>
    </Card>
  );
}
