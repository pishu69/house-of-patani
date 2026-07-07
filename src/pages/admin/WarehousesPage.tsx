import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  ActionMenu,
  AdminSourceBadge,
  ConfirmDialog,
  DataTable,
  DashboardCard,
  EmptyAdminState,
  LoadingTableSkeleton,
  PageTitle,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useWarehouses, warehouseQueryKeys } from "@/hooks";
import {
  warehouseService,
  type WarehouseInput,
} from "@/services/warehouse.service";
import type { WarehouseRow } from "@/types/database.types";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";

const defaultForm: WarehouseInput = {
  active: true,
  address_line_1: "",
  address_line_2: "",
  city: "",
  contact_person: "",
  country: "India",
  email: "",
  gst_number: "",
  name: "",
  phone: "",
  pincode: "",
  state: "",
};

function cleanForm(form: WarehouseInput): WarehouseInput {
  return {
    active: form.active,
    address_line_1: form.address_line_1.trim(),
    address_line_2: form.address_line_2?.trim() || null,
    city: form.city.trim(),
    contact_person: form.contact_person.trim(),
    country: form.country.trim() || "India",
    email: form.email.trim().toLowerCase(),
    gst_number: form.gst_number?.trim() || null,
    name: form.name.trim(),
    phone: form.phone.trim(),
    pincode: form.pincode.trim(),
    state: form.state.trim(),
  };
}

