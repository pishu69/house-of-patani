import { CreditCard } from "lucide-react";
import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  description: string;
  id: string;
  name: string;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export function PaymentMethodCard({
  description,
  id,
  name,
  onSelect,
  selected = false,
}: PaymentMethodCardProps) {
  return (
    <label className="block cursor-pointer">
      <Card
        className={cn(
          "flex items-start gap-4 p-5 transition",
          selected && "border-maroon ring-1 ring-maroon",
        )}
      >
        <input
          checked={selected}
          className="mt-1 h-4 w-4 accent-maroon"
          name="payment-method"
          onChange={() => onSelect?.(id)}
          type="radio"
        />
        <CreditCard aria-hidden="true" className="text-gold" size={21} />
        <div>
          <h3 className="text-xl">{name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </Card>
    </label>
  );
}
