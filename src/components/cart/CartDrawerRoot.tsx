import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartDrawerContent } from "@/components/cart/CartDrawerContent";
import { useCart } from "@/hooks/useCart";

export function CartDrawerRoot() {
  const { closeDrawer, isDrawerOpen, itemCount } = useCart();

  return (
    <CartDrawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={`Your Cart (${itemCount})`}
    >
      <CartDrawerContent />
    </CartDrawer>
  );
}
