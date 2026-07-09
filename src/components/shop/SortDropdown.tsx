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
    <label className="relative inline-flex min-w-0 flex-1 items-center sm:flex-none">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full min-w-[10.5rem] appearance-none rounded-full border border-maroon/15 bg-background py-2 pl-4 pr-10 text-sm font-medium text-charcoal shadow-sm transition focus:border-maroon/40 focus:ring-2 focus:ring-maroon/15 sm:w-auto"
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
