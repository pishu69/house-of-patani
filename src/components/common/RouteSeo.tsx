import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/common/Seo";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import {
  createBreadcrumbSchema,
  organizationSchema,
  websiteSchema,
  type JsonLd,
} from "@/lib/seo";

interface RouteMetadata {
  description: string;
  noIndex?: boolean;
  title: string;
}

const routeMetadata: Record<string, RouteMetadata> = {
  [ROUTES.HOME]: {
    description: APP_CONFIG.DESCRIPTION,
    title: `${APP_CONFIG.NAME} | ${APP_CONFIG.TAGLINE}`,
  },
  [ROUTES.SHOP]: {
    description:
      "Shop House of Patani's considered collection of Indian clothing, jewelry, handicrafts, home decor, books, and accessories.",
    title: "Shop Indian Heritage Craft",
  },
  [ROUTES.CART]: {
    description: "Review the pieces selected for your House of Patani order.",
    noIndex: true,
    title: "Your Cart",
  },
  [ROUTES.CHECKOUT]: {
    description:
      "Complete your House of Patani order through our secure guest checkout.",
    noIndex: true,
    title: "Secure Checkout",
  },
  [ROUTES.ACCOUNT.ROOT]: {
    description:
      "View your House of Patani profile, orders, addresses, and wishlist.",
    noIndex: true,
    title: "Your Account",
  },
  [ROUTES.ABOUT]: {
    description:
      "Discover the story, craft traditions, and artisan communities behind House of Patani.",
    title: "Our Heritage",
  },
  [ROUTES.CONTACT]: {
    description:
      "Contact House of Patani for collection guidance, order support, and heritage craft enquiries.",
    title: "Contact",
  },
  [ROUTES.LOGIN]: {
    description:
      "Sign in securely to your House of Patani customer account with mobile OTP.",
    noIndex: true,
    title: "Customer Login",
  },
  [ROUTES.VERIFY_OTP]: {
    description: "Verify your mobile number to access your customer account.",
    noIndex: true,
    title: "Verify OTP",
  },
  [ROUTES.ORDER_LOOKUP]: {
    description:
      "Look up a House of Patani guest order using its order number and contact details.",
    noIndex: true,
    title: "Order Lookup",
  },
};

function resolveMetadata(pathname: string): RouteMetadata {
  if (pathname.startsWith(`${ROUTES.ACCOUNT.ROOT}/`)) {
    return routeMetadata[ROUTES.ACCOUNT.ROOT]!;
  }

  if (pathname.startsWith("/order-confirmation/")) {
    return {
      description:
        "Review the confirmation and delivery details for your House of Patani order.",
      noIndex: true,
      title: "Order Confirmed",
    };
  }

  const exactMetadata = routeMetadata[pathname];

  return exactMetadata ?? {
    description: APP_CONFIG.DESCRIPTION,
    title: APP_CONFIG.NAME,
  };
}

function breadcrumbFor(pathname: string, title: string): JsonLd[] {
  if (
    pathname === ROUTES.HOME ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/products/")
  ) {
    return [];
  }

  return [
    createBreadcrumbSchema([
      { name: "Home", path: ROUTES.HOME },
      { name: title, path: pathname },
    ]),
  ];
}

export function RouteSeo() {
  const { pathname } = useLocation();
  const metadata = resolveMetadata(pathname);
  const jsonLd = useMemo(() => {
    if (pathname === ROUTES.HOME) {
      return [organizationSchema, websiteSchema];
    }

    return breadcrumbFor(pathname, metadata.title);
  }, [metadata.title, pathname]);

  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/products/")
  ) {
    return null;
  }

  return (
    <Seo
      canonicalPath={pathname}
      description={metadata.description}
      jsonLd={jsonLd}
      noIndex={metadata.noIndex ?? false}
      title={metadata.title}
    />
  );
}
