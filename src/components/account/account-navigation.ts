import {
  Heart,
  House,
  MapPin,
  PackageSearch,
  UserRound,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export const accountNavigation = [
  { icon: House, label: "Overview", to: ROUTES.ACCOUNT.ROOT },
  { icon: UserRound, label: "Profile", to: ROUTES.ACCOUNT.PROFILE_PATH },
  { icon: PackageSearch, label: "My Orders", to: ROUTES.ACCOUNT.ORDERS_PATH },
  { icon: MapPin, label: "Addresses", to: ROUTES.ACCOUNT.ADDRESSES_PATH },
  { icon: Heart, label: "Wishlist", to: ROUTES.ACCOUNT.WISHLIST_PATH },
] as const;
