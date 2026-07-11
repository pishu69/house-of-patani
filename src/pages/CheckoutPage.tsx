import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LockKeyhole, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  CheckoutField,
  CheckoutOrderSummary,
  PaymentMethodCard,
} from "@/components/checkout";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { CouponInput } from "@/components/cart/CouponInput";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  orderQueryKeys,
  productQueryKeys,
  useProducts,
  useSettings,
} from "@/hooks";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";
import { applyZodErrors } from "@/lib/form-validation";
import { orderDeliveryEstimateStorage } from "@/lib/order-delivery-estimate";
import {
  couponService,
  orderService,
  paymentService,
} from "@/services";
import {
  shiprocketService,
  type CartDeliveryEstimate,
} from "@/services/shiprocket.service";
import { useCartStore } from "@/stores/cart.store";
import { useCustomerStore } from "@/stores/customer.store";
import type { CartItemView } from "@/types/cart.types";
import type { CreateGuestOrderInput } from "@/types/order.types";
import type { CouponRow } from "@/types/database.types";
import { formatCurrency } from "@/utils";

const defaults: CheckoutFormValues = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "India",
  email: "",
  firstName: "",
  landmark: "",
  lastName: "",
  paymentMethod: "cod",
  phone: "",
  pincode: "",
  shippingMethod: "standard",
  state: "",
};

function formatDeliveryDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function deliveryDateText(estimate: CartDeliveryEstimate) {
  if (!estimate.earliestDeliveryDate) return "confirmed after dispatch";

  const earliest = formatDeliveryDate(estimate.earliestDeliveryDate);
  const latest = estimate.latestDeliveryDate
    ? formatDeliveryDate(estimate.latestDeliveryDate)
    : earliest;

  return earliest === latest ? earliest : `${earliest}–${latest}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartEntries = useCartStore((state) => state.items);
  const removeCartItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const customerProfile = useCustomerStore((state) => state.profile);
  const savedAddresses = useCustomerStore((state) => state.addresses);
  const productsQuery = useProducts();
  const settingsQuery = useSettings();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CheckoutFormValues>({ defaultValues: defaults });
  const paymentMethod = watch("paymentMethod");
  const pincode = watch("pincode");

  useEffect(() => {
    const savedAddress =
      savedAddresses.find((address) => address.isDefault) ??
      savedAddresses[0];

    if (customerProfile.name) {
      const [firstName, ...lastNameParts] = customerProfile.name.split(" ");
      setFullName(customerProfile.name);
      setValue("firstName", firstName ?? "");
      setValue("lastName", lastNameParts.join(" "));
    }

    if (customerProfile.email) {
      setValue("email", customerProfile.email);
    }

    if (customerProfile.phone) {
      setValue("phone", customerProfile.phone);
    }

    if (savedAddress) {
      setValue("addressLine1", savedAddress.line1);
      setValue("addressLine2", savedAddress.line2);
      setValue("city", savedAddress.city);
      setValue("country", "India");
      setValue("pincode", savedAddress.postalCode);
      setValue("state", savedAddress.state);
    }
  }, [customerProfile, savedAddresses, setValue]);
  const settings = settingsQuery.data?.data;
  const catalog = productsQuery.data?.data ?? [];
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [fullName, setFullName] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [appliedCouponData, setAppliedCouponData] = useState<CouponRow | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] =
    useState<CartDeliveryEstimate | null>(null);
  const [isEstimatingDelivery, setIsEstimatingDelivery] = useState(false);
  const couponUsageCodeRef = useRef("");
  const couponsQuery = useQuery({
  queryKey: ["checkout-coupons"],
  queryFn: couponService.list,
});

const coupons = couponsQuery.data?.data ?? [];
  console.log("Checkout coupons debug", {
  couponsLoading: couponsQuery.isLoading,
  couponsError: couponsQuery.error,
  coupons,
  couponCode,
});
  const appliedCoupon = appliedCouponData;

  const checkoutState = useMemo(() => {
    const unavailable: string[] = [];
    const items = cartEntries.flatMap<CartItemView>((entry) => {
      const product = catalog.find((item) => item.id === entry.productId);

      if (
        !product ||
        !product.active ||
        product.stock === 0 ||
        entry.quantity > product.stock
      ) {
        unavailable.push(product?.name ?? entry.productId);
        if (!product) removeCartItem(entry.productId);
        return [];
      }

      return [
        {
          lineTotal: product.price * entry.quantity,
          product,
          quantity: entry.quantity,
        },
      ];
    });
    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
    const rawDiscount = appliedCoupon
      ? appliedCoupon.type === "percentage"
        ? subtotal * (appliedCoupon.value / 100)
        : appliedCoupon.value
      : 0;
    const discount = Math.min(subtotal, Math.max(0, Math.round(rawDiscount)));
    const shipping =
      subtotal === 0 ||
      subtotal >= (settings?.freeShippingThreshold ?? 5000)
        ? 0
        : (settings?.shippingCharge ?? 250);

    return {
      discount,
      items,
      shipping,
      subtotal,
      total: subtotal - discount + shipping,
      unavailable,
    };
  }, [cartEntries, catalog, settings, removeCartItem, appliedCoupon]);

  useEffect(() => {
    const normalizedPincode = (pincode || "").replace(/\D/g, "");

    if (normalizedPincode.length !== 6 || !shiprocketService.isConfigured()) {
      setDeliveryEstimate(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsEstimatingDelivery(true);
      void shiprocketService
        .checkCartServiceability({
          cod: paymentMethod === "cod",
          deliveryPincode: normalizedPincode,
          products: checkoutState.items.map((item) => item.product),
        })
        .then(setDeliveryEstimate)
        .catch(() => setDeliveryEstimate(null))
        .finally(() => setIsEstimatingDelivery(false));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [checkoutState.items, paymentMethod, pincode]);

  async function finishOrder(
    response: Awaited<ReturnType<typeof orderService.createGuestOrder>>,
  ) {
   if (deliveryEstimate?.earliestDeliveryDate) {
     orderDeliveryEstimateStorage.set(response.data.order.order_number, {
       earliestDeliveryDate: deliveryEstimate.earliestDeliveryDate,
       isMultiWarehouse: deliveryEstimate.isMultiWarehouse,
       latestDeliveryDate: deliveryEstimate.latestDeliveryDate,
     });
   }
   const couponCodeToIncrement =
  couponUsageCodeRef.current || appliedCoupon?.code || "";

if (couponCodeToIncrement) {
  await couponService.incrementUsage(couponCodeToIncrement);
}
 clearCart();
    closeDrawer();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all }),
    ]);
    toast.success("Order placed successfully.", {
      description: response.warning?.message,
    });
    navigate(`/order-confirmation/${response.data.order.order_number}`, {
      replace: true,
    });
  }

  const placeOrderMutation = useMutation({
    mutationFn: orderService.createGuestOrder,
    onSuccess: finishOrder,
    onError: (error) => {
      toast.error("Your order could not be placed.", {
        description:
          error instanceof Error
            ? error.message
            : "Please review your details and try again.",
      });
    },
  });

  async function applyCoupon() {
  const code = couponCode.trim().toUpperCase();

  if (!code) {
    toast.error("Enter a coupon code.");
    return;
  }

  const response = await couponService.validate(code);
  const coupon = response.data;

  if (!coupon || !coupon.active) {
    toast.error("Invalid coupon code.");
    return;
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    toast.error("This coupon has expired.");
    return;
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    toast.error("This coupon usage limit has been reached.");
    return;
  }

  if (checkoutState.subtotal < coupon.minimum_order_value) {
    toast.error("Minimum order value not reached.", {
      description: `Add items worth ${formatCurrency(
        coupon.minimum_order_value - checkoutState.subtotal,
      )} more to use this coupon.`,
    });
    return;
  }

  setAppliedCouponCode(coupon.code);
setAppliedCouponData(coupon);
setCouponCode(coupon.code);
toast.success(`Coupon ${coupon.code} applied.`);
}

function removeCoupon() {
  const removedCode = appliedCouponCode;
  setAppliedCouponCode("");
  setAppliedCouponData(null);
  setCouponCode("");
  couponUsageCodeRef.current = "";
  toast.success(removedCode ? `Coupon ${removedCode} removed.` : "Coupon removed.");
}

async function submitCheckout(values: CheckoutFormValues) {
    const result = checkoutSchema.safeParse(values);

    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    if (checkoutState.items.length === 0 || cartEntries.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (checkoutState.unavailable.length > 0) {
      toast.error("Some items are no longer available.", {
        description: checkoutState.unavailable.join(", "),
      });
      return;
    }

    couponUsageCodeRef.current = appliedCoupon?.code ?? "";
    const checkout: CreateGuestOrderInput = {
      address: {
        addressLine1: result.data.addressLine1,
        addressLine2: result.data.addressLine2,
        city: result.data.city,
        country: result.data.country,
        landmark: result.data.landmark,
        pincode: result.data.pincode,
        state: result.data.state,
      },
      customerEmail: result.data.email,
      customerName: `${result.data.firstName} ${result.data.lastName}`.trim(),
      customerPhone: result.data.phone,
      discount: checkoutState.discount,
      items: checkoutState.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        sku: item.product.sku,
      })),
      paymentMethod: result.data.paymentMethod,
      shipping: checkoutState.shipping,
      subtotal: checkoutState.subtotal,
      total: checkoutState.total,
    };

    if (import.meta.env.DEV) {
      console.debug("Created order pricing payload", {
        couponCode: appliedCoupon?.code ?? null,
        discount: checkout.discount,
        shipping: checkout.shipping,
        subtotal: checkout.subtotal,
        total: checkout.total,
      });
    }

    if (result.data.paymentMethod === "cod") {
      placeOrderMutation.mutate(checkout);
      return;
    }

    if (!paymentService.isRazorpayConfigured()) {
      toast.error(
        "Online payment is not available yet. Please use Cash on Delivery.",
      );
      return;
    }

    if (!settings?.razorpayEnabled) {
      toast.error("Online payment is currently disabled by the store.");
      return;
    }

    if (!paymentService.isRazorpayBackendAvailable()) {
      toast.error(
        "Online payment is not available yet. Please use Cash on Delivery.",
      );
      return;
    }

    setIsProcessingPayment(true);

    try {
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "The secure payment window could not load. Please try again or use COD.",
        );
      }

      const intentResponse = await paymentService.createPaymentIntent({
        checkout,
      });
      let settled = false;
      const options = paymentService.createRazorpayOptions({
        checkout,
        intent: intentResponse.data,
        logoUrl: settings.logoUrl || undefined,
        onDismiss: () => {
          if (settled) return;
          setIsProcessingPayment(false);
          toast.info("Payment cancelled. Your cart is unchanged.");
        },
        onSuccess: (paymentResponse) => {
          settled = true;
          void paymentService
            .handleRazorpaySuccess({
              checkout,
              intent: intentResponse.data,
              response: paymentResponse,
            })
            .then(finishOrder)
            .catch((error: unknown) => {
              setIsProcessingPayment(false);
              toast.error("Payment verification was not completed.", {
                description:
                  error instanceof Error
                    ? error.message
                    : "Please contact support before trying another payment.",
              });
            });
        },
        storeName: settings.storeName,
      });
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        settled = true;
        setIsProcessingPayment(false);
        toast.error("Payment was not completed.", {
          description: paymentService.handleRazorpayFailure(response),
        });
      });
      razorpay.open();
    } catch (error) {
      setIsProcessingPayment(false);
      toast.error("Online payment could not be started.", {
        description:
          error instanceof Error
            ? error.message
            : "Please use Cash on Delivery.",
      });
    }
  }

  if (!productsQuery.isLoading && cartEntries.length === 0) {
    return (
      <>
        <PageHero
          description="Add a piece from the collection before beginning checkout."
          eyebrow="Checkout"
          title="Your cart is empty"
        />
        <section className="bg-background py-16">
          <div className="section-shell">
            <EmptyCartState
              action={
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory"
                  to={ROUTES.SHOP}
                >
                  Explore the collection
                </Link>
              }
            />
          </div>
        </section>
      </>
    );
  }

  const codEnabled = settings?.codEnabled ?? true;
  const razorpayKeyConfigured = paymentService.isRazorpayConfigured();
  const razorpayBackendAvailable =
    paymentService.isRazorpayBackendAvailable();
  const razorpayEnabled =
    razorpayKeyConfigured &&
    razorpayBackendAvailable &&
    Boolean(settings?.razorpayEnabled);
    console.log("Razorpay debug", {
  razorpayKeyConfigured,
  razorpayBackendAvailable,
  razorpayEnabledFromSettings: settings?.razorpayEnabled,
  razorpayEnabled,
});
  const hasUnavailableItems = checkoutState.unavailable.length > 0;
  const itemCount = checkoutState.items.reduce((total, item) => total + item.quantity, 0);
  const checkoutButtonLabel = paymentMethod === "razorpay" ? "Proceed to Payment" : "Place COD Order";
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 5000;

  return (
    <>
      <section className="overflow-x-hidden bg-background pb-8 pt-6 sm:pb-10 sm:pt-8">
        <form
          className="section-shell grid min-w-0 items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8"
          noValidate
          onSubmit={handleSubmit(submitCheckout)}
        >
          <div className="space-y-4 pb-24 lg:pb-0">
            <div className="rounded-lg border border-maroon/10 bg-card p-4 shadow-lift lg:hidden">
              <button className="flex w-full items-center justify-between gap-4 text-left" onClick={() => setSummaryOpen((open) => !open)} type="button">
                <span><span className="block text-sm font-semibold">{itemCount} {itemCount === 1 ? "Item" : "Items"}</span><span className="text-xs text-muted-foreground">{summaryOpen ? "Hide" : "View"} Your Order</span></span>
                <span className="flex items-center gap-2 font-semibold text-maroon">{formatCurrency(checkoutState.total)}<ChevronDown className={summaryOpen ? "rotate-180 transition" : "transition"} size={18} /></span>
              </button>
              {summaryOpen ? <div className="mt-4 border-t border-maroon/10 pt-4"><CouponInput appliedCode={appliedCouponCode} discount={checkoutState.discount} id="coupon-mobile" onApply={applyCoupon} onChange={setCouponCode} onRemove={removeCoupon} value={couponCode} /><div className="mt-4"><CheckoutOrderSummary discount={checkoutState.discount} freeShippingThreshold={freeShippingThreshold} items={checkoutState.items} shipping={checkoutState.shipping} subtotal={checkoutState.subtotal} total={checkoutState.total} /></div></div> : null}
            </div>

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
              <h2 className="text-2xl">Contact</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-charcoal sm:col-span-2">Full Name *
                  <input autoComplete="name" className="mt-1.5 h-11 w-full rounded-md border border-maroon/15 bg-card px-3.5 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10" onChange={(event) => { const value = event.target.value; const [first, ...rest] = value.trimStart().split(/\s+/); setFullName(value); setValue("firstName", first || "", { shouldValidate: true }); setValue("lastName", rest.join(" "), { shouldValidate: true }); }} placeholder="Full name" value={fullName} />
                  {errors.firstName || errors.lastName ? <span className="mt-1 block text-xs font-medium text-destructive">Enter your full name.</span> : null}
                </label>
                <input type="hidden" {...register("firstName")} /><input type="hidden" {...register("lastName")} />
                <CheckoutField
                  autoComplete="tel"
                  error={errors.phone?.message}
                  inputMode="tel"
                  label="Phone Number *"
                  placeholder="10-digit mobile number"
                  registration={register("phone")}
                  type="tel"
                />
                <CheckoutField
                  autoComplete="email"
                  error={errors.email?.message}
                  label="Email Address *"
                  placeholder="you@example.com"
                  registration={register("email")}
                  type="email"
                />
              </div>
            </section>

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
              <h2 className="text-2xl">Delivery Address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <CheckoutField
                    autoComplete="address-line1"
                    error={errors.addressLine1?.message}
                    label="Full Address / House / Village *"
                    placeholder="House number, building or village"
                    registration={register("addressLine1")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <CheckoutField
                    autoComplete="address-line2"
                    error={errors.addressLine2?.message}
                    label="Address Line 2"
                    placeholder="Apartment, floor or nearby detail (optional)"
                    registration={register("addressLine2")}
                  />
                </div>
                <CheckoutField
                  autoComplete="address-level2"
                  error={errors.city?.message}
                  label="City *"
                  registration={register("city")}
                />
                <CheckoutField
                  autoComplete="address-level1"
                  error={errors.state?.message}
                  label="State *"
                  registration={register("state")}
                />
                <CheckoutField
                  autoComplete="postal-code"
                  error={errors.pincode?.message}
                  inputMode="numeric"
                  label="PIN Code *"
                  maxLength={6}
                  registration={register("pincode")}
                />
                <input type="hidden" value="India" {...register("country")} />
                <div className="sm:col-span-2">
                  <CheckoutField
                    error={errors.landmark?.message}
                    label="Landmark (Optional)"
                    registration={register("landmark")}
                  />
                </div>
              </div>
              <div className="mt-4 border-t border-maroon/10 pt-4">
                <h3 className="text-xl">Delivery</h3>
                <div className="mt-2 flex items-start gap-3 bg-linen/25 px-3 py-3 text-sm">
                  <Truck className="mt-0.5 shrink-0 text-gold" size={18} />
                  <div className="grid flex-1 gap-1 text-muted-foreground">
                    <p className="font-semibold text-charcoal">Standard Shipping</p>
                  {isEstimatingDelivery ? (
                    <p className="text-muted-foreground">
                      Checking delivery availability...
                    </p>
                  ) : deliveryEstimate ? (
                    <>
                      <p className="font-medium text-charcoal">
                        {deliveryEstimate.serviceable
                          ? "✓ Delivery Available"
                          : "Delivery not available"}
                      </p>
                      <p>
                        Delivery by{" "}
                        {deliveryDateText(deliveryEstimate)}
                      </p>
                      <p>
                        {deliveryEstimate.codAvailable
                          ? "Cash on Delivery Available"
                          : "Cash on Delivery Not Available"}
                      </p>
                      {deliveryEstimate.isMultiWarehouse ? (
                        <p className="text-xs">
                          Items may arrive separately.
                        </p>
                      ) : null}
                    </>
                  ) : <p>Delivery estimate appears after entering a valid PIN code.</p>}
                  </div>
                </div>
              </div>
            </section>
            <input type="hidden" {...register("shippingMethod")} />

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
              <h2 className="text-2xl">Payment</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <PaymentMethodCard
                  description={
                    codEnabled
                      ? "Pay in cash when your order arrives."
                      : "Cash on Delivery is currently disabled by the store."
                  }
                  disabled={!codEnabled}
                  id="cod"
                  name="Cash on Delivery"
                  onSelect={() =>
                    setValue("paymentMethod", "cod", {
                      shouldValidate: true,
                    })
                  }
                  selected={paymentMethod === "cod" && codEnabled}
                />
                <PaymentMethodCard
                  description={
                    razorpayEnabled
                      ? "Pay securely using UPI, cards, netbanking, or supported wallets."
                      : "Online payment is not available yet. Please use Cash on Delivery."
                  }
                  disabled={!razorpayEnabled}
                  id="razorpay"
                  name="Razorpay Online Payment"
                  onSelect={() =>
                    setValue("paymentMethod", "razorpay", {
                      shouldValidate: true,
                    })
                  }
                  selected={paymentMethod === "razorpay"}
                />
              </div>
              {!razorpayKeyConfigured ? (
                <p className="mt-4 text-sm text-muted-foreground" role="status">
                  Online payment is not available yet. Please use Cash on
                  Delivery.
                </p>
              ) : null}
            </section>

            {hasUnavailableItems ? (
              <div
                className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
                role="alert"
              >
                Some cart items are unavailable or exceed current stock:{" "}
                {checkoutState.unavailable.join(", ")}. Return to the cart to
                adjust quantities.
              </div>
            ) : null}

            <Button className="hidden min-h-[3.25rem] lg:flex"
              disabled={
                placeOrderMutation.isPending ||
                isProcessingPayment ||
                productsQuery.isLoading ||
                settingsQuery.isLoading ||
                hasUnavailableItems ||
                (paymentMethod === "cod" && !codEnabled) ||
                (paymentMethod === "razorpay" && !razorpayEnabled)
              }
              fullWidth
              size="lg"
              type="submit"
            >
              <LockKeyhole aria-hidden="true" size={18} />
              {placeOrderMutation.isPending || isProcessingPayment
                ? "Processing securely..."
                : checkoutButtonLabel}
            </Button>
            <div className="hidden gap-3 text-xs text-muted-foreground sm:grid-cols-3 lg:grid">
              <span className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" size={15} />
                Secure payments
              </span>
              <span className="flex items-center gap-2">
                <PackageCheck aria-hidden="true" size={15} />
                COD available
              </span>
              <span className="flex items-center gap-2">
                <LockKeyhole aria-hidden="true" size={15} />
                No hidden charges
              </span>
            </div>
          </div>

          <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
            <div className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
              <h2 className="mb-4 text-2xl">Coupon</h2>
              <CouponInput
                appliedCode={appliedCouponCode}
                discount={checkoutState.discount}
                id="coupon-desktop"
                onApply={applyCoupon}
                onChange={setCouponCode}
                onRemove={removeCoupon}
                value={couponCode}
              />
            </div>
            <CheckoutOrderSummary
              discount={checkoutState.discount}
              freeShippingThreshold={freeShippingThreshold}
              items={checkoutState.items}
              shipping={checkoutState.shipping}
              subtotal={checkoutState.subtotal}
              total={checkoutState.total}
            />
            <Button className="min-h-[3.25rem]" disabled={placeOrderMutation.isPending || isProcessingPayment || productsQuery.isLoading || settingsQuery.isLoading || hasUnavailableItems || (paymentMethod === "cod" && !codEnabled) || (paymentMethod === "razorpay" && !razorpayEnabled)} fullWidth size="lg" type="submit"><LockKeyhole aria-hidden="true" size={18} />{placeOrderMutation.isPending || isProcessingPayment ? "Processing securely..." : checkoutButtonLabel}</Button>
            <p className="text-center text-xs text-muted-foreground">Need help with your order? <a className="font-semibold text-charcoal hover:text-maroon" href="tel:+918290366530">+91 8290366530</a></p>
            <div className="grid grid-cols-3 gap-3 text-center text-[0.68rem] leading-tight text-muted-foreground"><span><ShieldCheck className="mx-auto mb-1" size={13} />Secure Payments</span><span><PackageCheck className="mx-auto mb-1" size={13} />COD Available</span><span><LockKeyhole className="mx-auto mb-1" size={13} />No Hidden Charges</span></div>
          </aside>
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-maroon/10 bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(58,24,31,0.08)] backdrop-blur lg:hidden"><div className="min-w-0"><span className="block text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "Item" : "Items"}</span><span className="font-semibold text-maroon">{formatCurrency(checkoutState.total)}</span></div><Button className="ml-auto min-w-44" disabled={placeOrderMutation.isPending || isProcessingPayment || hasUnavailableItems || (paymentMethod === "cod" && !codEnabled) || (paymentMethod === "razorpay" && !razorpayEnabled)} type="submit">{placeOrderMutation.isPending || isProcessingPayment ? "Processing..." : checkoutButtonLabel}</Button></div>
        </form>
      </section>
    </>
  );
}






