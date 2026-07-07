import {
  BadgeIndianRupee,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/common/Card";
import type { CatalogProduct } from "@/types/product.types";
import { useSettings } from "@/hooks";

interface DeliveryItem {
  description: string;
  Icon: LucideIcon;
  title: string;
}

function standardizePolicyText(value: string) {
  return value
    .replace(/within\s+(?:7|seven|5|five|10|ten|30|thirty)\s+days?/gi, "within 3 days")
    .replace(
      /.*returns?\s+and\s+exchanges?\s+within\s+3\s+days\.?/gi,
      "Eligible return requests must be raised within 3 days after delivery.",
    );
}

export function DeliveryInformation({ product }: { product?: CatalogProduct }) {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  const deliveryItems: DeliveryItem[] = [
    {
      description:
        (product?.deliveryCodDescription || settings?.deliveryCodDescription) ??
        "Pay after receiving your order. Available across most serviceable locations in India.",
      Icon: BadgeIndianRupee,
      title: (product?.deliveryCodTitle || settings?.deliveryCodTitle) ?? "Cash on Delivery",
    },
    {
      description:
        (product?.deliveryPaymentDescription || settings?.deliveryPaymentDescription) ??
        "100% secure payments powered by Razorpay with UPI, Cards and Net Banking.",
      Icon: CreditCard,
      title: (product?.deliveryPaymentTitle || settings?.deliveryPaymentTitle) ?? "Secure Payments",
    },
    {
      description:
        (product?.deliveryShippingDescription || settings?.deliveryShippingDescription) ??
        "Free shipping on orders above ?999 across India.",
      Icon: Truck,
      title: (product?.deliveryShippingTitle || settings?.deliveryShippingTitle) ?? "Free Shipping",
    },
    {
      description: standardizePolicyText(
        (product?.deliveryReturnsDescription || settings?.deliveryReturnsDescription) ??
          "Eligible return requests must be raised within 3 days after delivery.",
      ),
      Icon: RotateCcw,
      title: (product?.deliveryReturnsTitle || settings?.deliveryReturnsTitle) ?? "Easy Returns",
    },
    {
      description:
        (product?.deliveryCareDescription || settings?.deliveryCareDescription) ??
        "Inspired by Koch Rajbanshi heritage and crafted with attention to detail.",
      Icon: Sparkles,
      title: (product?.deliveryCareTitle || settings?.deliveryCareTitle) ?? "Crafted with Care",
    },
    {
      description:
        (product?.deliveryPackagingDescription || settings?.deliveryPackagingDescription) ??
        "Carefully packed to ensure safe delivery to your doorstep.",
      Icon: ShieldCheck,
      title: (product?.deliveryPackagingTitle || settings?.deliveryPackagingTitle) ?? "Safe Packaging",
    },
  ];

  return (
    <Card className="grid gap-5 p-5 sm:grid-cols-2">
      {deliveryItems.map(({ description, Icon, title }) => (
        <div className="flex gap-3" key={title}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-maroon">
            <Icon aria-hidden="true" size={17} />
          </span>
          <div>
            <h3 className="font-sans text-sm font-semibold text-charcoal">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
}


