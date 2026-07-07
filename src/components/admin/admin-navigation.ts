import {
  BadgePercent,
  Boxes,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Mail,
  PackageSearch,
  Settings,
  ShoppingBag,
  Warehouse,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavigationItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

export const adminNavigation: AdminNavigationItem[] = [
  { icon: LayoutDashboard, label: "Overview", to: "/admin" },
  { icon: Boxes, label: "Products", to: "/admin/products" },
  { icon: PackageSearch, label: "Inventory", to: "/admin/inventory" },
  { icon: ShoppingBag, label: "Orders", to: "/admin/orders" },
  { icon: Warehouse, label: "Warehouses", to: "/admin/warehouses" },
  { icon: Users, label: "Customers", to: "/admin/customers" },
  { icon: BadgePercent, label: "Coupons", to: "/admin/coupons" },
  { icon: FolderTree, label: "Categories", to: "/admin/categories" },
  { icon: Inbox, label: "Messages", to: "/admin/messages" },
  { icon: Mail, label: "Newsletter", to: "/admin/newsletter" },
  { icon: Star, label: "Reviews", to: "/admin/reviews" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];
