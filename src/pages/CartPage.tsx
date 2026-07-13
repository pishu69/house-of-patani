import { CircleCheck, CircleX, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { ShippingEstimator } from "@/components/cart/ShippingEstimator";
import {
  shiprocketService,
  type CartDeliveryEstimate,
} from "@/services/shiprocket.service";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { showCartMutationToast } from "@/lib/cart-feedback";
import { mapAnalyticsItem, trackRemoveFromCart, trackViewCart } from "@/lib/analytics";

let lastViewedCartSignature = "";

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

  return earliest === latest ? earliest : `${earliest} - ${latest}`;
}

export function CartPage() {
  const [postalCode, setPostalCode] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] =
    useState<CartDeliveryEstimate | null>(null);
  const [isEstimatingDelivery, setIsEstimatingDelivery] = useState(false);
  const {
    cartItems,
    clearCart,
    discount,
    grandTotal,
    removeItem,
    shipping,
    subtotal,
    updateQuantity,
  } = useCart();

  useEffect(() => {
    if (cartItems.length === 0) return;
    const signature = cartItems.map((item) => `${item.product.id}:${item.quantity}`).join("|");
    if (signature === lastViewedCartSignature) return;
    lastViewedCartSignature = signature;
    trackViewCart(cartItems.map((item) => mapAnalyticsItem(item.product, item.quantity)), { currency: "INR", value: subtotal });
  }, [cartItems, subtotal]);

  if (cartItems.length === 0) {
    return (
      <>
        <section className="bg-background pb-10 pt-6 sm:pb-12 sm:pt-8">
          <div className="section-shell">
            <EmptyCartState
              action={
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lift transition hover:bg-maroon/90"
                  to={ROUTES.SHOP}
                >
                  Continue Shopping
                </Link>
              }
            />
          </div>
        </section>
      </>
    );
  }

  const deliveryResult = deliveryEstimate ? (
    <div className="text-sm">
      <p className="flex items-center gap-2 font-semibold text-charcoal">
        {deliveryEstimate.serviceable ? (
          <CircleCheck aria-hidden="true" className="text-maroon" size={17} />
        ) : (
          <CircleX aria-hidden="true" className="text-muted-foreground" size={17} />
        )}
        {deliveryEstimate.serviceable
          ? "Delivery Available"
          : "Delivery is currently unavailable for this PIN code."}
      </p>
      {deliveryEstimate.serviceable ? (
        <div className="mt-2 space-y-1.5 text-muted-foreground">
          <p>
            Arrives by{" "}
            <strong className="font-sans font-semibold text-maroon">
              {deliveryDateText(deliveryEstimate)}
            </strong>
          </p>
          <p className="font-medium text-charcoal">
            Cash on Delivery{" "}
            {deliveryEstimate.codAvailable ? "Available" : "Unavailable"}
          </p>
          {deliveryEstimate.isMultiWarehouse ? (
            <p className="font-medium text-charcoal">
              Items may arrive separately.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Please try another PIN code.
        </p>
      )}
    </div>
  ) : null;

  return (
    <>
      <section className="bg-background pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div className="section-shell grid items-start gap-10 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-maroon/10 pb-4">
              <h2 className="text-3xl">Cart Items</h2>
              <Button
                onClick={() => {
                  cartItems.forEach((item) => trackRemoveFromCart(mapAnalyticsItem(item.product, item.quantity), { currency: "INR", value: item.lineTotal }));
                  clearCart();
                  toast.success("Cart cleared");
                }}
                size="sm"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" size={16} />
                Clear Cart
              </Button>
            </div>

            <div>
              {cartItems.map(({ lineTotal, product, quantity }) => (
                <CartItem
                  item={{
                    id: product.id,
                    imageUrl: product.images[0],
                    lineTotal,
                    name: product.name,
                    price: product.price,
                    quantity,
                    slug: product.slug,
                    stock: product.stock,
                    variant: product.tags.slice(0, 2).join(" · "),
                  }}
                  key={product.id}
                  onQuantityChange={(nextQuantity) => {
                    const result = updateQuantity(product.id, nextQuantity);
                    if (result.success && nextQuantity < quantity) trackRemoveFromCart(mapAnalyticsItem(product, quantity - nextQuantity), { currency: "INR", value: product.price * (quantity - nextQuantity) });
                    showCartMutationToast(product.name, result);
                  }}
                  onRemove={() => {
                    const result = removeItem(product.id);
                    if (result.success) trackRemoveFromCart(mapAnalyticsItem(product, quantity), { currency: "INR", value: lineTotal });
                    showCartMutationToast(product.name, result);
                  }}
                  onStockLimit={() =>
                    toast.error("Stock limit reached", {
                      description: `Only ${product.stock} of ${product.name} are currently available.`,
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-7">
              <ShippingEstimator
                isChecking={isEstimatingDelivery}
                onEstimate={() => {
                  const destinationPincode = postalCode.replace(/\D/g, "");

                  if (destinationPincode.length !== 6) {
                    toast.error("Enter a valid 6-digit pincode.");
                    return;
                  }

                  setIsEstimatingDelivery(true);
                  void shiprocketService
                    .checkCartServiceability({
                      cod: true,
                      deliveryPincode: destinationPincode,
                      products: cartItems.map((item) => item.product),
                    })
                    .then(setDeliveryEstimate)
                    .catch((error) => {
                      setDeliveryEstimate(null);
                      toast.error("Delivery estimate unavailable.", {
                        description:
                          error instanceof Error
                            ? error.message
                            : "Please try again.",
                      });
                    })
                    .finally(() => setIsEstimatingDelivery(false));
                }}
                onPostalCodeChange={setPostalCode}
                postalCode={postalCode}
              >
                {isEstimatingDelivery ? (
                  <p className="text-sm font-medium text-muted-foreground">
                    Checking delivery...
                  </p>
                ) : (
                  deliveryResult
                )}
              </ShippingEstimator>
            </div>

            <Link
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/25 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
              to={ROUTES.SHOP}
            >
              Continue Shopping
            </Link>
          </div>

          <div className="lg:sticky lg:top-28">
            <CartSummary
              action={
                <Link
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-maroon px-6 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
                  to={ROUTES.CHECKOUT}
                >
                  Proceed to Checkout
                </Link>
              }
              discount={discount}
              shipping={shipping}
              subtotal={subtotal}
              total={grandTotal}
            />
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              Taxes and final delivery charges are confirmed at checkout.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

