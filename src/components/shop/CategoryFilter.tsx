import { cn } from "@/lib/utils";

export interface CategoryFilterOption {
  count?: number;
  label: string;
  value: string;
}

interface CategoryFilterProps {
  name?: string;
  onChange?: (value: string) => void;
  options: CategoryFilterOption[];
  value?: string;
}

export function CategoryFilter({
  name = "category",
  onChange,
  options,
  value,
}: CategoryFilterProps) {
  return (
    <fieldset>
      <legend className="font-serif text-xl text-charcoal">Categories</legend>
      <div className="mt-3 space-y-1.5">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-maroon/5",
                selected && "bg-maroon/5 font-semibold text-maroon",
              )}
              key={option.value}
            >
              <span className="flex items-center gap-3">
                <input
                  checked={selected}
                  className="h-4 w-4 accent-maroon"
                  name={name}
                  onChange={() => onChange?.(option.value)}
                  type="radio"
                  value={option.value}
                />
                {option.label}
              </span>
              {option.count !== undefined ? (
                <span className="text-xs text-muted-foreground">
                  {option.count}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
