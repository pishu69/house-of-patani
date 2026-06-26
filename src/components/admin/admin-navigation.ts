import {
  BadgePercent,
  Boxes,
  FolderTree,
  Inbox,
  Mail,
  LayoutDashboard,
  Settings,
  ShoppingBag,
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
  { icon: ShoppingBag, label: "Orders", to: "/admin/orders" },
  { icon: Users, label: "Customers", to: "/admin/customers" },
  { icon: BadgePercent, label: "Coupons", to: "/admin/coupons" },
  { icon: FolderTree, label: "Categories", to: "/admin/categories" },
  { icon: Inbox, label: "Messages", to: "/admin/messages" },
  { icon: Mail, label: "Newsletter", to: "/admin/newsletter" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];



