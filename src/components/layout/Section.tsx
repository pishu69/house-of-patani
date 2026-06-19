import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  contained?: boolean;
  tone?: "default" | "linen" | "maroon" | "charcoal";
}

const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
  charcoal: "bg-charcoal text-ivory",
  default: "bg-background",
  linen: "bg-linen/75",
  maroon: "bg-maroon text-ivory",
};

export function Section({
  children,
  className,
  contained = true,
  tone = "default",
  ...props
}: SectionProps) {
  const content = contained ? <Container>{children}</Container> : children;

  return (
    <section
      className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}
      {...props}
    >
      {content}
    </section>
  );
}
