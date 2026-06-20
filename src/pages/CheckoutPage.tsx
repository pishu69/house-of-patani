import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
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
import { orderService } from "@/services";
import { useCartStore } from "@/stores/cart.store";
import type { CartItemView } from "@/types/cart.types";
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
    const discount = 0;
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
  }, [cartEntries, catalog, settings]);

  const placeOrderMutation = useMutation({
    mutationFn: orderService.createGuestOrder,
    onSuccess: async (response) => {
      clearCart();
      closeDrawer();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.all }),
      ]);
      toast.success("Order placed successfully.", {
        description: response.warning?.message,
      });
      navigate(
        `/order-confirmation/${response.data.order.order_number}`,
        { replace: true },
      );
    },
    onError: (error) => {
      toast.error("Your order could not be placed.", {
        description:
          error instanceof Error
            ? error.message
            : "Please review your details and try again.",
      });
    },
  });

  function submitCheckout(values: CheckoutFormValues) {
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

    if (result.data.paymentMethod !== "cod") {
      toast.info("Online payment will be available in Phase 10.");
      return;
    }

    placeOrderMutation.mutate({
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
    });
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
                  description="Secure Razorpay payments are coming in Phase 10."
                  disabled
                  id="razorpay"
                  name="Online payment"
                  selected={paymentMethod === "razorpay"}
                />
              </div>
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
                productsQuery.isLoading ||
                settingsQuery.isLoading ||
                hasUnavailableItems ||
                !codEnabled
              }
              fullWidth
              size="lg"
              type="submit"
            >
              <LockKeyhole aria-hidden="true" size={18} />
              {placeOrderMutation.isPending
                ? "Placing order..."
                : "Place Cash on Delivery order"}
            </Button>
            <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" size={15} />
                Secure checkout
              </span>
              <span className="flex items-center gap-2">
                <PackageCheck aria-hidden="true" size={15} />
                Stock verified
              </span>
              <span className="flex items-center gap-2">
                <LockKeyhole aria-hidden="true" size={15} />
                Guest checkout
              </span>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
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
