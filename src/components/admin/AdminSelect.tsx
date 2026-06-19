import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function AdminSelect({
  children,
  className,
  label,
  ...props
}: AdminSelectProps) {
  return (
    <label className={cn("block", className)}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className="h-10 w-full rounded-md border border-maroon/15 bg-card px-3 text-sm text-charcoal"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
