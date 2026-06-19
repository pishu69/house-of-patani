export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  PRODUCT: "/product/:slug",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ABOUT: "/about",
  CONTACT: "/contact",
  ADMIN: {
    ROOT: "/admin",
    PRODUCTS: "products",
    ORDERS: "orders",
    CUSTOMERS: "customers",
    COUPONS: "coupons",
    SETTINGS: "settings",
  },
} as const;
