import type { ButtonHTMLAttributes, ReactNode } from "react";
import type {
  ComponentSize,
  ComponentVariant,
} from "@/components/ui/component.types";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  children: ReactNode;
  size?: ComponentSize;
  variant?: ComponentVariant;
}

const sizes: Record<ComponentSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const variants: Record<ComponentVariant, string> = {
  primary: "bg-maroon text-ivory hover:bg-maroon/90",
  secondary: "bg-gold text-charcoal hover:bg-gold/85",
  outline:
    "border border-maroon/20 bg-transparent text-maroon hover:bg-maroon/5",
  ghost: "bg-transparent text-charcoal hover:bg-maroon/5 hover:text-maroon",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export function IconButton({
  children,
  className,
  size = "md",
  type = "button",
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
