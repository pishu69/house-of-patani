import { PackageSearch, Pencil, ShoppingBasket, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAddPurchaseEntry,
  useInventoryItems,
  useInventoryMovements,
  useManualStockAdjustment,
} from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/inventory";

export function AdminInventoryPage() {
  const { data: inventoryItems = [], isLoading, error } = useInventoryItems();
  const { data: inventoryMovements = [] } = useInventoryMovements(50);
  const manualAdjustment = useManualStockAdjustment();
  const addPurchaseEntry = useAddPurchaseEntry();
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [purchaseItem, setPurchaseItem] = useState<InventoryItem | null>(null);
const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
const [supplierName, setSupplierName] = useState("");
const [unitCost, setUnitCost] = useState<number>(0);
const [purchaseDate, setPurchaseDate] = useState(
  new Date().toISOString().slice(0, 10),
);
const [purchaseNotes, setPurchaseNotes] = useState("");

  const stats = useMemo(() => {
    const totalStock = inventoryItems.reduce(
      (sum, item) => sum + item.stockQuantity,
      0,
    );

    const reservedStock = inventoryItems.reduce(
      (sum, item) => sum + item.reservedQuantity,
      0,
    );

    const lowStockCount = inventoryItems.filter(
      (item) => item.status === "low_stock",
    ).length;

    const outOfStockCount = inventoryItems.filter(
      (item) => item.status === "out_of_stock",
    ).length;

    return {
      totalStock,
      reservedStock,
      lowStockCount,
      outOfStockCount,
    };
  }, [inventoryItems]);

  function openAdjustment(item: InventoryItem) {
    setAdjustingItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
  }

  function closeAdjustment() {
    setAdjustingItem(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
  }
  function openPurchase(item: InventoryItem) {
  setPurchaseItem(item);
  setPurchaseQuantity(1);
  setSupplierName("");
  setUnitCost(0);
  setPurchaseDate(new Date().toISOString().slice(0, 10));
  setPurchaseNotes("");
}

function closePurchase() {
  setPurchaseItem(null);
  setPurchaseQuantity(1);
  setSupplierName("");
  setUnitCost(0);
  setPurchaseDate(new Date().toISOString().slice(0, 10));
  setPurchaseNotes("");
}

async function submitPurchase() {
  if (!purchaseItem) return;

  if (purchaseQuantity <= 0) {
    toast.error("Purchase quantity must be greater than 0.");
    return;
  }

  try {
    await addPurchaseEntry.mutateAsync({
      inventoryItemId: purchaseItem.id,
      quantity: purchaseQuantity,
      supplierName: supplierName.trim() || undefined,
      unitCost: unitCost > 0 ? unitCost : undefined,
      purchaseDate,
      notes: purchaseNotes.trim() || undefined,
    });

    toast.success("Purchase stock added successfully.");
    closePurchase();
  } catch {
    toast.error("Purchase entry failed. Please try again.");
  }
}

  async function submitAdjustment() {
    if (!adjustingItem) return;

    if (adjustmentQuantity === 0) {
      toast.error("Adjustment quantity cannot be 0.");
      return;
    }

    if (!adjustmentReason.trim()) {
      toast.error("Please enter a reason for this stock adjustment.");
      return;
    }

    try {
      await manualAdjustment.mutateAsync({
        inventoryItemId: adjustingItem.id,
        quantity: adjustmentQuantity,
        reason: adjustmentReason.trim(),
      });

      toast.success("Inventory adjusted successfully.");
      closeAdjustment();
    } catch {
      toast.error("Inventory adjustment failed. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-stone-950">Inventory</h1>
        <p className="text-sm text-stone-500">Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-stone-950">Inventory</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load inventory. Please check Supabase table setup.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-stone-500">
            Stock Control
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">
            Inventory
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Manage product SKU, available stock, reserved stock, low-stock
            alerts, and stock movement history.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InventoryStatCard
          label="Total Stock"
          value={stats.totalStock}
          helper="All tracked stock"
        />
        <InventoryStatCard
          label="Reserved"
          value={stats.reservedStock}
          helper="Stock held for orders"
        />
        <InventoryStatCard
          label="Low Stock"
          value={stats.lowStockCount}
          helper="Needs attention"
        />
        <InventoryStatCard
          label="Out of Stock"
          value={stats.outOfStockCount}
          helper="Unavailable products"
        />
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-950">
              Inventory Items
            </h2>
            <p className="text-sm text-stone-500">
              Product-level inventory records.
            </p>
          </div>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-stone-100 p-4">
              <PackageSearch className="h-8 w-8 text-stone-500" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-stone-950">
              No inventory items yet
            </h3>
            <p className="mt-2 max-w-md text-sm text-stone-500">
              Inventory records will appear here after saving products with SKU
              and stock quantity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Reserved</th>
                  <th className="px-5 py-4">Available</th>
                  <th className="px-5 py-4">Low Stock At</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-medium text-stone-950">
                      {item.sku}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      {item.stockQuantity}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      {item.reservedQuantity}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      {item.availableQuantity}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      {item.lowStockThreshold}
                    </td>
                    <td className="px-5 py-4">
                      <InventoryStatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
  <div className="flex justify-end gap-2">
    <button
      type="button"
      onClick={() => openPurchase(item)}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
    >
      <ShoppingBasket className="h-3.5 w-3.5" />
      Purchase
    </button>

    <button
      type="button"
      onClick={() => openAdjustment(item)}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
    >
      <Pencil className="h-3.5 w-3.5" />
      Adjust
    </button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
  <div className="border-b border-stone-200 p-5">
    <h2 className="text-base font-semibold text-stone-950">
      Stock Movement History
    </h2>
    <p className="text-sm text-stone-500">
      Latest purchases, manual adjustments, and future order movements.
    </p>
  </div>

  {inventoryMovements.length === 0 ? (
    <div className="px-6 py-10 text-sm text-stone-500">
      No stock movement history yet.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Quantity</th>
            <th className="px-5 py-4">Previous</th>
            <th className="px-5 py-4">New</th>
            <th className="px-5 py-4">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {inventoryMovements.map((movement) => (
            <tr key={movement.id} className="hover:bg-stone-50">
              <td className="px-5 py-4 text-stone-700">
                {new Date(movement.createdAt).toLocaleString()}
              </td>
              <td className="px-5 py-4 font-medium text-stone-950">
                {formatMovementType(movement.movementType)}
              </td>
              <td className="px-5 py-4 text-stone-700">
                {movement.quantity > 0 ? "+" : ""}
                {movement.quantity}
              </td>
              <td className="px-5 py-4 text-stone-700">
                {movement.previousQuantity}
              </td>
              <td className="px-5 py-4 text-stone-700">
                {movement.newQuantity}
              </td>
              <td className="px-5 py-4 text-stone-700">
                {movement.reason ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
      {purchaseItem ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-stone-950">
        Add Purchase Entry
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        SKU: {purchaseItem.sku}
      </p>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Supplier / Manufacturer
          <input
            className="mt-2 h-11 w-full rounded-md border border-stone-300 px-3 text-sm"
            value={supplierName}
            onChange={(event) => setSupplierName(event.target.value)}
            placeholder="Example: Jaipur Handloom Partner"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Quantity
          <input
            className="mt-2 h-11 w-full rounded-md border border-stone-300 px-3 text-sm"
            min="1"
            type="number"
            value={purchaseQuantity}
            onChange={(event) =>
              setPurchaseQuantity(Number(event.target.value))
            }
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Unit Cost
          <input
            className="mt-2 h-11 w-full rounded-md border border-stone-300 px-3 text-sm"
            min="0"
            step="0.01"
            type="number"
            value={unitCost}
            onChange={(event) => setUnitCost(Number(event.target.value))}
            placeholder="Manufacturing cost per piece"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Purchase Date
          <input
            className="mt-2 h-11 w-full rounded-md border border-stone-300 px-3 text-sm"
            type="date"
            value={purchaseDate}
            onChange={(event) => setPurchaseDate(event.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          Notes
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            value={purchaseNotes}
            onChange={(event) => setPurchaseNotes(event.target.value)}
            placeholder="Example: first production batch, handwoven lot, fabric received"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={closePurchase}
          className="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={addPurchaseEntry.isPending}
          onClick={submitPurchase}
          className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addPurchaseEntry.isPending ? "Saving..." : "Save purchase"}
        </button>
      </div>
    </div>
  </div>
) : null}
      {adjustingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-stone-950">
              Adjust Inventory
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              SKU: {adjustingItem.sku}
            </p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-stone-700">
                Adjustment Quantity
                <input
                  className="mt-2 h-11 w-full rounded-md border border-stone-300 px-3 text-sm"
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(event) =>
                    setAdjustmentQuantity(Number(event.target.value))
                  }
                />
              </label>

              <p className="text-xs text-stone-500">
                Use positive number to add stock, for example{" "}
                <strong>10</strong>. Use negative number to reduce stock, for
                example <strong>-3</strong>.
              </p>

              <label className="block text-sm font-medium text-stone-700">
                Reason
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  value={adjustmentReason}
                  onChange={(event) =>
                    setAdjustmentReason(event.target.value)
                  }
                  placeholder="Example: stock correction, damaged item, physical count adjustment"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAdjustment}
                className="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={manualAdjustment.isPending}
                onClick={submitAdjustment}
                className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {manualAdjustment.isPending ? "Saving..." : "Save adjustment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InventoryStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-xs text-stone-500">{helper}</p>
    </div>
  );
}

function InventoryStatusBadge({
  status,
}: {
  status: "in_stock" | "low_stock" | "out_of_stock";
}) {
  if (status === "out_of_stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
        <TriangleAlert className="mr-1 h-3 w-3" />
        Out of Stock
      </span>
    );
  }

  if (status === "low_stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <TriangleAlert className="mr-1 h-3 w-3" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      In Stock
    </span>
  );
}
function formatMovementType(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}