function validateWarehouse(input: WarehouseInput) {
  if (
    !input.name ||
    !input.contact_person ||
    !input.phone ||
    !input.email ||
    !input.address_line_1 ||
    !input.city ||
    !input.state ||
    !input.country ||
    !input.pincode
  ) {
    throw new Error("Please fill all required warehouse fields.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("Enter a valid warehouse email.");
  }
}

export function WarehousesPage() {
  const queryClient = useQueryClient();
  const warehousesQuery = useWarehouses();
  const warehouses = warehousesQuery.data?.data ?? [];
  const [form, setForm] = useState<WarehouseInput>(defaultForm);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseRow | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] =
    useState<WarehouseRow | null>(null);

  function resetForm() {
    setForm(defaultForm);
    setSelectedWarehouse(null);
  }

  function editWarehouse(warehouse: WarehouseRow) {
    setSelectedWarehouse(warehouse);
    setForm({
      active: warehouse.active,
      address_line_1: warehouse.address_line_1,
      address_line_2: warehouse.address_line_2 ?? "",
      city: warehouse.city,
      contact_person: warehouse.contact_person,
      country: warehouse.country,
      email: warehouse.email,
      gst_number: warehouse.gst_number ?? "",
      name: warehouse.name,
      phone: warehouse.phone,
      pincode: warehouse.pincode,
      state: warehouse.state,
    });
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = cleanForm(form);
      validateWarehouse(input);

      return selectedWarehouse
        ? warehouseService.update(selectedWarehouse.id, input)
        : warehouseService.create(input);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
      toast.success(
        selectedWarehouse ? "Warehouse updated." : "Warehouse created.",
        { description: response.warning?.message },
      );
      resetForm();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "The warehouse could not be saved.",
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (warehouse: WarehouseRow) =>
      warehouseService.update(warehouse.id, { active: !warehouse.active }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
      toast.success("Warehouse availability updated.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The warehouse could not be updated."),
  });

  const deleteMutation = useMutation({
    mutationFn: (warehouse: WarehouseRow) =>
      warehouseService.remove(warehouse.id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
      setWarehouseToDelete(null);
      toast.success("Warehouse deleted.", {
        description: response.warning?.message,
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "The warehouse could not be deleted.",
      ),
  });

  const columns = useMemo<DataTableColumn<WarehouseRow>[]>(
    () => [
      {
        header: "Warehouse",
        id: "warehouse",
        render: (warehouse) => (
          <div>
            <p className="font-semibold text-charcoal">{warehouse.name}</p>
            <p className="text-xs text-muted-foreground">
              {warehouse.city}, {warehouse.state}
            </p>
          </div>
        ),
      },
      {
        header: "Contact",
        id: "contact",
        render: (warehouse) => (
          <div>
            <p>{warehouse.contact_person}</p>
            <p className="text-xs">{warehouse.phone}</p>
            <p className="text-xs">{warehouse.email}</p>
          </div>
        ),
      },
      {
        header: "Pincode",
        id: "pincode",
        render: (warehouse) => warehouse.pincode,
      },
      {
        header: "GST",
        id: "gst",
        render: (warehouse) => warehouse.gst_number || "-",
      },
      {
        header: "Status",
        id: "status",
        render: (warehouse) => (
          <StatusBadge
            label={warehouse.active ? "Active" : "Inactive"}
            tone={warehouse.active ? "positive" : "neutral"}
          />
        ),
      },
      {
        header: "Actions",
        id: "actions",
        render: (warehouse) => (
          <ActionMenu
            items={[
              {
                icon: Pencil,
                label: "Edit warehouse",
                onSelect: () => editWarehouse(warehouse),
              },
              {
                icon: warehouse.active ? EyeOff : Eye,
                label: warehouse.active ? "Deactivate" : "Activate",
                onSelect: () => toggleMutation.mutate(warehouse),
              },
              {
                destructive: true,
                icon: Trash2,
                label: "Delete warehouse",
                onSelect: () => setWarehouseToDelete(warehouse),
              },
            ]}
            label={`Actions for ${warehouse.name}`}
          />
        ),
      },
    ],
    [toggleMutation],
  );

  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Button onClick={resetForm} type="button">
            <Plus aria-hidden="true" size={17} />
            Add warehouse
          </Button>
        }
        description="Manage fulfilment locations that can be assigned to orders."
        title="Warehouses"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {warehouses.length} warehouses
        </p>
        <AdminSourceBadge source={warehousesQuery.data?.source} />
      </div>

      <DashboardCard
        description="Warehouse details are used by order fulfilment and future shipment creation."
        title={selectedWarehouse ? "Edit warehouse" : "Add warehouse"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-charcoal">
            Warehouse name
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              value={form.name}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Contact person
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contact_person: event.target.value,
                }))
              }
              value={form.contact_person}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Phone
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              value={form.phone}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Email
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              type="email"
              value={form.email}
            />
          </label>

          <label className="text-sm font-medium text-charcoal md:col-span-2">
            Address line 1
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address_line_1: event.target.value,
                }))
              }
              value={form.address_line_1}
            />
          </label>

          <label className="text-sm font-medium text-charcoal md:col-span-2">
            Address line 2
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address_line_2: event.target.value,
                }))
              }
              value={form.address_line_2 ?? ""}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            City
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({ ...current, city: event.target.value }))
              }
              value={form.city}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            State
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({ ...current, state: event.target.value }))
              }
              value={form.state}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Country
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  country: event.target.value,
                }))
              }
              value={form.country}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            Pincode
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pincode: event.target.value,
                }))
              }
              value={form.pincode}
            />
          </label>

          <label className="text-sm font-medium text-charcoal">
            GST number
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gst_number: event.target.value,
                }))
              }
              value={form.gst_number ?? ""}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-charcoal">
            <input
              checked={form.active}
              className="h-4 w-4 rounded border-maroon/20"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Active warehouse
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            type="button"
          >
            {saveMutation.isPending ? "Saving..." : "Save warehouse"}
          </Button>

          {selectedWarehouse ? (
            <Button onClick={resetForm} type="button" variant="outline">
              Cancel edit
            </Button>
          ) : null}
        </div>
      </DashboardCard>

      {warehousesQuery.isLoading ? (
        <LoadingTableSkeleton columns={6} rows={4} />
      ) : warehouses.length > 0 ? (
        <DataTable
          caption="Warehouses"
          columns={columns}
          getRowKey={(warehouse) => warehouse.id}
          rows={warehouses}
        />
      ) : (
        <EmptyAdminState
          description="Create your first fulfilment warehouse."
          title="No warehouses yet"
        />
      )}

      <ConfirmDialog
        confirmDisabled={deleteMutation.isPending}
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        description={`Delete ${warehouseToDelete?.name ?? "this warehouse"}? Warehouses assigned to orders cannot be deleted.`}
        isOpen={warehouseToDelete !== null}
        onCancel={() => setWarehouseToDelete(null)}
        onConfirm={() => {
          if (warehouseToDelete) deleteMutation.mutate(warehouseToDelete);
        }}
        title="Delete warehouse"
      />
    </div>
  );
}
