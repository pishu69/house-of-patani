import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";
import { Divider } from "@/components/common/Divider";
import { formatCurrency } from "@/utils";

interface CartSummaryProps {
  action?: ReactNode;
  discount?: number;
  shipping?: number;
  subtotal: number;
  total: number;
}

export function CartSummary({
  action,
  discount = 0,
  shipping = 0,
  subtotal,
  total,
}: CartSummaryProps) {
  return (
    <Card className="p-6">
      <h2 className="text-3xl">Cart Summary</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-semibold">{formatCurrency(shipping)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between gap-4 text-maroon">
            <dt>Discount</dt>
            <dd className="font-semibold">-{formatCurrency(discount)}</dd>
          </div>
        ) : null}
      </dl>
      <Divider className="my-5" />
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-serif text-2xl">Total</span>
        <span className="text-xl font-semibold text-maroon">
          {formatCurrency(total)}
        </span>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
