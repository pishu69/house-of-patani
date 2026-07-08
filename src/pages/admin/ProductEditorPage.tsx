import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  DashboardCard,
  EmptyAdminState,
  FormFieldError,
  PageTitle,
  ProductMediaManager,
} from "@/components/admin";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  buildProductAttributes,
  getProductAttributeTemplate,
  productAttributesToRecord,
} from "@/data/product-attribute-templates";
import {
  productQueryKeys,
  useCategories,
  useProducts,
  useWarehouses,
} from "@/hooks";

import {
  productFormSchema,
  productMediaSchema,
  type ProductFormValues,
} from "@/lib/admin-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { productImageService, productService } from "@/services";
import { inventoryService } from "@/services/inventory.service";
import { defaultProductContentFields } from "@/types/product.types";
import type {
  ProductInput,
  ProductMedia,
} from "@/types/product.types";
import { generateSlug } from "@/utils";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";
const textareaClassName =
  "mt-2 min-h-32 w-full resize-y rounded-md border border-maroon/15 bg-background px-3 py-3 text-sm text-charcoal";

const defaultValues: ProductFormValues = {
  active: true,
  bestSeller: false,
  category: "clothing",
  description: "",
  longDescription: "",
  details: "",
  careInstructions: "",
  shippingReturns: "",
  attributeValues: {},
  deliveryCodTitle: "",
  deliveryCodDescription: "",
  deliveryPaymentTitle: "",
  deliveryPaymentDescription: "",
  deliveryShippingTitle: "",
  deliveryShippingDescription: "",
  deliveryReturnsTitle: "",
  deliveryReturnsDescription: "",
  deliveryCareTitle: "",
  deliveryCareDescription: "",
  deliveryPackagingTitle: "",
  deliveryPackagingDescription: "",
  featured: false,
  name: "",
  newArrival: false,
  originalPrice: 0,
  price: 0,
  sku: "",
  slug: "",
  stock: 0,
shippingWeightKg: 0.7,
packageLengthCm: 30,
packageBreadthCm: 25,
packageHeightCm: 5,
lowStockThreshold: 5,
trackInventory: true,
allowBackorder: false,
tags: "",
warehouseId: "",
};

