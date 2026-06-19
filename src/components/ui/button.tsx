import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type {
  ComponentSize,
  ComponentVariant,
} from "@/components/ui/component.types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  size?: ComponentSize;
  variant?: ComponentVariant;
}

const variants: Record<ComponentVariant, string> = {
  primary:
    "bg-maroon text-primary-foreground shadow-lift hover:bg-maroon/90",
  secondary:
    "bg-gold text-charcoal shadow-lift hover:bg-gold/90",
  ghost: "bg-transparent text-charcoal hover:bg-maroon/5",
  outline:
    "border border-maroon/30 bg-transparent text-maroon hover:border-maroon hover:bg-maroon/5",
  destructive:
    "bg-destructive text-destructive-foreground shadow-lift hover:bg-destructive/90",
};

const sizes: Record<ComponentSize, string> = {
  sm: "min-h-9 px-4 py-1.5 text-xs",
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

export function Button({
  children,
  className,
  fullWidth = false,
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
