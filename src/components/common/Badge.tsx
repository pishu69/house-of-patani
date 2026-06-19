import type { HTMLAttributes, ReactNode } from "react";
import type { ComponentVariant } from "@/components/ui/component.types";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: ComponentVariant;
}

const variants: Record<ComponentVariant, string> = {
  primary: "bg-maroon text-ivory",
  secondary: "bg-gold/20 text-charcoal",
  outline: "border border-maroon/20 bg-transparent text-maroon",
  ghost: "bg-maroon/5 text-maroon",
  destructive: "bg-destructive/10 text-destructive",
};

export function Badge({
  children,
  className,
  variant = "secondary",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
