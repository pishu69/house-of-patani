import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({
  children,
  className,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-maroon/10 bg-card shadow-lift",
        interactive &&
          "transition duration-300 hover:-translate-y-1 hover:border-gold/60",
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}
