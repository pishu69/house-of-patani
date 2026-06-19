import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShippingEstimatorProps {
  country?: string;
  onCountryChange?: (value: string) => void;
  onEstimate?: () => void;
  onPostalCodeChange?: (value: string) => void;
  postalCode?: string;
}

export function ShippingEstimator({
  country = "India",
  onCountryChange,
  onEstimate,
  onPostalCodeChange,
  postalCode = "",
}: ShippingEstimatorProps) {
  return (
    <fieldset>
      <legend className="flex items-center gap-2 font-serif text-2xl text-charcoal">
        <Truck aria-hidden="true" className="text-gold" size={19} />
        Shipping estimate
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Country
          <select
            className="mt-2 h-11 w-full rounded-full border border-maroon/15 bg-card px-4 font-normal"
            onChange={(event) => onCountryChange?.(event.target.value)}
            value={country}
          >
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Postal code
          <input
            className="mt-2 h-11 w-full rounded-full border border-maroon/15 bg-card px-4 font-normal"
            onChange={(event) => onPostalCodeChange?.(event.target.value)}
            type="text"
            value={postalCode}
          />
        </label>
      </div>
      <Button className="mt-4" onClick={onEstimate} size="sm" variant="outline">
        Estimate delivery
      </Button>
    </fieldset>
  );
}
