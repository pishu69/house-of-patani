import { UserRound } from "lucide-react";
import type { ComponentSize } from "@/components/ui/component.types";
import { cn } from "@/lib/utils";

interface AvatarProps {
  alt: string;
  className?: string;
  fallback?: string;
  size?: ComponentSize;
  src?: string;
}

const sizes: Record<ComponentSize, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({
  alt,
  className,
  fallback,
  size = "md",
  src,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linen font-semibold text-maroon",
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img alt={alt} className="h-full w-full object-cover" src={src} />
      ) : fallback ? (
        fallback.slice(0, 2).toUpperCase()
      ) : (
        <UserRound aria-label={alt} size={18} />
      )}
    </span>
  );
}
