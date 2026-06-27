import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/constants/order-status";
import {
  PAYMENT_STATUSES,
  type PaymentStatus,
} from "@/constants/payment-status";
import { orderQueryKeys, useOrders } from "@/hooks";
import { orderService } from "@/services";
import type { OrderRow } from "@/types/database.types";
import { formatCurrency, formatDate } from "@/utils";

const orderStatusOptions: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: ORDER_STATUSES.PENDING },
  { label: "Confirmed", value: ORDER_STATUSES.CONFIRMED },
  { label: "Packed", value: ORDER_STATUSES.PACKED },
  { label: "Shipped", value: ORDER_STATUSES.SHIPPED },
  { label: "Delivered", value: ORDER_STATUSES.DELIVERED },
  { label: "Cancelled", value: ORDER_STATUSES.CANCELLED },
  { label: "Refunded", value: ORDER_STATUSES.REFUNDED },
];

const paymentStatusOptions: { label: string; value: PaymentStatus }[] = [
  { label: "Pending", value: PAYMENT_STATUSES.PENDING },
  { label: "Paid", value: PAYMENT_STATUSES.PAID },
  { label: "Failed", value: PAYMENT_STATUSES.FAILED },
  { label: "Refunded", value: PAYMENT_STATUSES.REFUNDED },
];

function orderTone(status: OrderStatus) {
  if (status === "delivered") return "positive" as const;
  if (status === "cancelled" || status === "refunded") {
    return "negative" as const;
  }
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

function paymentTone(status: PaymentStatus) {
  if (status === "paid") return "positive" as const;
  if (status === "failed" || status === "refunded") {
    return "negative" as const;
  }
  return "warning" as const;
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const ordersQuery = useOrders();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const orders = ordersQuery.data?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Pick<
        Partial<OrderRow>,
        "order_status" | "payment_method" | "payment_status"
      >;
    }) => orderService.update(id, input),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
      toast.success("Order updated.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The order could not be updated."),
  });

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter(
      (order) =>
        (status === "all" || order.order_status === status) &&
        (payment === "all" || order.payment_status === payment) &&
        (paymentMethod === "all" ||
          order.payment_method === paymentMethod) &&
        (!normalizedSearch ||
          order.order_number.toLowerCase().includes(normalizedSearch) ||
          order.customer_name.toLowerCase().includes(normalizedSearch) ||
          order.customer_email.toLowerCase().includes(normalizedSearch)),
    );
  }, [orders, payment, paymentMethod, search, status]);

  const columns = useMemo<DataTableColumn<OrderRow>[]>(
    () => [
      {
        header: "Order",
        id: "order",
        render: (order) => (
          <div>
            <p className="font-semibold text-charcoal">
              {order.order_number}
            </p>
            <p className="mt-0.5 text-xs">{formatDate(order.created_at)}</p>
          </div>
        ),
      },
      {
        header: "Customer",
        id: "customer",
        render: (order) => (
          <div className="min-w-44">
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
        header: "Status",
        id: "status",
        render: (order) => (
          <div className="space-y-2">
            <StatusBadge
              label={order.order_status}
              tone={orderTone(order.order_status)}
            />
            <select
              aria-label={`Order status for ${order.order_number}`}
              className="block h-9 min-w-32 rounded-md border border-maroon/15 bg-card px-2 text-xs text-charcoal"
              disabled={updateMutation.isPending}
              onChange={(event) =>
                updateMutation.mutate({
                  id: order.id,
                  input: {
                    order_status: event.target.value as OrderStatus,
                  },
                })
              }
              value={order.order_status}
            >
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ),
      },
      {
        header: "Payment",
        id: "payment",
        render: (order) => (
          <div className="min-w-44 space-y-2">
            <StatusBadge
              label={order.payment_status}
              tone={paymentTone(order.payment_status)}
            />
            <select
              aria-label={`Payment status for ${order.order_number}`}
              className="block h-9 min-w-28 rounded-md border border-maroon/15 bg-card px-2 text-xs text-charcoal"
              disabled={updateMutation.isPending}
              onChange={(event) =>
                updateMutation.mutate({
                  id: order.id,
                  input: {
                    payment_status: event.target.value as PaymentStatus,
                  },
                })
              }
              value={order.payment_status}
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {order.payment_method === "razorpay" ? (
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <p
                  className="max-w-44 truncate"
                  title={order.razorpay_payment_id ?? undefined}
                >
                  Ref: {order.razorpay_payment_id ?? "Awaiting payment"}
                </p>
                {order.paid_at ? (
                  <p>Paid {formatDate(order.paid_at)}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Payment due on delivery
              </p>
            )}
          </div>
        ),
      },
      {
        header: "View",
        id: "view",
        render: (order) => (
          <Link
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-maroon/20 px-3 text-xs font-semibold text-maroon transition hover:bg-maroon/5"
            to={`/admin/orders/${order.order_number}`}
          >
            <Eye aria-hidden="true" size={14} />
            View
          </Link>
        ),
      },
      {
        header: "Method",
        id: "method",
        render: (order) => (
          <select
            aria-label={`Payment method for ${order.order_number}`}
            className="h-9 min-w-36 rounded-md border border-maroon/15 bg-card px-2 text-xs text-charcoal"
            disabled={updateMutation.isPending}
            onChange={(event) =>
              updateMutation.mutate({
                id: order.id,
                input: { payment_method: event.target.value },
              })
            }
            value={order.payment_method}
          >
            <option value="cod">Cash on delivery</option>
            <option value="razorpay">Razorpay</option>
          </select>
        ),
      },
    ],
    [updateMutation],
  );

  return (
    <div className="space-y-6">
      <PageTitle
        action={<AdminSourceBadge source={ordersQuery.data?.source} />}
        description="Manage fulfilment, payment status, and payment method."
        title="Orders"
      />

      <section
        aria-label="Order filters"
        className="grid gap-3 rounded-lg border border-maroon/10 bg-card p-4 shadow-lift md:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_12rem_12rem_12rem_auto]"
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
          {orderStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          label="Filter by payment status"
          onChange={(event) => setPayment(event.target.value)}
          value={payment}
        >
          <option value="all">All payments</option>
          {paymentStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          label="Filter by payment method"
          onChange={(event) => setPaymentMethod(event.target.value)}
          value={paymentMethod}
        >
          <option value="all">All payment methods</option>
          <option value="cod">Cash on delivery</option>
          <option value="razorpay">Razorpay</option>
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

