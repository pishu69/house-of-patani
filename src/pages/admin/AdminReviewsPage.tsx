import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageTitle } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { reviewService } from "@/services";
import { formatDate } from "@/utils";

export function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: reviewService.listAll,
  });

  const reviews = reviewsQuery.data?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewService.updateApproval(id, true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review approved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reviewService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted.");
    },
  });

  return (
    <div className="space-y-6">
      <PageTitle
        description="Moderate customer reviews before they appear publicly."
        title="Reviews"
      />

      {reviewsQuery.isLoading ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          No reviews submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              className="rounded-lg border bg-card p-5 shadow-sm"
              key={review.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-linen px-2.5 py-1 text-xs font-semibold capitalize text-maroon">
                      {review.approved ? "Approved" : "Pending"}
                    </span>

                    {review.verified_purchase ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Verified Purchase
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-gold">
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star
                        aria-hidden="true"
                        className="fill-current"
                        key={index}
                        size={16}
                      />
                    ))}
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">
                    {review.title || "Untitled review"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {review.comment || "No comment provided."}
                  </p>

                  <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
                    <span>
                      Customer:{" "}
                      <strong className="text-charcoal">
                        {review.customer_name}
                      </strong>
                    </span>
                    <span>Submitted: {formatDate(review.created_at)}</span>
                    <span>Product ID: {review.product_id}</span>
                    {review.order_id ? <span>Order ID: {review.order_id}</span> : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {!review.approved ? (
                    <Button
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(review.id)}
                      size="sm"
                    >
                      <Check aria-hidden="true" size={16} />
                      Approve
                    </Button>
                  ) : null}

                  <Button
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(review.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}