import { Trash2 } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { formatCurrency } from "@/utils";

export interface CartLineItem {
  id: string;
  imageUrl?: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface CartItemProps {
  item: CartLineItem;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <article className="grid grid-cols-[5rem_1fr] gap-4 border-b border-maroon/10 py-5 sm:grid-cols-[6rem_1fr_auto]">
      <div className="aspect-square overflow-hidden rounded-md bg-linen">
        {item.imageUrl ? (
          <img
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
            src={item.imageUrl}
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-2xl">{item.name}</h3>
        {item.variant ? (
          <p className="mt-1 text-xs text-muted-foreground">{item.variant}</p>
        ) : null}
        <p className="mt-2 text-sm font-semibold text-maroon">
          {formatCurrency(item.price)}
        </p>
        <div className="mt-4 sm:hidden">
          <QuantitySelector
            onChange={onQuantityChange}
            quantity={item.quantity}
          />
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end">
        <div className="hidden sm:block">
          <QuantitySelector
            onChange={onQuantityChange}
            quantity={item.quantity}
          />
        </div>
        <IconButton
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          size="sm"
          variant="ghost"
        >
          <Trash2 aria-hidden="true" size={17} />
        </IconButton>
      </div>
    </article>
  );
}
