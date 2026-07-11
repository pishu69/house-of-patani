import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CouponInputProps {
  appliedCode?: string;
  discount?: number;
  id?: string;
  onApply?: () => void;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  value?: string;
}

export function CouponInput({
  appliedCode,
  discount = 0,
  id = "coupon",
  onApply,
  onChange,
  onRemove,
  value = "",
}: CouponInputProps) {
  if (appliedCode) {
    return (
      <div className="rounded-md bg-linen/40 p-3 text-sm">
        <p className="font-semibold tracking-wide text-emerald-700">✓ {appliedCode} Applied</p>
        {discount > 0 ? <p className="mt-1 text-xs text-muted-foreground">You saved {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(discount)}</p> : null}
        <button className="mt-2 min-h-8 text-xs font-semibold text-maroon underline underline-offset-4" onClick={onRemove} type="button">Remove Coupon</button>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-semibold text-charcoal" htmlFor={id}>
        Coupon code
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Tag
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gold"
            size={17}
          />
          <input
            className="h-11 w-full rounded-full border border-maroon/15 bg-card pl-11 pr-4 text-sm uppercase"
            id={id}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder="PATANI"
            type="text"
            value={value}
          />
        </div>
        <Button onClick={onApply} size="sm" type="button" variant="outline">
          Apply
        </Button>
      </div>
    </div>
  );
}
