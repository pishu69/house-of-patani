import {
  AlertTriangle,
  Boxes,
  Clock3,
  IndianRupee,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  AdminSourceBadge,
  DashboardCard,
  DataTable,
  LoadingTableSkeleton,
  PageTitle,
  StatCard,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { RatingStars } from "@/components/common/RatingStars";
import { useCustomers, useOrders, useProducts } from "@/hooks";
import { useInventoryItems } from "@/hooks/useInventory";
import type { OrderRow } from "@/types/database.types";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency, formatDate } from "@/utils";
import { categoryNameBySlug } from "@/data/categories";

function getOrderTone(status: OrderRow["order_status"]) {
  if (status === "delivered") return "positive" as const;
  if (status === "cancelled") return "negative" as const;
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

const recentOrderColumns: DataTableColumn<OrderRow>[] = [
  {
    header: "Order",
    id: "order",
    render: (order) => (
      <span className="font-semibold text-charcoal">{order.order_number}</span>
    ),
  },
  {
    header: "Customer",
    id: "customer",
    render: (order) => order.customer_name,
  },
  {
    header: "Date",
    id: "date",
    render: (order) => formatDate(order.created_at),
  },
  {
    header: "Total",
    id: "total",
    render: (order) => (
      <span className="font-medium text-charcoal">
        {formatCurrency(order.total)}
      </span>
    ),
  },
  {
    header: "Status",
    id: "status",
    render: (order) => (
      <StatusBadge
        label={order.order_status}
        tone={getOrderTone(order.order_status)}
      />
    ),
  },
];

function TopProduct({ product }: { product: CatalogProduct }) {
  return (
    <li className="flex items-center gap-3 border-b border-maroon/10 py-3 last:border-b-0">
      {product.images[0] ? (
        <img
          alt=""
          className="h-12 w-12 rounded-md object-cover"
          loading="lazy"
          src={product.images[0]}
        />
      ) : (
        <span className="h-12 w-12 rounded-md bg-linen" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.reviewCount} reviews
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-charcoal">
        {formatCurrency(product.price)}
      </p>
    </li>
  );
}

export function AdminDashboardPage() {
  const productsQuery = useProducts();
  const ordersQuery = useOrders();
  const customersQuery = useCustomers();
  const inventoryQuery = useInventoryItems();

  const products = productsQuery.data?.data ?? [];
  const orders = ordersQuery.data?.data ?? [];
  const customers = customersQuery.data?.data ?? [];
  const inventoryItems = inventoryQuery.data ?? [];
  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((total, order) => total + order.total, 0);
  const pendingOrders = orders.filter(
    (order) => order.order_status === "pending",
  ).length;
  const lowStockInventoryItems = inventoryItems.filter(
  (item) => item.status === "low_stock" || item.status === "out_of_stock",
);
  const topProducts = [...products]
    .sort(
      (left, right) =>
        right.rating * right.reviewCount - left.rating * left.reviewCount,
    )
    .slice(0, 5);
  const activeCustomers = customers.filter((customer) => customer.active);
  const orderSummary = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
  ] as const;

  return (
    <div className="space-y-8">
      <PageTitle
        action={<AdminSourceBadge source={productsQuery.data?.source} />}
        description="A calm view of catalogue health and recent store activity."
        title="Store overview"
      />

      <section
        aria-label="Store statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        <StatCard
          icon={IndianRupee}
          label="Total revenue"
          value={formatCurrency(revenue)}
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={String(orders.length)}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={String(customers.length)}
        />
        <StatCard
          icon={Boxes}
          label="Products"
          value={String(products.length)}
        />
        <StatCard
          icon={Clock3}
          label="Pending orders"
          value={String(pendingOrders)}
        />
        <StatCard
  icon={AlertTriangle}
  label="Inventory alerts"
  value={String(lowStockInventoryItems.length)}
/>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]">
        <DashboardCard
          description="The latest orders entering the fulfilment queue."
          title="Recent orders"
        >
          {ordersQuery.isLoading ? (
            <LoadingTableSkeleton columns={5} rows={5} />
          ) : (
            <DataTable
              caption="Recent orders"
              columns={recentOrderColumns}
              getRowKey={(order) => order.id}
              rows={orders.slice(0, 5)}
            />
          )}
          <Link
            className="mt-4 inline-flex text-sm font-semibold text-maroon transition hover:text-gold"
            to="/admin/orders"
          >
            View all orders
          </Link>
        </DashboardCard>

        <DashboardCard
          description="Strong catalogue performers by rating and review volume."
          title="Top products"
        >
          <ol>
            {topProducts.map((product) => (
              <TopProduct key={product.id} product={product} />
            ))}
          </ol>
        </DashboardCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <DashboardCard
          description="Current distribution across the fulfilment lifecycle."
          title="Order status"
        >
          <ul className="grid grid-cols-2 gap-3">
            {orderSummary.map((status) => (
              <li
                className="rounded-md border border-maroon/10 bg-background p-3"
                key={status.value}
              >
                <p className="text-xs text-muted-foreground">{status.label}</p>
                <p className="mt-1 text-xl font-semibold text-charcoal">
                  {
                    orders.filter(
                      (order) => order.order_status === status.value,
                    ).length
                  }
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
  description="Products using inventory thresholds and available stock."
  title="Inventory alerts"
>
  {lowStockInventoryItems.length > 0 ? (
    <ul>
      {lowStockInventoryItems.slice(0, 6).map((item) => (
        <li
          className="flex items-center justify-between gap-3 border-b border-maroon/10 py-3 last:border-b-0"
          key={item.id}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">
              {item.sku}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Available: {item.availableQuantity} · Reserved:{" "}
              {item.reservedQuantity}
            </p>
          </div>
          <StatusBadge
            label={
              item.status === "out_of_stock"
                ? "Out of stock"
                : `${item.availableQuantity} left`
            }
            tone={item.status === "out_of_stock" ? "negative" : "warning"}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">
      No inventory alerts right now.
    </p>
  )}

  <Link
    className="mt-4 inline-flex text-sm font-semibold text-maroon transition hover:text-gold"
    to="/admin/inventory"
  >
    View inventory
  </Link>
</DashboardCard>

        <DashboardCard
          description="A quick view of customer account health."
          title="Customer summary"
        >
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-maroon/10 pb-4">
              <dt className="text-sm text-muted-foreground">
                Total customers
              </dt>
              <dd className="text-xl font-semibold text-charcoal">
                {customers.length}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-maroon/10 pb-4">
              <dt className="text-sm text-muted-foreground">
                Active customers
              </dt>
              <dd className="text-xl font-semibold text-charcoal">
                {activeCustomers.length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">
                Paid-order customers
              </dt>
              <dd className="text-xl font-semibold text-charcoal">
                {
                  new Set(
                    orders
                      .filter((order) => order.payment_status === "paid")
                      .map((order) => order.customer_email),
                  ).size
                }
              </dd>
            </div>
          </dl>
        </DashboardCard>
      </section>
    </div>
  );
}
