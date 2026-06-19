import type { CartLineItem } from "@/components/cart/CartItem";
import { Card } from "@/components/common/Card";
import { Divider } from "@/components/common/Divider";
import { formatCurrency } from "@/utils";

interface OrderSummaryProps {
  items: CartLineItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <Card className="p-6">
      <h2 className="text-3xl">Order Summary</h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li className="flex items-center gap-3" key={item.id}>
            <div className="h-14 w-14 overflow-hidden rounded-md bg-linen">
              {item.imageUrl ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={item.imageUrl}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Quantity {item.quantity}
              </p>
            </div>
            <span className="text-sm font-semibold text-maroon">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <Divider className="my-5" />
      <div className="flex justify-between gap-4">
        <span className="font-serif text-2xl">Total</span>
        <span className="text-lg font-semibold text-maroon">
          {formatCurrency(total)}
        </span>
      </div>
    </Card>
  );
}
