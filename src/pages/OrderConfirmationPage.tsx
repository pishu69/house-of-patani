import { Headphones, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { SuccessCard } from "@/components/checkout/SuccessCard";
import { Divider } from "@/components/common/Divider";
import { Loading } from "@/components/common/Loading";
import { ROUTES } from "@/constants/routes";
import { useOrderConfirmation, useSettings } from "@/hooks";
import { formatCurrency } from "@/utils";

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const confirmationQuery = useOrderConfirmation(orderNumber);
  const settingsQuery = useSettings();
  const confirmation = confirmationQuery.data?.data;

  if (confirmationQuery.isLoading) {
    return <Loading />;
  }

  if (!confirmation) {
    return (
      <section className="bg-background py-20">
        <div className="section-shell">
          <SuccessCard
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory"
                to={ROUTES.SHOP}
              >
                Continue shopping
              </Link>
            }
            description="This order confirmation is not available on this device. Please contact House of Patani support with your order number."
            orderNumber={orderNumber ?? "Unknown"}
            title="Confirmation unavailable"
          />
        </div>
      </section>
    );
  }

  const { order, items } = confirmation;
  const supportNumber =
    settingsQuery.data?.data.whatsappNumber.replace(/\D/g, "") ?? "";
  const whatsappUrl = supportNumber
    ? `https://wa.me/${supportNumber}?text=${encodeURIComponent(
        `Hello House of Patani, I need help with order ${order.order_number}.`,
      )}`
    : "#";

  return (
    <section className="bg-background py-12 sm:py-20">
      <div className="section-shell">
        <SuccessCard
          description={`Thank you, ${order.customer_name}. Your Cash on Delivery order has been received and will be prepared with care.`}
          orderNumber={order.order_number}
        />

        <div className="mx-auto mt-8 grid max-w-4xl gap-6 lg:grid-cols-[1fr_20rem]">
          <section
            aria-labelledby="confirmation-items-title"
            className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6"
          >
            <h2 className="text-3xl" id="confirmation-items-title">
              Order details
            </h2>
            <ul className="mt-5 divide-y divide-maroon/10">
              {items.map((item) => (
                <li
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  key={item.id}
                >
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
                    <p className="truncate text-sm font-semibold text-charcoal">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Quantity {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-maroon">
                    {formatCurrency(item.total)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
            <h2 className="text-2xl">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-semibold uppercase">
                  {order.payment_method}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">
                  {formatCurrency(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold">
                  {order.shipping === 0
                    ? "Free"
                    : formatCurrency(order.shipping)}
                </dd>
              </div>
            </dl>
            <Divider className="my-5" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-xl">Total</span>
              <span className="text-lg font-semibold text-maroon">
                {formatCurrency(order.total)}
              </span>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Delivery is usually completed within 5-8 business days. Our team
              will contact you when delivery clarification is needed.
            </p>
          </aside>
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
            to={ROUTES.SHOP}
          >
            <ShoppingBag aria-hidden="true" size={17} />
            Continue shopping
          </Link>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-maroon/25 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
            href={whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Headphones aria-hidden="true" size={17} />
            WhatsApp support
          </a>
        </div>
      </div>
    </section>
  );
}
