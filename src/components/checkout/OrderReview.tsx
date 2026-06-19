import type { CartLineItem } from "@/components/cart/CartItem";
import { OrderSummary } from "@/components/cart/OrderSummary";

interface OrderReviewProps {
  items: CartLineItem[];
  total: number;
}

export function OrderReview({ items, total }: OrderReviewProps) {
  return (
    <section aria-labelledby="order-review-title">
      <h2 className="sr-only" id="order-review-title">
        Review your order
      </h2>
      <OrderSummary items={items} total={total} />
    </section>
  );
}
