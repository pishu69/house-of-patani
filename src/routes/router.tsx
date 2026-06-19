import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MainLayout } from "@/layouts/MainLayout";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          const { HomePage } = await import("@/pages/HomePage");
          return { Component: HomePage };
        },
      },
      {
        path: ROUTES.SHOP,
        lazy: async () => {
          const { ShopPage } = await import("@/pages/ShopPage");
          return { Component: ShopPage };
        },
      },
      {
        path: ROUTES.PRODUCT,
        lazy: async () => {
          const { ProductPage } = await import("@/pages/ProductPage");
          return { Component: ProductPage };
        },
      },
      {
        path: "/products/:slug",
        lazy: async () => {
          const { ProductPage } = await import("@/pages/ProductPage");
          return { Component: ProductPage };
        },
      },
      {
        path: ROUTES.CART,
        lazy: async () => {
          const { CartPage } = await import("@/pages/CartPage");
          return { Component: CartPage };
        },
      },
      {
        path: ROUTES.CHECKOUT,
        lazy: async () => {
          const { CheckoutPage } = await import("@/pages/CheckoutPage");
          return { Component: CheckoutPage };
        },
      },
      {
        path: ROUTES.ABOUT,
        lazy: async () => {
          const { AboutPage } = await import("@/pages/AboutPage");
          return { Component: AboutPage };
        },
      },
      {
        path: ROUTES.CONTACT,
        lazy: async () => {
          const { ContactPage } = await import("@/pages/ContactPage");
          return { Component: ContactPage };
        },
      },
    ],
  },
  {
    path: ROUTES.ADMIN.ROOT,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { AdminDashboardPage } = await import(
            "@/pages/admin/AdminDashboardPage"
          );
          return { Component: AdminDashboardPage };
        },
      },
      {
        path: ROUTES.ADMIN.PRODUCTS,
        lazy: async () => {
          const { ProductsPage } = await import("@/pages/admin/ProductsPage");
          return { Component: ProductsPage };
        },
      },
      {
        path: ROUTES.ADMIN.PRODUCT_NEW,
        lazy: async () => {
          const { ProductEditorPage } = await import(
            "@/pages/admin/ProductEditorPage"
          );
          return { Component: ProductEditorPage };
        },
      },
      {
        path: ROUTES.ADMIN.PRODUCT_EDIT,
        lazy: async () => {
          const { ProductEditorPage } = await import(
            "@/pages/admin/ProductEditorPage"
          );
          return { Component: ProductEditorPage };
        },
      },
      {
        path: ROUTES.ADMIN.ORDERS,
        lazy: async () => {
          const { OrdersPage } = await import("@/pages/admin/OrdersPage");
          return { Component: OrdersPage };
        },
      },
      {
        path: ROUTES.ADMIN.CUSTOMERS,
        lazy: async () => {
          const { CustomersPage } = await import(
            "@/pages/admin/CustomersPage"
          );
          return { Component: CustomersPage };
        },
      },
      {
        path: ROUTES.ADMIN.COUPONS,
        lazy: async () => {
          const { CouponsPage } = await import("@/pages/admin/CouponsPage");
          return { Component: CouponsPage };
        },
      },
      {
        path: ROUTES.ADMIN.SETTINGS,
        lazy: async () => {
          const { SettingsPage } = await import("@/pages/admin/SettingsPage");
          return { Component: SettingsPage };
        },
      },
    ],
  },
  {
    path: "*",
    lazy: async () => {
      const { NotFoundPage } = await import("@/pages/NotFoundPage");
      return { Component: NotFoundPage };
    },
  },
]);
