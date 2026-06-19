import { ImageIcon, Save } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  DashboardCard,
  EmptyAdminState,
  PageTitle,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { shopCategories } from "@/data/categories";
import { useProducts } from "@/hooks";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";
const textareaClassName =
  "mt-2 min-h-32 w-full resize-y rounded-md border border-maroon/15 bg-background px-3 py-3 text-sm text-charcoal";

export function ProductEditorPage() {
  const { id } = useParams();
  const productsQuery = useProducts();
  const isEditing = Boolean(id);
  const product = productsQuery.data?.data.find((item) => item.id === id);

  if (isEditing && !productsQuery.isLoading && !product) {
    return (
      <EmptyAdminState
        action={
          <Link
            className="font-semibold text-maroon hover:text-gold"
            to="/admin/products"
          >
            Return to products
          </Link>
        }
        description="This preview record could not be resolved from the current catalogue."
        title="Product not found"
      />
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.info("Product saving will be enabled in Phase 7B.");
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <PageTitle
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/30 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
              to="/admin/products"
            >
              Cancel
            </Link>
            <Button type="submit">
              <Save aria-hidden="true" size={17} />
              Save product
            </Button>
          </div>
        }
        description="Manage catalogue details, pricing, inventory, and merchandising."
        title={isEditing ? "Edit product" : "Add product"}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
        <div className="space-y-6">
          <DashboardCard title="Product information">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-charcoal sm:col-span-2">
                Product name
                <input
                  className={inputClassName}
                  defaultValue={product?.name}
                  placeholder="Product name"
                  type="text"
                />
              </label>
              <label className="text-sm font-medium text-charcoal sm:col-span-2">
                Short description
                <textarea
                  className={textareaClassName}
                  defaultValue={product?.description}
                  placeholder="A concise catalogue description"
                />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Price
                <input
                  className={inputClassName}
                  defaultValue={product?.price}
                  min="0"
                  type="number"
                />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Original price
                <input
                  className={inputClassName}
                  defaultValue={product?.originalPrice}
                  min="0"
                  type="number"
                />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard
            description="A dedicated space for product photography."
            title="Media"
          >
            <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-maroon/20 bg-background p-6 text-center">
              <ImageIcon aria-hidden="true" className="text-gold" size={28} />
              <p className="mt-3 text-sm font-semibold text-charcoal">
                Product media workspace
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Media management is currently read-only.
              </p>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Organisation">
            <div className="space-y-4">
              <label className="text-sm font-medium text-charcoal">
                Category
                <select
                  className={inputClassName}
                  defaultValue={product?.category ?? ""}
                >
                  <option disabled value="">
                    Select category
                  </option>
                  {shopCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-charcoal">
                Inventory
                <input
                  className={inputClassName}
                  defaultValue={product?.stock}
                  min="0"
                  type="number"
                />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Tags
                <input
                  className={inputClassName}
                  defaultValue={product?.tags.join(", ")}
                  placeholder="heritage, handwoven"
                  type="text"
                />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard title="Merchandising">
            <div className="space-y-3">
              {[
                ["Featured product", product?.featured],
                ["Best seller", product?.bestSeller],
                ["New arrival", product?.newArrival],
              ].map(([label, checked]) => (
                <label
                  className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-background px-4 py-3 text-sm font-medium text-charcoal"
                  key={String(label)}
                >
                  {String(label)}
                  <input
                    className="h-4 w-4 accent-maroon"
                    defaultChecked={Boolean(checked)}
                    type="checkbox"
                  />
                </label>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </form>
  );
}
