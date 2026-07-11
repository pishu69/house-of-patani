import type { CartItemView } from "@/types/cart.types";
import { Divider } from "@/components/common/Divider";
import { formatCurrency } from "@/utils";

interface CheckoutOrderSummaryProps {
  discount: number;
  freeShippingThreshold: number;
  items: CartItemView[];
  shipping: number;
  subtotal: number;
  total: number;
}

export function CheckoutOrderSummary({
  discount,
  freeShippingThreshold,
  items,
  shipping,
  subtotal,
  total,
}: CheckoutOrderSummaryProps) {
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  return (
    <section
      aria-labelledby="checkout-summary-title"
      className="w-full overflow-hidden rounded-lg border border-maroon/10 bg-card p-4 shadow-lift sm:p-6"
    >
      <h2 className="text-2xl sm:text-3xl" id="checkout-summary-title">
        Your Order
      </h2>

      <ul className="mt-5 space-y-4">
        {items.map(({ lineTotal, product, quantity }) => (
          <li className="flex w-full min-w-0 gap-3" key={product.id}>
            <div className="relative h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-md bg-linen">
              {product.images[0] ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={product.images[0]}
                />
              ) : null}
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[0.65rem] font-semibold text-ivory">
                {quantity}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 break-words text-sm font-semibold text-charcoal">
                {product.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Qty {quantity} × {formatCurrency(product.price)}
              </p>
              <p className="mt-1 text-sm font-semibold text-maroon">
                {formatCurrency(lineTotal)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Divider className="my-5" />

      <div className="rounded-md bg-linen/35 p-3 text-xs">
        <p className="font-semibold text-charcoal">{remainingForFreeShipping > 0 ? <>You’re only {formatCurrency(remainingForFreeShipping)} away from FREE SHIPPING 🚚</> : <>🎉 You’ve unlocked FREE SHIPPING.</>}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-maroon/10"><div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${shippingProgress}%` }} /></div>
        <p className="mt-1.5 text-muted-foreground">{formatCurrency(Math.min(subtotal, freeShippingThreshold))} / {formatCurrency(freeShippingThreshold)}</p>
      </div>

      <Divider className="my-5" />

      <dl className="space-y-3 text-sm">
        <div className="flex min-w-0 justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="shrink-0 font-semibold">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex min-w-0 justify-between gap-4">
          <dt className="text-muted-foreground">Discount</dt>
          <dd className="shrink-0 font-semibold">
            {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
          </dd>
        </div>
        <div className="flex min-w-0 justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="shrink-0 font-semibold">
            {shipping === 0 ? "Free" : formatCurrency(shipping)}
          </dd>
        </div>
      </dl>

      <Divider className="my-5" />

      <div className="flex min-w-0 items-baseline justify-between gap-4">
        <span className="font-serif text-xl sm:text-2xl">Total</span>
        <span className="shrink-0 text-lg font-semibold text-maroon sm:text-xl">
          {formatCurrency(total)}
        </span>
      </div>
    </section>
  );
}
