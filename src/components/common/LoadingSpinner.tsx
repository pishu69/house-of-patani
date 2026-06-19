import { LoaderCircle } from "lucide-react";
import type { ComponentSize } from "@/components/ui/component.types";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
  size?: ComponentSize;
}

const sizes: Record<ComponentSize, number> = {
  sm: 16,
  md: 22,
  lg: 30,
};

export function LoadingSpinner({
  className,
  label = "Loading",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-maroon", className)}
      role="status"
    >
      <LoaderCircle
        aria-hidden="true"
        className="animate-spin text-gold"
        size={sizes[size]}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
