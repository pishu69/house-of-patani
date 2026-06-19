import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}

export function DashboardCard({
  children,
  className,
  description,
  title,
}: DashboardCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div>
        <h2 className="text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
