import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  CheckoutField,
  CheckoutOrderSummary,
  PaymentMethodCard,
  ShippingMethodCard,
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
  useCoupons,
} from "@/hooks";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";
import { applyZodErrors } from "@/lib/form-validation";
import { orderService, paymentService } from "@/services";
import { useCartStore } from "@/stores/cart.store";
import type { CartItemView } from "@/types/cart.types";
import type { CreateGuestOrderInput } from "@/types/order.types";
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

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartEntries = useCartStore((state) => state.items);
  const removeCartItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
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
  const shippingMethod = watch("shippingMethod");
  const settings = settingsQuery.data?.data;
  const catalog = productsQuery.data?.data ?? [];
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const couponsQuery = useCoupons();
  const coupons = couponsQuery.data?.data ?? [];
  const appliedCoupon = coupons.find(
    (coupon) => coupon.code.toLowerCase() === appliedCouponCode.toLowerCase(),
  );

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

  async function finishOrder(
    response: Awaited<ReturnType<typeof orderService.createGuestOrder>>,
  ) {
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

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Enter a coupon code.");
      return;
    }

    const coupon = coupons.find(
      (item) => item.code.toUpperCase() === code,
    );

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
    setCouponCode(coupon.code);
    toast.success(`Coupon ${coupon.code} applied.`);
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
  const hasUnavailableItems = checkoutState.unavailable.length > 0;

  return (
    <>
      <PageHero
        description="Secure guest checkout with clear delivery details and a final order review."
        eyebrow="Checkout"
        title="Complete your order"
      />
      <section className="bg-background py-10 sm:py-14">
        <form
          className="section-shell grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]"
          noValidate
          onSubmit={handleSubmit(submitCheckout)}
        >
          <div className="space-y-6">
            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
              <p className="eyebrow">Step 1</p>
              <h2 className="mt-2 text-3xl">Contact information</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <CheckoutField
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  label="First name"
                  registration={register("firstName")}
                />
                <CheckoutField
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  label="Last name"
                  registration={register("lastName")}
                />
                <CheckoutField
                  autoComplete="tel"
                  error={errors.phone?.message}
                  inputMode="tel"
                  label="Phone number"
                  registration={register("phone")}
                  type="tel"
                />
                <CheckoutField
                  autoComplete="email"
                  error={errors.email?.message}
                  label="Email"
                  registration={register("email")}
                  type="email"
                />
              </div>
            </section>

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
              <p className="eyebrow">Step 2</p>
              <h2 className="mt-2 text-3xl">Shipping address</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <CheckoutField
                    autoComplete="address-line1"
                    error={errors.addressLine1?.message}
                    label="Address line 1"
                    registration={register("addressLine1")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <CheckoutField
                    autoComplete="address-line2"
                    error={errors.addressLine2?.message}
                    label="Address line 2"
                    registration={register("addressLine2")}
                  />
                </div>
                <CheckoutField
                  autoComplete="address-level2"
                  error={errors.city?.message}
                  label="City"
                  registration={register("city")}
                />
                <CheckoutField
                  autoComplete="address-level1"
                  error={errors.state?.message}
                  label="State"
                  registration={register("state")}
                />
                <CheckoutField
                  autoComplete="postal-code"
                  error={errors.pincode?.message}
                  inputMode="numeric"
                  label="Pincode"
                  maxLength={6}
                  registration={register("pincode")}
                />
                <CheckoutField
                  autoComplete="country-name"
                  error={errors.country?.message}
                  label="Country"
                  registration={register("country")}
                />
                <div className="sm:col-span-2">
                  <CheckoutField
                    error={errors.landmark?.message}
                    label="Landmark or delivery notes"
                    registration={register("landmark")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
              <p className="eyebrow">Step 3</p>
              <h2 className="mt-2 text-3xl">Shipping method</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ShippingMethodCard
                  description={
                    checkoutState.shipping === 0
                      ? `Free shipping applied above ${formatCurrency(
                          settings?.freeShippingThreshold ?? 5000,
                        )}.`
                      : "Tracked delivery across India, usually within 5-8 business days."
                  }
                  id="standard"
                  name="Standard shipping"
                  onSelect={() =>
                    setValue("shippingMethod", "standard", {
                      shouldValidate: true,
                    })
                  }
                  price={checkoutState.shipping}
                  selected={shippingMethod === "standard"}
                />
                <ShippingMethodCard
                  description="Store pickup will be introduced in a later phase."
                  disabled
                  id="pickup"
                  name="Store pickup"
                  price={0}
                />
              </div>
            </section>

            <section className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
              <p className="eyebrow">Step 4</p>
              <h2 className="mt-2 text-3xl">Payment method</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
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

            <Button
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
                : paymentMethod === "razorpay"
                  ? "Pay securely with Razorpay"
                  : "Place Cash on Delivery order"}
            </Button>
            <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
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

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-6">
              <CouponInput
                onApply={applyCoupon}
                onChange={setCouponCode}
                value={couponCode}
              />
            </div>
            <CheckoutOrderSummary
              discount={checkoutState.discount}
              items={checkoutState.items}
              shipping={checkoutState.shipping}
              subtotal={checkoutState.subtotal}
              total={checkoutState.total}
            />
          </aside>
        </form>
      </section>
    </>
  );
}





