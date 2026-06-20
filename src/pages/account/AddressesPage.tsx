import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AddressEditor } from "@/components/account/AddressEditor";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { IconButton } from "@/components/common/IconButton";
import { Button } from "@/components/ui/button";
import type { CustomerAddressFormValues } from "@/lib/customer-schemas";
import { customerAccountService } from "@/services";
import { useCustomerStore } from "@/stores/customer.store";
import type { CustomerAddress } from "@/types/customer-account.types";

export function AddressesPage() {
  const addresses = useCustomerStore((state) => state.addresses);
  const [editingAddress, setEditingAddress] =
    useState<CustomerAddress | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingAddress, setDeletingAddress] =
    useState<CustomerAddress | null>(null);

  function saveAddress(values: CustomerAddressFormValues) {
    if (editingAddress) {
      customerAccountService.updateAddress(editingAddress.id, values);
      toast.success("Address updated.");
    } else {
      customerAccountService.addAddress(values);
      toast.success("Address saved.");
    }
    setIsEditorOpen(false);
    setEditingAddress(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Saved addresses</p>
          <h2 className="mt-2 text-3xl">Delivery addresses</h2>
        </div>
        <Button
          onClick={() => {
            setEditingAddress(null);
            setIsEditorOpen(true);
          }}
        >
          <Plus aria-hidden="true" size={17} />
          Add address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {addresses.map((address) => (
            <article
              className="rounded-lg border border-maroon/10 bg-background p-5"
              key={address.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="text-gold" size={18} />
                    <h3 className="text-xl">{address.label}</h3>
                  </div>
                  {address.isDefault ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-maroon">
                      <Star aria-hidden="true" className="fill-gold" size={13} />
                      Default address
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <IconButton
                    aria-label={`Edit ${address.label} address`}
                    onClick={() => {
                      setEditingAddress(address);
                      setIsEditorOpen(true);
                    }}
                    size="sm"
                  >
                    <Pencil aria-hidden="true" size={16} />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${address.label} address`}
                    onClick={() => setDeletingAddress(address)}
                    size="sm"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </IconButton>
                </div>
              </div>
              <address className="mt-4 text-sm not-italic leading-6 text-muted-foreground">
                {address.line1}
                {address.line2 ? (
                  <>
                    <br />
                    {address.line2}
                  </>
                ) : null}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </address>
              {!address.isDefault ? (
                <button
                  className="mt-4 text-sm font-semibold text-maroon hover:text-maroon/70"
                  onClick={() => {
                    customerAccountService.setDefaultAddress(address.id);
                    toast.success("Default address updated.");
                  }}
                  type="button"
                >
                  Set as default
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7">
          <EmptyState
            description="Save a delivery address now for a smoother checkout later."
            icon={MapPin}
            title="No saved addresses"
          />
        </div>
      )}

      <AddressEditor
        address={editingAddress}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingAddress(null);
        }}
        onSave={saveAddress}
      />
      <ConfirmDialog
        confirmLabel="Delete address"
        description="This address will be removed from this device."
        isOpen={Boolean(deletingAddress)}
        onCancel={() => setDeletingAddress(null)}
        onConfirm={() => {
          if (deletingAddress) {
            customerAccountService.removeAddress(deletingAddress.id);
            toast.success("Address removed.");
          }
          setDeletingAddress(null);
        }}
        title="Delete saved address?"
      />
    </div>
  );
}
