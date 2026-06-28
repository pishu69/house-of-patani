import type { CatalogProduct } from "@/types/product.types";
import { Headphones } from "lucide-react";
import { Link } from "react-router-dom";

import { Divider } from "@/components/common/Divider";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import type { Json } from "@/types/database.types";
import type { OrderConfirmation } from "@/types/order.types";
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
              {items.map((item) => (
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
                    {(() => {
  const linkedProduct = products.find(
    (product) => product.id === item.product_id,
  );

  return linkedProduct ? (
    <Link
      className="font-semibold text-charcoal transition hover:text-maroon hover:underline"
      to={`/product/${linkedProduct.slug}`}
    >
      {item.product_name}
    </Link>
  ) : (
    <p className="font-semibold text-charcoal">{item.product_name}</p>
  );
})()}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quantity {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-maroon">
                    {formatCurrency(item.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Item-level details are unavailable for this preview order.
            </p>
          )}
        </section>

        <aside className="space-y-5">
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
    </div>
  );
}
