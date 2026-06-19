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

interface DeliveryItem {
  description: string;
  Icon: LucideIcon;
  title: string;
}

const deliveryItems: DeliveryItem[] = [
  {
    description: "Available on eligible delivery locations.",
    Icon: BadgeIndianRupee,
    title: "Cash on Delivery",
  },
  {
    description: "Secure Razorpay payment integration coming soon.",
    Icon: CreditCard,
    title: "Secure Payments",
  },
  {
    description: "Complimentary shipping above ₹2,999.",
    Icon: Truck,
    title: "Free Shipping",
  },
  {
    description: "Easy returns within 7 days of delivery.",
    Icon: RotateCcw,
    title: "Considered Returns",
  },
  {
    description: "Made with heritage craftsmanship and careful finishing.",
    Icon: Sparkles,
    title: "Crafted with Care",
  },
  {
    description: "Thoughtful packaging for safe, graceful delivery.",
    Icon: ShieldCheck,
    title: "Protected in Transit",
  },
];

export function DeliveryInformation() {
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
