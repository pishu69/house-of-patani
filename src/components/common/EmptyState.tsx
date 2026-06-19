import { PackageOpen, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon?: LucideIcon;
  title: string;
}

export function EmptyState({
  action,
  description,
  icon: Icon = PackageOpen,
  title,
}: EmptyStateProps) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center sm:p-10">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-maroon">
        <Icon aria-hidden="true" size={24} />
      </span>
      <h2 className="mt-5 text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