export function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const warehousesQuery = useWarehouses();
  const categories = categoriesQuery.data?.data ?? [];
  const activeWarehouses = (warehousesQuery.data?.data ?? []).filter(
    (warehouse) => warehouse.is_active,
  );
  const isEditing = Boolean(id);
  const product = productsQuery.data?.data.find((item) => item.id === id);
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<ProductFormValues>({ defaultValues });
  const name = watch("name");
  const slug = watch("slug");
  const selectedCategory = watch("category");
  const attributeTemplate = getProductAttributeTemplate(selectedCategory);

  useEffect(() => {
    if (!product) return;

    reset({
      active: product.active,
      bestSeller: product.bestSeller,
      category: product.category,
      description: product.description,
      longDescription: product.longDescription,
      details: product.details,
      careInstructions: product.careInstructions,
      shippingReturns: product.shippingReturns,
      attributeValues: productAttributesToRecord(product.attributes),
      deliveryCodTitle: product.deliveryCodTitle,
      deliveryCodDescription: product.deliveryCodDescription,
      deliveryPaymentTitle: product.deliveryPaymentTitle,
      deliveryPaymentDescription: product.deliveryPaymentDescription,
      deliveryShippingTitle: product.deliveryShippingTitle,
      deliveryShippingDescription: product.deliveryShippingDescription,
      deliveryReturnsTitle: product.deliveryReturnsTitle,
      deliveryReturnsDescription: product.deliveryReturnsDescription,
      deliveryCareTitle: product.deliveryCareTitle,
      deliveryCareDescription: product.deliveryCareDescription,
      deliveryPackagingTitle: product.deliveryPackagingTitle,
      deliveryPackagingDescription: product.deliveryPackagingDescription,
      featured: product.featured,
      name: product.name,
      newArrival: product.newArrival,
      originalPrice: product.originalPrice,
      price: product.price,
      sku: product.sku,
      slug: product.slug,
      stock: product.stock,
shippingWeightKg: product.shippingWeightKg,
packageLengthCm: product.packageLengthCm,
packageBreadthCm: product.packageBreadthCm,
packageHeightCm: product.packageHeightCm,
lowStockThreshold: 5,
trackInventory: true,
allowBackorder: false,
tags: product.tags.join(", "),
warehouseId: product.warehouseId ?? "",
    });
    setMedia(product.media);
  }, [product, reset]);

  useEffect(() => {
    if (!isEditing && name && !slug) {
      setValue("slug", generateSlug(name), { shouldValidate: true });
    }
  }, [isEditing, name, setValue, slug]);

  const saveMutation = useMutation({
    mutationFn: async ({
      input,
      productMedia,
    }: {
  input: ProductInput & {
    lowStockThreshold: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
  productMedia: ProductMedia[];
}) => {
      const productResponse =
        isEditing && id
          ? await productService.update(id, input)
          : await productService.create(input);
      const savedProduct = productResponse.data;

      if (!savedProduct) {
        throw new Error("PRODUCT_SAVE_FAILED");
      }

      const imageResponse = await productImageService.replaceAll(
        savedProduct.id,
        productMedia,
      );
      await inventoryService.syncProductInventory({
  productId: savedProduct.id,
  sku: input.sku,
  stockQuantity: input.stock,
  lowStockThreshold: input.lowStockThreshold,
  trackInventory: input.trackInventory,
  allowBackorder: input.allowBackorder,
});

      return {
        product: productResponse,
        images: imageResponse,
      };
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      toast.success(isEditing ? "Product updated." : "Product created.", {
        description:
          response.product.warning?.message ??
          response.images.warning?.message,
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      console.error("Admin product save failed.", error);
      toast.error("The product could not be saved.", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    },
  });

  function submitForm(values: ProductFormValues) {
    const result = productFormSchema.safeParse(values);

    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    const mediaResult = productMediaSchema.safeParse(media);
    if (!mediaResult.success) {
      toast.error(mediaResult.error.issues[0]?.message ?? "Check product images.");
      return;
    }

    const duplicateSlug = productsQuery.data?.data.some(
      (item) => item.slug === result.data.slug && item.id !== id,
    );
    const duplicateSku = productsQuery.data?.data.some(
      (item) =>
        item.sku.toLowerCase() === result.data.sku.toLowerCase() &&
        item.id !== id,
    );

    if (duplicateSlug) {
      setError("slug", { message: "This slug is already in use." });
      return;
    }

    if (duplicateSku) {
      setError("sku", { message: "This SKU is already in use." });
      return;
    }

    const { attributeValues, ...productValues } = result.data;

    saveMutation.mutate({
      input: {
        ...defaultProductContentFields,
        ...productValues,
        warehouseId: productValues.warehouseId || null,
        attributes: buildProductAttributes(
          productValues.category,
          attributeValues,
        ),
        sku: result.data.sku.toUpperCase(),
        tags: productValues.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
      },
      productMedia: mediaResult.data,
    });
  }

  if (productsQuery.isLoading && isEditing) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoadingSpinner label="Loading product" />
      </div>
    );
  }

  if (isEditing && !product) {
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
        description="This product could not be resolved from the current catalogue."
        title="Product not found"
      />
    );
  }

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(submitForm)}
    >
      <PageTitle
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/30 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
              to="/admin/products"
            >
              Cancel
            </Link>
            <Button
              disabled={saveMutation.isPending || isUploading}
              type="submit"
            >
              <Save aria-hidden="true" size={17} />
              {saveMutation.isPending ? "Saving..." : "Save product"}
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
                  placeholder="Product name"
                  {...register("name")}
                />
                <FormFieldError message={errors.name?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal sm:col-span-2">
                Short description
                <textarea
                  className={textareaClassName}
                  placeholder="A concise catalogue description"
                  {...register("description")}
                />
                <FormFieldError message={errors.description?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Price
                <input
                  className={inputClassName}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
                <FormFieldError message={errors.price?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Original price
                <input
                  className={inputClassName}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("originalPrice", { valueAsNumber: true })}
                />
                <FormFieldError message={errors.originalPrice?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Slug
                <span className="relative block">
                  <input className={`${inputClassName} pr-12`} {...register("slug")} />
                  <button
                    aria-label="Generate slug from product name"
                    className="absolute right-1 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-maroon transition hover:bg-maroon/5"
                    onClick={() =>
                      setValue("slug", generateSlug(name), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    title="Generate slug"
                    type="button"
                  >
                    <RefreshCw aria-hidden="true" size={16} />
                  </button>
                </span>
                <FormFieldError message={errors.slug?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal">
                SKU
                <input
                  className={inputClassName}
                  placeholder="HOP-0001"
                  {...register("sku")}
                />
                <FormFieldError message={errors.sku?.message} />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard
            description="Detailed content shown inside the product page tabs."
            title="Product content"
          >
            <div className="grid gap-4">
              <label className="text-sm font-medium text-charcoal">
                Long description
                <textarea
                  className={textareaClassName}
                  placeholder="Full product story, cultural background, material notes, and usage."
                  {...register("longDescription")}
                />
                <FormFieldError message={errors.longDescription?.message} />
              </label>

              <label className="text-sm font-medium text-charcoal">
                Details
                <textarea
                  className={textareaClassName}
                  placeholder="Product details, craft notes, material, dimensions, or specifications."
                  {...register("details")}
                />
                <FormFieldError message={errors.details?.message} />
              </label>

              <label className="text-sm font-medium text-charcoal">
                Care Instructions
                <textarea
                  className={textareaClassName}
                  placeholder="How customers should wash, store, clean, or care for this product."
                  {...register("careInstructions")}
                />
                <FormFieldError message={errors.careInstructions?.message} />
              </label>

              <label className="text-sm font-medium text-charcoal">
                Shipping & Returns
                <textarea
                  className={textareaClassName}
                  placeholder="Product-specific shipping, exchange, return, and dispatch details."
                  {...register("shippingReturns")}
                />
                <FormFieldError message={errors.shippingReturns?.message} />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard
            description="Product-specific delivery cards. Leave blank to use the store defaults later."
            title="Delivery information"
          >
            <div className="grid gap-5">
              {[
                ["deliveryCodTitle", "deliveryCodDescription", "Cash on Delivery"],
                ["deliveryPaymentTitle", "deliveryPaymentDescription", "Secure Payments"],
                ["deliveryShippingTitle", "deliveryShippingDescription", "Free Shipping"],
                ["deliveryReturnsTitle", "deliveryReturnsDescription", "Easy Returns"],
                ["deliveryCareTitle", "deliveryCareDescription", "Crafted with Care"],
                ["deliveryPackagingTitle", "deliveryPackagingDescription", "Safe Packaging"],
              ].map(([titleField, descriptionField, label]) => (
                <div
                  className="grid gap-3 rounded-lg border border-maroon/10 bg-background p-4 sm:grid-cols-2"
                  key={titleField}
                >
                  <label className="text-sm font-medium text-charcoal">
                    {label} title
                    <input
                      className={inputClassName}
                      placeholder={label}
                      {...register(titleField as keyof ProductFormValues)}
                    />
                  </label>

                  <label className="text-sm font-medium text-charcoal">
                    {label} description
                    <textarea
                      className={textareaClassName}
                      placeholder={`${label} description for this product`}
                      {...register(descriptionField as keyof ProductFormValues)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </DashboardCard>
          <DashboardCard
            description="Upload, describe, order, and choose the primary image."
            title="Media"
          >
            <ProductMediaManager
              images={media}
              isUploading={isUploading}
              onChange={setMedia}
              onUploadingChange={setIsUploading}
              productId={id}
              productName={name}
            />
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Organisation">
            <div className="space-y-4">
              <label className="text-sm font-medium text-charcoal">
                Category
                <select className={inputClassName} {...register("category")}>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FormFieldError message={errors.category?.message} />
              </label>
              <label className="text-sm font-medium text-charcoal">
                Fulfillment Warehouse
                <select
                  className={inputClassName}
                  disabled={warehousesQuery.isLoading}
                  {...register("warehouseId")}
                >
                  <option value="">Default Jaipur warehouse</option>
                  {activeWarehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                <FormFieldError message={errors.warehouseId?.message} />
              </label>
              {attributeTemplate.length > 0 ? (
                <div className="rounded-lg border border-maroon/10 bg-background p-4">
                  <h3 className="text-sm font-semibold text-charcoal">
                    Product attributes
                  </h3>
                  <div className="mt-4 grid gap-4">
                    {attributeTemplate.map((field) => (
                      <label
                        className="text-sm font-medium text-charcoal"
                        key={field.key}
                      >
                        {field.label}
                        {field.type === "textarea" ? (
                          <textarea
                            className={textareaClassName}
                            placeholder={field.placeholder}
                            {...register(`attributeValues.${field.key}`)}
                          />
                        ) : field.type === "select" ? (
                          <select
                            className={inputClassName}
                            {...register(`attributeValues.${field.key}`)}
                          >
                            <option value="">
                              {field.placeholder ?? `Select ${field.label}`}
                            </option>
                            {(field.options ?? []).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={inputClassName}
                            placeholder={field.placeholder}
                            type={field.type === "number" ? "number" : "text"}
                            {...register(`attributeValues.${field.key}`)}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="rounded-lg border border-maroon/10 bg-background p-4">
  <h3 className="text-sm font-semibold text-charcoal">
    Inventory Management
  </h3>
  <p className="mt-1 text-xs text-charcoal/60">
    Controls stock tracking, low stock alerts, and future order deduction.
  </p>

  <div className="mt-4 space-y-4">
    <label className="text-sm font-medium text-charcoal">
      Stock Quantity
      <input
        className={inputClassName}
        min="0"
        type="number"
        {...register("stock", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.stock?.message} />
    </label>

    <label className="text-sm font-medium text-charcoal">
      Low Stock Alert
      <input
        className={inputClassName}
        min="0"
        type="number"
        {...register("lowStockThreshold", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.lowStockThreshold?.message} />
    </label>

    <label className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-white px-4 py-3 text-sm font-medium text-charcoal">
      Track inventory
      <input
        className="h-4 w-4 accent-maroon"
        type="checkbox"
        {...register("trackInventory")}
      />
    </label>

    <label className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-white px-4 py-3 text-sm font-medium text-charcoal">
      Allow backorder
      <input
        className="h-4 w-4 accent-maroon"
        type="checkbox"
        {...register("allowBackorder")}
      />
    </label>
  </div>
</div>
              <div className="rounded-lg border border-maroon/10 bg-background p-4">
  <h3 className="text-sm font-semibold text-charcoal">
    Package Dimensions
  </h3>
  <p className="mt-1 text-xs text-charcoal/60">
    Used for Shiprocket rates, AWB assignment, and shipment creation.
  </p>

  <div className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-medium text-charcoal">
      Shipping weight in kg
      <input
        className={inputClassName}
        min="0.01"
        step="0.01"
        type="number"
        {...register("shippingWeightKg", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.shippingWeightKg?.message} />
    </label>

    <label className="text-sm font-medium text-charcoal">
      Length in cm
      <input
        className={inputClassName}
        min="0.1"
        step="0.1"
        type="number"
        {...register("packageLengthCm", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.packageLengthCm?.message} />
    </label>

    <label className="text-sm font-medium text-charcoal">
      Breadth in cm
      <input
        className={inputClassName}
        min="0.1"
        step="0.1"
        type="number"
        {...register("packageBreadthCm", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.packageBreadthCm?.message} />
    </label>

    <label className="text-sm font-medium text-charcoal">
      Height in cm
      <input
        className={inputClassName}
        min="0.1"
        step="0.1"
        type="number"
        {...register("packageHeightCm", { valueAsNumber: true })}
      />
      <FormFieldError message={errors.packageHeightCm?.message} />
    </label>
  </div>
</div>
              <label className="text-sm font-medium text-charcoal">
                Tags
                <input
                  className={inputClassName}
                  placeholder="heritage, handwoven"
                  {...register("tags")}
                />
                <FormFieldError message={errors.tags?.message} />
              </label>
            </div>
          </DashboardCard>

          <DashboardCard title="Visibility">
            <div className="space-y-3">
              {[
                ["active", "Active product"],
                ["featured", "Featured product"],
                ["bestSeller", "Best seller"],
                ["newArrival", "New arrival"],
              ].map(([field, label]) => (
                <label
                  className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-background px-4 py-3 text-sm font-medium text-charcoal"
                  key={field}
                >
                  {label}
                  <input
                    className="h-4 w-4 accent-maroon"
                    type="checkbox"
                    {...register(
                      field as
                        | "active"
                        | "bestSeller"
                        | "featured"
                        | "newArrival",
                    )}
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




