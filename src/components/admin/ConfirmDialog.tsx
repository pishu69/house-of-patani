import { CircleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/common/IconButton";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  title: string;
  trigger?: ReactNode;
}

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
  trigger,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return <>{trigger}</>;
  }

  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-elegant">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert aria-hidden="true" size={20} />
          </span>
          <IconButton aria-label="Close dialog" onClick={onCancel} size="sm">
            <X aria-hidden="true" size={18} />
          </IconButton>
        </div>
        <h2 className="mt-4 text-3xl" id="confirm-dialog-title">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} size="sm" variant="ghost">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} size="sm" variant="destructive">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
