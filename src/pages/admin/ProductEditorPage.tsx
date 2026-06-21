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
import { productQueryKeys, useCategories, useProducts } from "@/hooks";

import {
  productFormSchema,
  productMediaSchema,
  type ProductFormValues,
} from "@/lib/admin-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { productImageService, productService } from "@/services";
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
  featured: false,
  name: "",
  newArrival: false,
  originalPrice: 0,
  price: 0,
  sku: "",
  slug: "",
  stock: 0,
  tags: "",
};

export function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.data ?? [];
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

  useEffect(() => {
    if (!product) return;

    reset({
      active: product.active,
      bestSeller: product.bestSeller,
      category: product.category,
      description: product.description,
      featured: product.featured,
      name: product.name,
      newArrival: product.newArrival,
      originalPrice: product.originalPrice,
      price: product.price,
      sku: product.sku,
      slug: product.slug,
      stock: product.stock,
      tags: product.tags.join(", "),
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
      input: ProductInput;
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
    onError: () => {
      toast.error("The product could not be saved. Please try again.");
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

    saveMutation.mutate({
      input: {
        ...result.data,
        sku: result.data.sku.toUpperCase(),
        tags: result.data.tags
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
                Inventory
                <input
                  className={inputClassName}
                  min="0"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                />
                <FormFieldError message={errors.stock?.message} />
              </label>
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

