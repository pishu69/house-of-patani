import { Search } from "lucide-react";
import type { FormEvent } from "react";

interface SearchBarProps {
  label?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  value?: string;
}

export function SearchBar({
  label = "Search products",
  onChange,
  onSubmit,
  placeholder = "Search textiles, jewelry, decor",
  value,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="relative w-full" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="site-search">
        {label}
      </label>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={18}
      />
      <input
        className="h-11 w-full rounded-full border border-maroon/15 bg-background px-11 text-sm text-charcoal shadow-sm transition placeholder:text-muted-foreground focus:border-maroon/40 focus:bg-card focus:ring-2 focus:ring-maroon/15"
        id="site-search"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </form>
  );
}
