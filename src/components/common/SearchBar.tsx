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
        className="h-12 w-full rounded-full border border-maroon/15 bg-card px-11 text-sm text-charcoal placeholder:text-muted-foreground"
        id="site-search"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </form>
  );
}
