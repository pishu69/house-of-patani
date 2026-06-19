import { Badge } from "@/components/common/Badge";

type StatusTone = "positive" | "neutral" | "warning" | "negative";

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

export function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  const variant =
    tone === "negative"
      ? "destructive"
      : tone === "positive"
        ? "secondary"
        : tone === "warning"
          ? "outline"
          : "ghost";

  return <Badge variant={variant}>{label}</Badge>;
}
