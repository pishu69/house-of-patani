import { ChevronDown } from "lucide-react";

export interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  label?: string;
  onChange?: (value: string) => void;
  options: SortOption[];
  value: string;
}

export function SortDropdown({
  label = "Sort products",
  onChange,
  options,
  value,
}: SortDropdownProps) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 appearance-none rounded-full border border-maroon/15 bg-card py-2 pl-4 pr-10 text-sm font-medium text-charcoal"
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-maroon"
        size={17}
      />
    </label>
  );
}
