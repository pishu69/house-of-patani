import { CircleCheckBig } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";

interface SuccessCardProps {
  action?: ReactNode;
  description: string;
  orderNumber?: string;
  title?: string;
}

export function SuccessCard({
  action,
  description,
  orderNumber,
  title = "Order confirmed",
}: SuccessCardProps) {
  return (
    <Card className="mx-auto max-w-2xl p-8 text-center sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700/10 text-emerald-800">
        <CircleCheckBig aria-hidden="true" size={28} />
      </span>
      <h1 className="mt-5 text-4xl sm:text-5xl">{title}</h1>
      {orderNumber ? (
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-gold">
          Order {orderNumber}
        </p>
      ) : null}
      <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-7">{action}</div> : null}
    </Card>
  );
}
