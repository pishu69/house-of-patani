import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AccountLayout } from "@/layouts/AccountLayout";
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
        path: ROUTES.ORDER_CONFIRMATION,
        lazy: async () => {
          const { OrderConfirmationPage } = await import(
            "@/pages/OrderConfirmationPage"
          );
          return { Component: OrderConfirmationPage };
        },
      },
      {
        path: ROUTES.ORDER_LOOKUP,
        lazy: async () => {
          const { OrderLookupPage } = await import("@/pages/OrderLookupPage");
          return { Component: OrderLookupPage };
        },
      },
      {
        path: ROUTES.ACCOUNT.ROOT,
        element: <AccountLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { AccountDashboardPage } = await import(
                "@/pages/account/AccountDashboardPage"
              );
              return { Component: AccountDashboardPage };
            },
          },
          {
            path: ROUTES.ACCOUNT.PROFILE,
            lazy: async () => {
              const { ProfilePage } = await import(
                "@/pages/account/ProfilePage"
              );
              return { Component: ProfilePage };
            },
          },
          {
            path: ROUTES.ACCOUNT.ORDERS,
            lazy: async () => {
              const { OrdersPage } = await import(
                "@/pages/account/OrdersPage"
              );
              return { Component: OrdersPage };
            },
          },
          {
            path: ROUTES.ACCOUNT.ORDER_DETAILS,
            lazy: async () => {
              const { OrderDetailsPage } = await import(
                "@/pages/account/OrderDetailsPage"
              );
              return { Component: OrderDetailsPage };
            },
          },
          {
            path: ROUTES.ACCOUNT.ADDRESSES,
            lazy: async () => {
              const { AddressesPage } = await import(
                "@/pages/account/AddressesPage"
              );
              return { Component: AddressesPage };
            },
          },
          {
            path: ROUTES.ACCOUNT.WISHLIST,
            lazy: async () => {
              const { WishlistPage } = await import(
                "@/pages/account/WishlistPage"
              );
              return { Component: WishlistPage };
            },
          },
        ],
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
    children: [
      {
        path: ROUTES.ADMIN.LOGIN,
        lazy: async () => {
          const { AdminLoginPage } = await import(
            "@/pages/admin/AdminLoginPage"
          );
          return { Component: AdminLoginPage };
        },
      },
      {
        element: <AdminRouteGuard />,
        children: [
          {
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
                  const { ProductsPage } = await import(
                    "@/pages/admin/ProductsPage"
                  );
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
                  const { OrdersPage } = await import(
                    "@/pages/admin/OrdersPage"
                  );
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
                  const { CouponsPage } = await import(
                    "@/pages/admin/CouponsPage"
                  );
                  return { Component: CouponsPage };
                },
              },
              {
                path: ROUTES.ADMIN.SETTINGS,
                lazy: async () => {
                  const { SettingsPage } = await import(
                    "@/pages/admin/SettingsPage"
                  );
                  return { Component: SettingsPage };
                },
              },
            ],
          },
        ],
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
