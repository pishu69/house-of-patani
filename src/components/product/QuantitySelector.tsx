import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";

interface QuantitySelectorProps {
  max?: number;
  min?: number;
  onChange?: ((quantity: number) => void) | undefined;
  quantity: number;
}

export function QuantitySelector({
  max = 99,
  min = 1,
  onChange,
  quantity,
}: QuantitySelectorProps) {
  return (
    <div
      aria-label="Quantity"
      className="inline-flex items-center rounded-full border border-maroon/15 bg-card p-1"
      role="group"
    >
      <IconButton
        aria-label="Decrease quantity"
        disabled={quantity <= min}
        onClick={() => onChange?.(Math.max(min, quantity - 1))}
        size="sm"
      >
        <Minus aria-hidden="true" size={16} />
      </IconButton>
      <output
        aria-live="polite"
        className="min-w-10 text-center text-sm font-semibold text-charcoal"
      >
        {quantity}
      </output>
      <IconButton
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={() => onChange?.(Math.min(max, quantity + 1))}
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
      </IconButton>
    </div>
  );
}
