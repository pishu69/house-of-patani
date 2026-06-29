import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Headphones, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Divider } from "@/components/common/Divider";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { reviewService } from "@/services";
import type { Json, OrderItemRow, ReviewRow } from "@/types/database.types";
import type { OrderConfirmation } from "@/types/order.types";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency, formatDate } from "@/utils";

function addressLines(address: Json) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return ["Address unavailable"];
  }

  const values = [
    address.addressLine1 ?? address.line1,
    address.addressLine2 ?? address.line2,
    [address.city, address.state, address.pincode ?? address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
  ];
  return values.filter((value): value is string => typeof value === "string");
}

interface OrderDetailsProps {
  confirmation: OrderConfirmation;
  products?: CatalogProduct[];
  supportUrl?: string;
}

export function OrderDetails({
  confirmation: { items, order },
  products = [],
  supportUrl = "#",
}: OrderDetailsProps) {
  const queryClient = useQueryClient();
  const [reviewItem, setReviewItem] = useState<OrderItemRow | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewRow | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const orderReviewsQuery = useQuery({
  queryKey: ["order-reviews", order.id],
  queryFn: () => reviewService.listByOrder(order.id),
});

const orderReviews = orderReviewsQuery.data?.data ?? [];

function getReviewForItem(item: OrderItemRow) {
  return orderReviews.find(
    (review) => review.product_id === item.product_id,
  );
}

  const submitReviewMutation = useMutation({
    mutationFn: () => {
      if (!reviewItem?.product_id) {
        throw new Error("Missing product.");
      }

     if (editingReview) {
  return reviewService.updateOwnReview({
    comment,
    rating,
    reviewId: editingReview.id,
    title,
  });
}
return reviewService.createVerifiedReview({
  comment,
  customerId: order.customer_id,
  customerName: order.customer_name,
  orderId: order.id,
  productId: reviewItem.product_id,
  rating,
  title,
});
    },
    onSuccess: () => {
      toast.success(editingReview ? "Review updated." : "Review submitted.", {
  description: "Your review is awaiting approval.",
});

void queryClient.invalidateQueries({
  queryKey: ["order-reviews", order.id],
});

setReviewItem(null);
setEditingReview(null);
      setRating(5);
      setTitle("");
      setComment("");
    },
    onError: () => {
      toast.error("Could not submit review.");
    },
  });
  const deleteReviewMutation = useMutation({
  mutationFn: (reviewId: string) => reviewService.deleteOwnReview(reviewId),

  onSuccess: () => {
    toast.success("Review deleted.");

    void queryClient.invalidateQueries({
      queryKey: ["order-reviews", order.id],
    });
  },

  onError: () => {
    toast.error("Could not delete review.");
  },
});

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Order details</p>
          <h2 className="mt-2 text-3xl">{order.order_number}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon"
          href={supportUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Headphones aria-hidden="true" size={16} />
          WhatsApp support
        </a>
      </header>

      <section>
        <h3 className="text-xl">Order progress</h3>
        <div className="mt-4">
          <OrderStatusTimeline status={order.order_status} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-lg border border-maroon/10 p-5">
          <h3 className="text-2xl">Items</h3>
          {items.length > 0 ? (
            <ul className="mt-4 divide-y divide-maroon/10">
              {items.map((item) => {
                const linkedProduct = products.find(
                  (product) => product.id === item.product_id,
                );

                return (
                  <li className="flex items-center gap-3 py-4" key={item.id}>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-linen">
                      {item.product_image ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          src={item.product_image}
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      {linkedProduct ? (
                        <Link
                          className="font-semibold text-charcoal transition hover:text-maroon hover:underline"
                          to={`/product/${linkedProduct.slug}`}
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-charcoal">
                          {item.product_name}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantity {item.quantity}
                      </p>

                      {order.order_status === "delivered" && item.product_id ? (
  (() => {
    const existingReview = getReviewForItem(item);

    if (!existingReview) {
      return (
        <button
          className="mt-3 text-sm font-semibold text-maroon hover:underline"
          onClick={() => {
            setReviewItem(item);
            setEditingReview(null);
            setRating(5);
            setTitle("");
            setComment("");
          }}
          type="button"
        >
          Write a Review
        </button>
      );
    }

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {existingReview.approved
            ? "Published review"
            : "Review submitted, awaiting approval"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <button
            className="text-maroon hover:underline"
            onClick={() => {
              setReviewItem(item);
              setEditingReview(existingReview);
              setRating(existingReview.rating);
              setTitle(existingReview.title || "");
              setComment(existingReview.comment || "");
            }}
            type="button"
          >
            View / Edit
          </button>

          <button
  className="text-red-600 hover:underline disabled:opacity-50"
  disabled={deleteReviewMutation.isPending}
  onClick={() => {
    if (window.confirm("Delete this review? This action cannot be undone.")) {
      deleteReviewMutation.mutate(existingReview.id);
    }
  }}
  type="button"
>
  Delete
</button>
        </div>
      </div>
    );
  })()
) : null}
                    </div>

                    <span className="font-semibold text-maroon">
                      {formatCurrency(item.total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Item-level details are unavailable for this preview order.
            </p>
          )}
        </section>

        <aside className="space-y-5">
          {(order.courier_partner ||
            order.tracking_number ||
            order.tracking_url ||
            order.dispatched_at ||
            order.estimated_delivery_at) && (
            <section className="rounded-lg border border-maroon/10 p-5">
              <h3 className="text-xl">Shipping & Tracking</h3>

              <dl className="mt-4 space-y-2 text-sm">
                {order.courier_partner ? (
                  <div>
                    <dt className="font-semibold text-charcoal">Courier</dt>
                    <dd className="text-muted-foreground">
                      {order.courier_partner}
                    </dd>
                  </div>
                ) : null}

                {order.tracking_number ? (
                  <div>
                    <dt className="font-semibold text-charcoal">
                      Tracking Number
                    </dt>
                    <dd className="text-muted-foreground">
                      {order.tracking_number}
                    </dd>
                  </div>
                ) : null}

                {order.dispatched_at ? (
                  <div>
                    <dt className="font-semibold text-charcoal">Dispatched</dt>
                    <dd className="text-muted-foreground">
                      {formatDate(order.dispatched_at)}
                    </dd>
                  </div>
                ) : null}

                {order.estimated_delivery_at ? (
                  <div>
                    <dt className="font-semibold text-charcoal">
                      Estimated Delivery
                    </dt>
                    <dd className="text-muted-foreground">
                      {formatDate(order.estimated_delivery_at)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {order.tracking_url ? (
                <a
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-maroon px-4 text-sm font-semibold text-ivory transition hover:bg-maroon/90"
                  href={order.tracking_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Track Package
                </a>
              ) : null}
            </section>
          )}

          <section className="rounded-lg border border-maroon/10 p-5">
            <h3 className="text-xl">Delivery</h3>
            <p className="mt-3 text-sm font-semibold text-charcoal">
              {order.customer_name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customer_email}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.customer_phone}
            </p>
            <address className="mt-3 text-sm not-italic leading-6 text-muted-foreground">
              {addressLines(order.shipping_address).map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </address>
          </section>

          <section className="rounded-lg border border-maroon/10 p-5">
            <h3 className="text-xl">Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-semibold capitalize">
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : "Razorpay"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment status</dt>
                <dd className="font-semibold capitalize">
                  {order.payment_status}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>
                  {order.shipping === 0
                    ? "Free"
                    : formatCurrency(order.shipping)}
                </dd>
              </div>
            </dl>
            <Divider className="my-4" />
            <div className="flex justify-between gap-3 font-semibold">
              <span>Total</span>
              <span className="text-maroon">
                {formatCurrency(order.total)}
              </span>
            </div>
          </section>
        </aside>
      </div>

      {reviewItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Verified Review</p>
                <h3 className="mt-2 text-2xl">Review your purchase</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reviewItem.product_name}
                </p>
              </div>
              <button
                className="text-sm font-semibold text-muted-foreground hover:text-maroon"
                onClick={() => setReviewItem(null)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-charcoal">
                Overall rating
              </p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    type="button"
                  >
                    <Star
                      className={
                        value <= rating
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }
                      size={24}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block text-sm font-semibold text-charcoal">
              Review title
              <input
                className="mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm"
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Excellent quality"
                value={title}
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-charcoal">
              Share your experience
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-maroon/15 bg-background px-3 py-3 text-sm"
                maxLength={800}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell other customers about the fabric, fit, packaging, and overall experience."
                value={comment}
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="rounded-full border border-maroon/25 px-5 py-2 text-sm font-semibold text-maroon"
                onClick={() => setReviewItem(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-ivory disabled:opacity-50"
                disabled={
                  submitReviewMutation.isPending ||
                  !title.trim() ||
                  !comment.trim()
                }
                onClick={() => submitReviewMutation.mutate()}
                type="button"
              >
                {submitReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}