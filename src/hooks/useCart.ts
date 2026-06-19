import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { products } from "@/data/products";
import { useCartStore } from "@/stores/cart.store";
import type { CartItemView } from "@/types/cart.types";

const FREE_SHIPPING_THRESHOLD = 2999;
const STANDARD_SHIPPING = 199;
const DISCOUNT_PLACEHOLDER = 0;

export function useCart() {
  const {
    addItem,
    clearCart,
    closeDrawer,
    decreaseQuantity,
    increaseQuantity,
    isDrawerOpen,
    items,
    openDrawer,
    removeItem,
    toggleDrawer,
    updateQuantity,
  } = useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      clearCart: state.clearCart,
      closeDrawer: state.closeDrawer,
      decreaseQuantity: state.decreaseQuantity,
      increaseQuantity: state.increaseQuantity,
      isDrawerOpen: state.isDrawerOpen,
      items: state.items,
      openDrawer: state.openDrawer,
      removeItem: state.removeItem,
      toggleDrawer: state.toggleDrawer,
      updateQuantity: state.updateQuantity,
    })),
  );

  const derived = useMemo(() => {
    const cartItems = items.flatMap<CartItemView>((entry) => {
      const product = products.find((item) => item.id === entry.productId);

      if (!product) {
        return [];
      }

      return [
        {
          lineTotal: product.price * entry.quantity,
          product,
          quantity: entry.quantity,
        },
      ];
    });
    const itemCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const subtotal = cartItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );
    const discount = DISCOUNT_PLACEHOLDER;
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING;

    return {
      cartItems,
      discount,
      grandTotal: subtotal - discount + shipping,
      itemCount,
      shipping,
      subtotal,
    };
  }, [items]);

  return {
    addItem,
    clearCart,
    closeDrawer,
    decreaseQuantity,
    increaseQuantity,
    isDrawerOpen,
    items,
    openDrawer,
    removeItem,
    toggleDrawer,
    updateQuantity,
    ...derived,
  };
}
