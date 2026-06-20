import { Check } from "lucide-react";

import type { OrderStatus } from "@/constants/order-status";
import { cn } from "@/lib/utils";

const steps: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <p className="rounded-md bg-destructive/7 px-4 py-3 text-sm font-semibold capitalize text-destructive">
        Order {status}
      </p>
    );
  }

  const currentIndex = steps.findIndex((step) => step.value === status);

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const complete = index <= currentIndex;
        return (
          <li className="flex items-center gap-2 sm:block" key={step.value}>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs",
                complete
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-maroon/15 text-muted-foreground",
              )}
            >
              {complete ? <Check aria-hidden="true" size={14} /> : index + 1}
            </span>
            <p
              className={cn(
                "text-xs font-semibold sm:mt-2",
                complete ? "text-charcoal" : "text-muted-foreground",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
