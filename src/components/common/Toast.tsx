import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  description?: string;
  title: string;
  variant?: ToastVariant;
}

const icons: Record<ToastVariant, LucideIcon> = {
  error: XCircle,
  info: Info,
  success: CheckCircle2,
  warning: CircleAlert,
};

const styles: Record<ToastVariant, string> = {
  error: "border-destructive/30 text-destructive",
  info: "border-maroon/15 text-maroon",
  success: "border-emerald-700/20 text-emerald-800",
  warning: "border-gold/40 text-charcoal",
};

export function Toast({
  description,
  title,
  variant = "info",
}: ToastProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex max-w-sm gap-3 rounded-lg border bg-card p-4 shadow-elegant",
        styles[variant],
      )}
      role="status"
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
