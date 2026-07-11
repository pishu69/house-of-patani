import { Check, Headphones, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { SuccessCard } from "@/components/checkout/SuccessCard";
import { Divider } from "@/components/common/Divider";
import { Loading } from "@/components/common/Loading";
import { ROUTES } from "@/constants/routes";
import { useOrderConfirmation, useSettings } from "@/hooks";
import { orderDeliveryEstimateStorage } from "@/lib/order-delivery-estimate";
import { formatCurrency } from "@/utils";

const progressSteps = ["Order Received", "Preparing", "Shipped", "Delivered"];

function friendlyDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(new Date(value));
}

function progressIndex(status: string, deliveredAt: string | null, dispatchedAt: string | null) {
  if (deliveredAt || status === "delivered") return 3;
  if (dispatchedAt || ["shipped", "out_for_delivery"].includes(status)) return 2;
  if (["processing", "confirmed", "packed", "ready_to_ship"].includes(status)) return 1;
  return 0;
}

export function OrderConfirmationPage() {
  const [showAllItems, setShowAllItems] = useState(false);
  const { orderNumber } = useParams();
  const confirmationQuery = useOrderConfirmation(orderNumber);
  const settingsQuery = useSettings();
  const confirmation = confirmationQuery.data?.data;

  if (confirmationQuery.isLoading) return <Loading />;

  if (!confirmation) {
    return <section className="bg-background py-16"><div className="section-shell"><SuccessCard action={<Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory" to={ROUTES.SHOP}>Continue shopping</Link>} description="This order confirmation is not available on this device. Please contact House of Patani support with your order number." orderNumber={orderNumber ?? "Unknown"} title="Confirmation unavailable" /></div></section>;
  }

  const { order, items } = confirmation;
  const isRazorpay = order.payment_method === "razorpay";
  const supportNumber = settingsQuery.data?.data.whatsappNumber.replace(/\D/g, "") || "918290366530";
  const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodeURIComponent(`Hello House of Patani, I need help with order ${order.order_number}.`)}`;
  const checkoutEstimate = orderDeliveryEstimateStorage.get(order.order_number);
  const storedDeliveryDate = order.estimated_delivery_date || order.estimated_delivery_at;
  const earliestDelivery = checkoutEstimate?.earliestDeliveryDate || storedDeliveryDate;
  const latestDelivery = checkoutEstimate?.latestDeliveryDate || storedDeliveryDate;
  const hasDeliveryRange = Boolean(earliestDelivery && latestDelivery && earliestDelivery.slice(0, 10) !== latestDelivery.slice(0, 10));
  const deliveryLabel = earliestDelivery ? (hasDeliveryRange ? `${friendlyDate(earliestDelivery)}–${friendlyDate(latestDelivery!)}` : friendlyDate(earliestDelivery)) : null;
  const currentProgress = progressIndex(order.order_status, order.delivered_at, order.dispatched_at);
  const trackUrl = order.tracking_url || (order.customer_id ? `/account/orders/${order.order_number}` : ROUTES.ORDER_LOOKUP);
  const firstName = order.customer_name.trim().split(/\s+/)[0] || order.customer_name;

  return (
    <section className="bg-background pb-6 pt-6 sm:pt-10">
      <div className="section-shell max-w-5xl px-4 sm:px-6">
        <motion.section animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-xl border border-emerald-800/10 bg-card p-5 shadow-lift sm:p-7" initial={{ opacity: 0, y: 12 }} transition={{ duration: 0.45 }}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <motion.div animate={{ opacity: 1, scale: 1 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" initial={{ opacity: 0, scale: 0.65 }} transition={{ delay: 0.15, type: "spring", stiffness: 220 }}><Check size={23} strokeWidth={2.5} /></motion.div>
              <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Order Confirmed</p><h1 className="mt-1 text-3xl sm:text-4xl">Thank you, {firstName}!</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">We've received your order and will begin preparing it shortly.</p><p className="mt-2 text-xs font-medium text-muted-foreground">Order #{order.order_number}</p></div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 sm:w-72">
              <div className="rounded-lg bg-linen/45 p-3"><span className="block text-xs text-muted-foreground">{hasDeliveryRange ? "Estimated Delivery" : "Expected Delivery"}</span><strong className="mt-1 block text-sm">{deliveryLabel || "We'll share an update shortly."}</strong>{checkoutEstimate?.isMultiWarehouse ? <span className="mt-1 block text-[0.68rem] text-muted-foreground">Items may arrive separately.</span> : null}</div>
              <div className="rounded-lg bg-linen/45 p-3"><span className="block text-xs text-muted-foreground">Payment</span><strong className="mt-1 block text-sm">{isRazorpay ? "Paid Successfully" : "Payment on Delivery"}</strong></div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{isRazorpay ? "Your payment was received successfully." : `Please keep ${formatCurrency(order.total)} ready at the time of delivery.`}</p>
          <p className="mt-2 text-xs italic text-muted-foreground/80">Thank you for supporting Koch Rajbanshi heritage and community initiatives.</p>
        </motion.section>

        <section className="mt-5 rounded-xl border border-maroon/10 bg-card p-5 shadow-lift sm:p-6" aria-label="Order progress">
          <div className="grid grid-cols-4">
            {progressSteps.map((step, index) => <div className="relative text-center" key={step}>{index > 0 ? <span className={`absolute right-1/2 top-3 h-px w-full ${index <= currentProgress ? "bg-emerald-600" : "bg-maroon/15"}`} /> : null}<span className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full border ${index <= currentProgress ? "border-emerald-600 bg-emerald-600 text-white" : "border-maroon/20 bg-card text-muted-foreground"}`}>{index < currentProgress ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={`mt-2 block text-[0.68rem] sm:text-xs ${index === currentProgress ? "font-semibold text-charcoal" : "text-muted-foreground"}`}>{step}</span></div>)}
          </div>
          {order.customer_email ? <div className="mt-4 text-center text-xs text-muted-foreground"><p>We'll keep you updated by email.</p><p className="mt-1">Confirmation sent to: <span className="font-semibold text-charcoal">{order.customer_email}</span></p></div> : null}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <section aria-labelledby="confirmation-items-title" className="rounded-xl border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
            <h2 className="text-2xl" id="confirmation-items-title">Your Order</h2>
            <ul className="mt-4 divide-y divide-maroon/10">{(showAllItems ? items : items.slice(0, 3)).map((item) => <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={item.id}><div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-linen">{item.product_image ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={item.product_image} /> : null}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold text-charcoal">{item.product_name}</p><p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity} × {formatCurrency(item.price)}</p></div><span className="shrink-0 text-sm font-semibold text-maroon">{formatCurrency(item.total)}</span></li>)}</ul>
            {items.length > 3 ? <button className="mt-4 min-h-9 text-xs font-semibold text-maroon underline underline-offset-4" onClick={() => setShowAllItems((value) => !value)} type="button">{showAllItems ? "Show fewer items" : `+${items.length - 3} more items`}</button> : null}
          </section>

          <aside className="rounded-xl border border-maroon/10 bg-card p-5 shadow-lift sm:p-6"><h2 className="text-2xl">Order Summary</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Payment</dt><dd className="text-right font-semibold">{isRazorpay ? "Paid Online" : "Cash on Delivery"}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Shipping method</dt><dd className="font-semibold">Standard Shipping</dd></div><Divider className="my-4" /><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{formatCurrency(order.subtotal)}</dd></div>{order.discount > 0 ? <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Discount</dt><dd className="font-semibold text-emerald-700">-{formatCurrency(order.discount)}</dd></div> : null}<div className="flex justify-between gap-3"><dt className="text-muted-foreground">Shipping</dt><dd className="font-semibold">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</dd></div></dl><Divider className="my-4" /><div className="flex items-baseline justify-between gap-3"><span className="font-serif text-xl">Total</span><span className="text-xl font-semibold text-maroon">{formatCurrency(order.total)}</span></div></aside>
        </div>

        <div className="mt-6 flex flex-col gap-1.5 sm:flex-row sm:gap-3 sm:justify-center">
          {order.tracking_url ? <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory shadow-lift" href={trackUrl} rel="noreferrer" target="_blank"><Truck size={17} />Track Order</a> : <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory shadow-lift" to={trackUrl}><PackageCheck size={17} />Track Order</Link>}
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-maroon/25 px-5 text-sm font-semibold text-maroon" to={ROUTES.SHOP}><ShoppingBag size={17} />Continue Shopping</Link>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold text-muted-foreground hover:text-maroon" href={whatsappUrl} rel="noreferrer" target="_blank"><Headphones size={17} />WhatsApp Support</a>
        </div>

        <section className="mt-5 rounded-lg bg-linen/35 p-4 text-center text-sm"><p className="font-semibold text-charcoal">Need help?</p><p className="mt-1 text-xs text-muted-foreground"><a className="hover:text-maroon" href={whatsappUrl} rel="noreferrer" target="_blank">WhatsApp Support</a> · <a className="hover:text-maroon" href="tel:+918290366530">+91 8290366530</a></p></section>
      </div>

      <footer className="mt-8 border-t border-maroon/10 px-4 py-5 text-center text-xs text-muted-foreground"><p className="font-serif text-base text-charcoal">House of Patani</p><p className="mt-1"><a href="mailto:hello@houseofpatani.com">hello@houseofpatani.com</a> · <a href="tel:+918290366530">+91 8290366530</a></p><p className="mt-2">© House of Patani</p></footer>
    </section>
  );
}



