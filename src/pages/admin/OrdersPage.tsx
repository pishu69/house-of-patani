import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminSelect,
  AdminSourceBadge,
  DataTable,
  EmptyAdminState,
  LoadingTableSkeleton,
  PageTitle,
  SearchInput,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { useOrders } from "@/hooks";
import type { OrderRow } from "@/types/database.types";
import { formatCurrency, formatDate } from "@/utils";

function orderTone(status: OrderRow["order_status"]) {
  if (status === "completed") return "positive" as const;
  if (status === "cancelled") return "negative" as const;
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

function paymentTone(status: OrderRow["payment_status"]) {
  if (status === "paid") return "positive" as const;
  if (status === "failed" || status === "refunded") {
    return "negative" as const;
  }
  return "warning" as const;
}

const columns: DataTableColumn<OrderRow>[] = [
  {
    header: "Order",
    id: "order",
    render: (order) => (
      <div>
        <p className="font-semibold text-charcoal">{order.order_number}</p>
        <p className="mt-0.5 text-xs">{formatDate(order.created_at)}</p>
      </div>
    ),
  },
  {
    header: "Customer",
    id: "customer",
    render: (order) => (
      <div>
        <p className="font-medium text-charcoal">{order.customer_name}</p>
        <p className="mt-0.5 text-xs">{order.customer_email}</p>
      </div>
    ),
  },
  {
    header: "Total",
    id: "total",
    render: (order) => (
      <span className="font-semibold text-charcoal">
        {formatCurrency(order.total)}
      </span>
    ),
  },
  {
    header: "Payment",
    id: "payment",
    render: (order) => (
      <StatusBadge
        label={order.payment_status}
        tone={paymentTone(order.payment_status)}
      />
    ),
  },
  {
    header: "Order status",
    id: "status",
    render: (order) => (
      <StatusBadge
        label={order.order_status}
        tone={orderTone(order.order_status)}
      />
    ),
  },
  {
    header: "Update",
    id: "update",
    render: (order) => (
      <select
        aria-label={`Update status for ${order.order_number}`}
        className="h-9 rounded-md border border-maroon/15 bg-card px-2 text-xs text-charcoal"
        defaultValue={order.order_status}
        onChange={() =>
          toast.info("Order updates will be enabled in Phase 7B.")
        }
      >
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    ),
  },
];

export function OrdersPage() {
  const ordersQuery = useOrders();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const orders = ordersQuery.data?.data ?? [];

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter(
      (order) =>
        (status === "all" || order.order_status === status) &&
        (payment === "all" || order.payment_status === payment) &&
        (!normalizedSearch ||
          order.order_number.toLowerCase().includes(normalizedSearch) ||
          order.customer_name.toLowerCase().includes(normalizedSearch) ||
          order.customer_email.toLowerCase().includes(normalizedSearch)),
    );
  }, [orders, payment, search, status]);

  return (
    <div className="space-y-6">
      <PageTitle
        action={<AdminSourceBadge source={ordersQuery.data?.source} />}
        description="Review fulfilment and payment states without changing live records."
        title="Orders"
      />

      <section
        aria-label="Order filters"
        className="grid gap-3 rounded-lg border border-maroon/10 bg-card p-4 shadow-lift md:grid-cols-[minmax(15rem,1fr)_12rem_12rem_auto]"
      >
        <SearchInput
          onChange={setSearch}
          placeholder="Search order or customer"
          value={search}
        />
        <AdminSelect
          label="Filter by order status"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </AdminSelect>
        <AdminSelect
          label="Filter by payment status"
          onChange={(event) => setPayment(event.target.value)}
          value={payment}
        >
          <option value="all">All payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </AdminSelect>
        <span className="self-center text-sm text-muted-foreground md:text-right">
          {filteredOrders.length} orders
        </span>
      </section>

      {ordersQuery.isLoading ? (
        <LoadingTableSkeleton columns={6} rows={6} />
      ) : filteredOrders.length > 0 ? (
        <DataTable
          caption="Orders"
          columns={columns}
          getRowKey={(order) => order.id}
          rows={filteredOrders}
        />
      ) : (
        <EmptyAdminState
          description="Try clearing the search or status filters."
          title="No orders match these filters"
        />
      )}
    </div>
  );
}
