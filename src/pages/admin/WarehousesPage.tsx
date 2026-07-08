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
  is_active: true,
  name: "",
  pickup_pincode: "",
  shiprocket_pickup_location: "",
};

function cleanForm(form: WarehouseInput): WarehouseInput {
  return {
    is_active: form.is_active,
    name: form.name.trim(),
    pickup_pincode: form.pickup_pincode.trim(),
    shiprocket_pickup_location: form.shiprocket_pickup_location.trim(),
  };
}

function validateWarehouse(input: WarehouseInput) {
  if (
    !input.name ||
    !input.pickup_pincode ||
    !input.shiprocket_pickup_location
  ) {
    throw new Error("Please fill all required warehouse fields.");
  }

  if (!/^\d{6}$/.test(input.pickup_pincode)) {
    throw new Error("Enter a valid 6-digit pickup pincode.");
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
      is_active: warehouse.is_active,
      name: warehouse.name,
      pickup_pincode: warehouse.pickup_pincode || "",
      shiprocket_pickup_location:
        warehouse.shiprocket_pickup_location || warehouse.name,
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
      warehouseService.update(warehouse.id, {
        is_active: !warehouse.is_active,
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
      toast.success("Warehouse availability updated.", {
        description: response.warning?.message,
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "The warehouse could not be updated.",
      ),
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
          <p className="font-semibold text-charcoal">{warehouse.name}</p>
        ),
      },
      {
        header: "Shiprocket Pickup Location",
        id: "shiprocket-pickup-location",
        render: (warehouse) =>
          warehouse.shiprocket_pickup_location || warehouse.name,
      },
      {
        header: "Pickup Pincode",
        id: "pincode",
        render: (warehouse) =>
          warehouse.pickup_pincode || "-",
      },
      {
        header: "Status",
        id: "status",
        render: (warehouse) => (
          <StatusBadge
            label={
              warehouse.is_active ? "Active" : "Inactive"
            }
            tone={
              warehouse.is_active ? "positive" : "neutral"
            }
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
                icon: warehouse.is_active ? EyeOff : Eye,
                label: warehouse.is_active
                  ? "Deactivate"
                  : "Activate",
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
            Pickup pincode
            <input
              className={inputClassName}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  pickup_pincode: event.target.value.replace(/\D/g, ""),
                }))
              }
              value={form.pickup_pincode}
            />
          </label>

          <label className="text-sm font-medium text-charcoal md:col-span-2">
            Shiprocket pickup location
            <input
              className={inputClassName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shiprocket_pickup_location: event.target.value,
                }))
              }
              value={form.shiprocket_pickup_location}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-charcoal">
            <input
              checked={form.is_active}
              className="h-4 w-4 rounded border-maroon/20"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
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
      ) : warehousesQuery.isError ? (
        <EmptyAdminState
          description={
            warehousesQuery.error instanceof Error
              ? warehousesQuery.error.message
              : "Supabase could not load the warehouses table. Check its grants and RLS policies."
          }
          title="Warehouses could not be loaded"
        />
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
