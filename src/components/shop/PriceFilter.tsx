import { formatCurrency } from "@/utils";

interface PriceFilterProps {
  maxLimit: number;
  maxValue: number;
  minLimit?: number;
  minValue: number;
  onMaxChange?: (value: number) => void;
  onMinChange?: (value: number) => void;
  step?: number;
}

export function PriceFilter({
  maxLimit,
  maxValue,
  minLimit = 0,
  minValue,
  onMaxChange,
  onMinChange,
  step = 500,
}: PriceFilterProps) {
  return (
    <fieldset>
      <div className="flex items-start justify-between gap-4">
        <legend className="font-serif text-xl text-charcoal">Price</legend>
        <span className="text-right text-xs font-semibold leading-5 text-maroon">
          {formatCurrency(minValue)}
          <br />
          to {formatCurrency(maxValue)}
        </span>
      </div>
      <label className="mt-4 block text-xs text-muted-foreground">
        Minimum price
        <input
          aria-label="Minimum price"
          className="mt-2 w-full accent-maroon"
          max={maxValue}
          min={minLimit}
          onChange={(event) => onMinChange?.(Number(event.target.value))}
          step={step}
          type="range"
          value={minValue}
        />
      </label>
      <label className="mt-3 block text-xs text-muted-foreground">
        Maximum price
        <input
          aria-label="Maximum price"
          className="mt-2 w-full accent-maroon"
          max={maxLimit}
          min={minValue}
          onChange={(event) => onMaxChange?.(Number(event.target.value))}
          step={step}
          type="range"
          value={maxValue}
        />
      </label>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(minLimit)}</span>
        <span>{formatCurrency(maxLimit)}</span>
      </div>
    </fieldset>
  );
}
