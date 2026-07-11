import { CreditCard } from "lucide-react";
import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  description: string;
  disabled?: boolean;
  id: string;
  name: string;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export function PaymentMethodCard({
  description,
  disabled = false,
  id,
  name,
  onSelect,
  selected = false,
}: PaymentMethodCardProps) {
  return (
    <label className={disabled ? "block cursor-not-allowed opacity-60" : "block cursor-pointer"}>
      <Card
        className={cn(
          "flex min-h-14 min-w-0 items-center gap-3 p-3 transition",
          selected && "border-maroon/70 bg-linen/45 ring-1 ring-maroon/20",
        )}
      >
        <input
          checked={selected}
          className="mt-1 h-4 w-4 accent-maroon"
          disabled={disabled}
          name="payment-method"
          onChange={() => onSelect?.(id)}
          type="radio"
        />
        <CreditCard aria-hidden="true" className="shrink-0 text-gold" size={19} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{name}</h3>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </Card>
    </label>
  );
}
