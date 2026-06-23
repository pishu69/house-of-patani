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
import { useSettings } from "@/hooks";

interface DeliveryItem {
  description: string;
  Icon: LucideIcon;
  title: string;
}

export function DeliveryInformation() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  const deliveryItems: DeliveryItem[] = [
    {
      description:
        settings?.deliveryCodDescription ??
        "Pay after receiving your order. Available across most serviceable locations in India.",
      Icon: BadgeIndianRupee,
      title: settings?.deliveryCodTitle ?? "Cash on Delivery",
    },
    {
      description:
        settings?.deliveryPaymentDescription ??
        "100% secure payments powered by Razorpay with UPI, Cards and Net Banking.",
      Icon: CreditCard,
      title: settings?.deliveryPaymentTitle ?? "Secure Payments",
    },
    {
      description:
        settings?.deliveryShippingDescription ??
        "Free shipping on orders above ?999 across India.",
      Icon: Truck,
      title: settings?.deliveryShippingTitle ?? "Free Shipping",
    },
    {
      description:
        settings?.deliveryReturnsDescription ??
        "Hassle-free returns and exchanges within 7 days.",
      Icon: RotateCcw,
      title: settings?.deliveryReturnsTitle ?? "Easy Returns",
    },
    {
      description:
        settings?.deliveryCareDescription ??
        "Inspired by Koch Rajbanshi heritage and crafted with attention to detail.",
      Icon: Sparkles,
      title: settings?.deliveryCareTitle ?? "Crafted with Care",
    },
    {
      description:
        settings?.deliveryPackagingDescription ??
        "Carefully packed to ensure safe delivery to your doorstep.",
      Icon: ShieldCheck,
      title: settings?.deliveryPackagingTitle ?? "Safe Packaging",
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
