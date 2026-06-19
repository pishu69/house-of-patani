import { ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";

interface EmptyCartStateProps {
  action?: ReactNode;
}

export function EmptyCartState({ action }: EmptyCartStateProps) {
  return (
    <EmptyState
      action={action}
      description="Discover handpicked textiles, crafted objects, and keepsakes made to stay with you."
      icon={ShoppingBag}
      title="Your cart is currently empty"
    />
  );
}
