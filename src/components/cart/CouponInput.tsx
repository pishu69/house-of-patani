import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CouponInputProps {
  onApply?: () => void;
  onChange?: (value: string) => void;
  value?: string;
}

export function CouponInput({
  onApply,
  onChange,
  value = "",
}: CouponInputProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-charcoal" htmlFor="coupon">
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
            id="coupon"
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
