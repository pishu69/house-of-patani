import {
  AdminSourceBadge,
  DataTable,
  LoadingTableSkeleton,
  PageTitle,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { useCustomers } from "@/hooks";
import type { CustomerRow } from "@/types/database.types";
import { formatDate } from "@/utils";

const columns: DataTableColumn<CustomerRow>[] = [
  {
    header: "Customer",
    id: "customer",
    render: (customer) => (
      <div>
        <p className="font-semibold text-charcoal">{customer.name}</p>
        <p className="mt-0.5 text-xs">{customer.email}</p>
      </div>
    ),
  },
  {
    header: "Phone",
    id: "phone",
    render: (customer) => customer.phone ?? "Not provided",
  },
  {
    header: "Joined",
    id: "joined",
    render: (customer) => formatDate(customer.created_at),
  },
  {
    header: "Status",
    id: "status",
    render: (customer) => (
      <StatusBadge
        label={customer.active ? "Active" : "Inactive"}
        tone={customer.active ? "positive" : "neutral"}
      />
    ),
  },
];

export function CustomersPage() {
  const customersQuery = useCustomers();
  const customers = customersQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageTitle
        action={<AdminSourceBadge source={customersQuery.data?.source} />}
        description="A read-only customer directory ready for account workflows."
        title="Customers"
      />
      <div className="rounded-lg border border-maroon/10 bg-card p-4 shadow-lift">
        <p className="text-sm text-muted-foreground">
          {customers.length} customer records
        </p>
      </div>
      {customersQuery.isLoading ? (
        <LoadingTableSkeleton columns={4} rows={5} />
      ) : (
        <DataTable
          caption="Customers"
          columns={columns}
          getRowKey={(customer) => customer.id}
          rows={customers}
        />
      )}
    </div>
  );
}
