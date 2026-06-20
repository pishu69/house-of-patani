import { PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCustomerOrders } from "@/hooks";
import { useCustomerStore } from "@/stores/customer.store";
import { formatCurrency, formatDate } from "@/utils";

export function OrdersPage() {
  const profile = useCustomerStore((state) => state.profile);
  const ordersQuery = useCustomerOrders();
  const orders = ordersQuery.data?.data ?? [];
  const hasContact = Boolean(profile.email || profile.phone);

  if (ordersQuery.isLoading) return <Loading />;

  return (
    <div>
      <p className="eyebrow">My orders</p>
      <h2 className="mt-2 text-3xl">Order history</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        Orders matching the email or phone saved in your profile appear here.
      </p>

      {orders.length > 0 ? (
        <div className="mt-7 space-y-4">
          {orders.map((order) => (
            <article
              className="grid gap-4 rounded-lg border border-maroon/10 bg-background p-5 sm:grid-cols-[1fr_auto] sm:items-center"
              key={order.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl">{order.order_number}</h3>
                  <span className="rounded-full bg-linen px-2.5 py-1 text-xs font-semibold capitalize text-maroon">
                    {order.order_status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDate(order.created_at)} |{" "}
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : "Razorpay"}{" "}
                  | <span className="capitalize">{order.payment_status}</span>
                </p>
                <p className="mt-2 font-semibold text-maroon">
                  {formatCurrency(order.total)}
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
                to={`${ROUTES.ACCOUNT.ORDERS_PATH}/${order.order_number}`}
              >
                View details
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <EmptyState
            action={
              hasContact ? (
                <Link to={ROUTES.ORDER_LOOKUP}>
                  <Button>Look up a guest order</Button>
                </Link>
              ) : (
                <Link to={ROUTES.ACCOUNT.PROFILE_PATH}>
                  <Button>Complete profile</Button>
                </Link>
              )
            }
            description={
              hasContact
                ? "No orders match the contact details saved on this device. You can still look up any guest order securely."
                : "Add the email or phone used at checkout to find orders saved on this device."
            }
            icon={PackageSearch}
            title="No orders yet"
          />
        </div>
      )}
    </div>
  );
}
