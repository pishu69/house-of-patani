import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";

interface EmptyAdminStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function EmptyAdminState({
  action,
  description,
  title,
}: EmptyAdminStateProps) {
  return (
    <EmptyState
      action={action}
      description={description}
      icon={Inbox}
      title={title}
    />
  );
}
