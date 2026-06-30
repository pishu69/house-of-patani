import { Truck } from "lucide-react";
import { Card } from "@/components/common/Card";
import { formatCurrency } from "@/utils";
import { cn } from "@/lib/utils";

interface ShippingMethodCardProps {
  description: string;
  disabled?: boolean;
  id: string;
  name: string;
  onSelect?: (id: string) => void;
  price: number;
  selected?: boolean;
}

export function ShippingMethodCard({
  description,
  disabled = false,
  id,
  name,
  onSelect,
  price,
  selected = false,
}: ShippingMethodCardProps) {
  return (
    <label className={disabled ? "block cursor-not-allowed opacity-60" : "block cursor-pointer"}>
      <Card
        className={cn(
          "flex min-w-0 items-start gap-3 p-4 transition sm:gap-4 sm:p-5",
          selected && "border-maroon ring-1 ring-maroon",
        )}
      >
        <input
          checked={selected}
          className="mt-1 h-4 w-4 accent-maroon"
          disabled={disabled}
          name="shipping-method"
          onChange={() => onSelect?.(id)}
          type="radio"
        />
        <Truck aria-hidden="true" className="text-gold" size={21} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap justify-between gap-2 sm:gap-4">
            <h3 className="text-xl">{name}</h3>
            <span className="text-sm font-semibold text-maroon">
              {formatCurrency(price)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </Card>
    </label>
  );
}
