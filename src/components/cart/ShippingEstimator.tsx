import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShippingEstimatorProps {
  children?: ReactNode;
  isChecking?: boolean;
  onEstimate?: () => void;
  onPostalCodeChange?: (value: string) => void;
  postalCode?: string;
}

export function ShippingEstimator({
  children,
  isChecking = false,
  onEstimate,
  onPostalCodeChange,
  postalCode = "",
}: ShippingEstimatorProps) {
  return (
    <fieldset className="rounded-lg border border-maroon/10 bg-card p-4 shadow-lift sm:p-5">
      <legend className="sr-only">Check Delivery</legend>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-maroon">
          <MapPin aria-hidden="true" size={17} />
        </span>
        <div>
          <h3 className="font-serif text-2xl leading-tight text-charcoal">
            Check Delivery
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Enter your PIN code to check delivery availability.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <label className="min-w-0 flex-1 text-sm font-semibold">
          <span className="sr-only">PIN code</span>
          <input
            className="h-11 w-full rounded-full border border-maroon/15 bg-background px-4 font-normal text-charcoal transition placeholder:text-muted-foreground focus:border-maroon/40 focus:ring-2 focus:ring-maroon/15"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) =>
              onPostalCodeChange?.(event.target.value.replace(/\D/g, ""))
            }
            placeholder="PIN code"
            type="text"
            value={postalCode}
          />
        </label>
        <Button
          className="h-11 shrink-0 px-5"
          disabled={isChecking || postalCode.replace(/\D/g, "").length !== 6}
          onClick={onEstimate}
          variant="outline"
        >
          {isChecking ? "Checking..." : "Check"}
        </Button>
      </div>
      {children ? <div className="mt-4 border-t border-maroon/10 pt-4">{children}</div> : null}
    </fieldset>
  );
}
