import { Search } from "lucide-react";

interface SearchInputProps {
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
}

export function SearchInput({
  label = "Search",
  onChange,
  placeholder = "Search records",
  value = "",
}: SearchInputProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={17}
      />
      <input
        className="h-10 w-full rounded-md border border-maroon/15 bg-card pl-10 pr-4 text-sm"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
