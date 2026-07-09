import { cn } from "@/lib/utils";

interface FilterToggleProps {
  checked: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
}

export function FilterToggle({
  checked,
  label,
  onChange,
}: FilterToggleProps) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 text-sm transition hover:bg-maroon/5">
      <span className={cn(checked && "font-semibold text-maroon")}>{label}</span>
      <input
        checked={checked}
        className="h-4 w-4 accent-maroon"
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}
