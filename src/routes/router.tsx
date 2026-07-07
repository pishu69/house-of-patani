import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { Loading } from "@/components/common/Loading";
import { AccountLayout } from "@/layouts/AccountLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MainLayout } from "@/layouts/MainLayout";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    hydrateFallbackElement: <Loading />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          const { HomePage } = await import("@/pages/HomePage");
          return { Component: HomePage };
        },
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => {
          const { LoginPage } = await import("@/pages/LoginPage");
          return { Component: LoginPage };
        },
      },
      {
        path: ROUTES.VERIFY_OTP,
        lazy: async () => {
          const { VerifyOtpPage } = await import("@/pages/VerifyOtpPage");
          return { Component: VerifyOtpPage };
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
        path: ROUTES.POLICIES,
        lazy: async () => {
          const { PoliciesPage } = await import("@/pages/PoliciesPage");
          return { Component: PoliciesPage };
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
    hydrateFallbackElement: <Loading />,
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
                path: ROUTES.ADMIN.WAREHOUSES,
                lazy: async () => {
                  const { WarehousesPage } = await import(
                    "@/pages/admin/WarehousesPage"
                  );
                  return { Component: WarehousesPage };
                },
              },
              {
  path: "orders/:orderNumber",
  lazy: async () => {
    const { AdminOrderDetailsPage } = await import(
      "@/pages/admin/AdminOrderDetailsPage"
    );
    return { Component: AdminOrderDetailsPage };
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
                path: "/admin/categories",
                lazy: async () => {
                  const { CategoriesPage } = await import(
                    "@/pages/admin/CategoriesPage"
                  );
                  return { Component: CategoriesPage };
                },
              },
              {
  path: "/admin/messages",
                lazy: async () => {
                  const { AdminContactMessagesPage } = await import(
                    "@/pages/admin/AdminContactMessagesPage"
                  );
                  return { Component: AdminContactMessagesPage };
                },
              },
              {
                path: "/admin/newsletter",
                lazy: async () => {
                  const { AdminNewsletterPage } = await import(
                    "@/pages/admin/AdminNewsletterPage"
                  );
                  return { Component: AdminNewsletterPage };
                },
              },
              {
                path: "/admin/reviews",
                lazy: async () => {
                  const { AdminReviewsPage } = await import(
                    "@/pages/admin/AdminReviewsPage"
                  );
                  return { Component: AdminReviewsPage };
                },
              },
              {
  path: "inventory",
  lazy: async () => {
    const { AdminInventoryPage } = await import(
      "@/pages/admin/AdminInventoryPage"
    );
    return { Component: AdminInventoryPage };
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
    hydrateFallbackElement: <Loading />,
    path: "*",
    lazy: async () => {
      const { NotFoundPage } = await import("@/pages/NotFoundPage");
      return { Component: NotFoundPage };
    },
  },
]);
