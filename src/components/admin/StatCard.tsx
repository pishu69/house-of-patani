import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  change?: number;
  icon: LucideIcon;
  label: string;
  value: string;
}

export function StatCard({
  change,
  icon: Icon,
  label,
  value,
}: StatCardProps) {
  const positive = change !== undefined && change >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-charcoal">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-maroon">
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
      {change !== undefined ? (
        <p
          className={cn(
            "mt-4 flex items-center gap-1 text-xs font-semibold",
            positive ? "text-emerald-800" : "text-destructive",
          )}
        >
          <TrendIcon aria-hidden="true" size={14} />
          {Math.abs(change)}% from previous period
        </p>
      ) : null}
    </Card>
  );
}
