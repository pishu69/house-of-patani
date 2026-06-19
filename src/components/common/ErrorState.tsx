import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";

interface ErrorStateProps {
  action?: ReactNode;
  description?: string;
  title?: string;
}

export function ErrorState({
  action,
  description = "Please try again in a moment.",
  title = "Something went wrong",
}: ErrorStateProps) {
  return (
    <EmptyState
      action={action}
      description={description}
      icon={CircleAlert}
      title={title}
    />
  );
}
