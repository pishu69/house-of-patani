import { Heart, MapPin, PackageSearch, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useCustomerOrders, useWishlist } from "@/hooks";
import { useCustomerStore } from "@/stores/customer.store";

const summaryClass =
  "rounded-lg border border-maroon/10 bg-background p-5 transition hover:border-gold/60";

export function AccountDashboardPage() {
  const profile = useCustomerStore((state) => state.profile);
  const addresses = useCustomerStore((state) => state.addresses);
  const ordersQuery = useCustomerOrders();
  const wishlist = useWishlist();
  const orders = ordersQuery.data?.data ?? [];

  const summaries = [
    {
      description: profile.email || "Add your contact details",
      icon: UserRound,
      label: "Profile",
      to: ROUTES.ACCOUNT.PROFILE_PATH,
      value: profile.name || "Not completed",
    },
    {
      description: orders.length === 1 ? "order found" : "orders found",
      icon: PackageSearch,
      label: "Orders",
      to: ROUTES.ACCOUNT.ORDERS_PATH,
      value: String(orders.length),
    },
    {
      description:
        addresses.length === 1 ? "saved address" : "saved addresses",
      icon: MapPin,
      label: "Addresses",
      to: ROUTES.ACCOUNT.ADDRESSES_PATH,
      value: String(addresses.length),
    },
    {
      description:
        wishlist.items.length === 1 ? "saved piece" : "saved pieces",
      icon: Heart,
      label: "Wishlist",
      to: ROUTES.ACCOUNT.WISHLIST_PATH,
      value: String(wishlist.items.length),
    },
  ];

  return (
    <div>
      <p className="eyebrow">Account overview</p>
      <h2 className="mt-2 text-3xl">Your House of Patani</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Keep your delivery details close, revisit orders, and gather pieces
        you would like to return to.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {summaries.map(({ description, icon: Icon, label, to, value }) => (
          <Link className={summaryClass} key={label} to={to}>
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon/8 text-maroon">
                <Icon aria-hidden="true" size={19} />
              </span>
              <span className="font-serif text-3xl text-maroon">{value}</span>
            </div>
            <h3 className="mt-5 text-xl">{label}</h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
