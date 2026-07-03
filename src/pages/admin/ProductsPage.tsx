import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  ActionMenu,
  AdminSelect,
  AdminSourceBadge,
  ConfirmDialog,
  DataTable,
  EmptyAdminState,
  LoadingTableSkeleton,
  PageTitle,
  SearchInput,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { Pagination } from "@/components/shop/Pagination";
import { categoryNameBySlug, shopCategories } from "@/data/categories";
import { productQueryKeys, useProducts } from "@/hooks";
import { productService } from "@/services";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency } from "@/utils";

type ProductStatusFilter = "all" | "active" | "inactive";
type ProductStockFilter =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";
type ProductSort =
  | "newest"
  | "name-asc"
  | "price-asc"
  | "price-desc"
  | "stock-asc";

const PAGE_SIZE = 10;

function getStockState(product: CatalogProduct) {
  if (product.stock === 0) {
    return { label: "Out of stock", tone: "negative" as const };
  }
  if (product.stock <= 5) {
    return { label: "Low stock", tone: "warning" as const };
  }
  return { label: "In stock", tone: "positive" as const };
}

function matchesStockFilter(
  product: CatalogProduct,
  filter: ProductStockFilter,
) {
  if (filter === "out-of-stock") return product.stock === 0;
  if (filter === "low-stock") return product.stock > 0 && product.stock <= 5;
  if (filter === "in-stock") return product.stock > 5;
  return true;
}

function sortProducts(products: CatalogProduct[], sort: ProductSort) {
  return [...products].sort((left, right) => {
    if (sort === "name-asc") return left.name.localeCompare(right.name);
    if (sort === "price-asc") return left.price - right.price;
    if (sort === "price-desc") return right.price - left.price;
    if (sort === "stock-asc") return left.stock - right.stock;
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const productsQuery = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [stock, setStock] = useState<ProductStockFilter>("all");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [productToDelete, setProductToDelete] =
    useState<CatalogProduct | null>(null);
  const products = productsQuery.data?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      active,
    }: {
      active: boolean;
      id: string;
    }) => productService.update(id, { active }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      toast.success("Product visibility updated.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The product could not be updated."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      setProductToDelete(null);
      toast.success("Product deleted.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The product could not be deleted."),
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter(
      (product) =>
        (category === "all" || product.category === category) &&
        (status === "all" ||
          (status === "active" ? product.active : !product.active)) &&
        matchesStockFilter(product, stock) &&
        (!normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.sku.toLowerCase().includes(normalizedSearch) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch),
          )),
    );

    return sortProducts(filtered, sort);
  }, [category, products, search, sort, status, stock]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => setPage(1), [category, search, sort, status, stock]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const columns = useMemo<DataTableColumn<CatalogProduct>[]>(
    () => [
      {
        header: "Select",
        id: "select",
        render: (product) => (
          <input
            aria-label={`Select ${product.name}`}
            checked={selectedIds.has(product.id)}
            className="h-4 w-4 accent-maroon"
            onChange={() => toggleSelection(product.id)}
            type="checkbox"
          />
        ),
      },
      {
        header: "Product",
        id: "product",
        render: (product) => (
          <div className="flex min-w-60 items-center gap-3">
            {product.images[0] ? (
              <img
                alt=""
                className="h-12 w-12 rounded-md object-cover"
                loading="lazy"
                src={product.images[0]}
              />
            ) : (
              <span className="h-12 w-12 rounded-md bg-linen" />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-charcoal">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs">
                {product.sku} Â· {categoryNameBySlug[product.category]}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Price",
        id: "price",
        render: (product) => (
          <span className="font-medium text-charcoal">
            {formatCurrency(product.price)}
          </span>
        ),
      },
      {
        header: "Rating",
        id: "rating",
        render: (product) => (
          <div className="space-y-1">
            <p className="font-medium text-charcoal">
              {product.rating > 0 ? `${product.rating.toFixed(1)} / 5` : "No rating"}
            </p>
            <p className="text-xs text-charcoal/60">
              {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        ),
      },
      {
        header: "Inventory",
        id: "inventory",
        render: (product) => {
          const stockState = getStockState(product);
          return (
            <div className="space-y-1">
              <p>{product.stock} units</p>
              <StatusBadge
                label={stockState.label}
                tone={stockState.tone}
              />
            </div>
          );
        },
      },
      {
        header: "Visibility",
        id: "visibility",
        render: (product) => (
          <StatusBadge
            label={product.active ? "Active" : "Inactive"}
            tone={product.active ? "positive" : "neutral"}
          />
        ),
      },
      {
        header: "Actions",
        id: "actions",
        render: (product) => (
          <ActionMenu
            items={[
              {
                icon: Pencil,
                label: "Edit product",
                onSelect: () => {
                  navigate(`/admin/products/${product.id}/edit`);
                },
              },
              {
                icon: product.active ? EyeOff : Eye,
                label: product.active ? "Deactivate" : "Activate",
                onSelect: () =>
                  updateMutation.mutate({
                    active: !product.active,
                    id: product.id,
                  }),
              },
              {
                destructive: true,
                icon: Trash2,
                label: "Delete product",
                onSelect: () => setProductToDelete(product),
              },
            ]}
            label={`Actions for ${product.name}`}
          />
        ),
      },
    ],
    [navigate, selectedIds, updateMutation],
  );

  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
            to="/admin/products/new"
          >
            <Plus aria-hidden="true" size={17} />
            Add product
          </Link>
        }
        description="Manage catalogue details, availability, and inventory."
        title="Products"
      />

      <section
        aria-label="Product filters"
        className="grid gap-3 rounded-lg border border-maroon/10 bg-card p-4 shadow-lift md:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_11rem_10rem_11rem_11rem]"
      >
        <SearchInput
          onChange={setSearch}
          placeholder="Search name, SKU, or tags"
          value={search}
        />
        <AdminSelect
          label="Filter by category"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="all">All categories</option>
          {shopCategories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          label="Filter by status"
          onChange={(event) =>
            setStatus(event.target.value as ProductStatusFilter)
          }
          value={status}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </AdminSelect>
        <AdminSelect
          label="Filter by stock"
          onChange={(event) =>
            setStock(event.target.value as ProductStockFilter)
          }
          value={stock}
        >
          <option value="all">All inventory</option>
          <option value="in-stock">In stock</option>
          <option value="low-stock">Low stock</option>
          <option value="out-of-stock">Out of stock</option>
        </AdminSelect>
        <AdminSelect
          label="Sort products"
          onChange={(event) => setSort(event.target.value as ProductSort)}
          value={sort}
        >
          <option value="newest">Newest</option>
          <option value="name-asc">Name A-Z</option>
          <option value="price-asc">Price low-high</option>
          <option value="price-desc">Price high-low</option>
          <option value="stock-asc">Lowest stock</option>
        </AdminSelect>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} products
          {selectedIds.size > 0 ? ` Â· ${selectedIds.size} selected` : ""}
        </p>
        <AdminSourceBadge source={productsQuery.data?.source} />
      </div>

      {productsQuery.isLoading ? (
        <LoadingTableSkeleton columns={6} rows={8} />
      ) : paginatedProducts.length > 0 ? (
        <>
          <DataTable
            caption="Product catalogue"
            columns={columns}
            getRowKey={(product) => product.id}
            rows={paginatedProducts}
          />
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            totalPages={pageCount}
          />
        </>
      ) : (
        <EmptyAdminState
          description="Try adjusting the search, category, status, or inventory filters."
          title="No products match these filters"
        />
      )}

      <ConfirmDialog
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        confirmDisabled={deleteMutation.isPending}
        description={`Delete ${productToDelete?.name ?? "this product"}? This cannot be undone.`}
        isOpen={productToDelete !== null}
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) deleteMutation.mutate(productToDelete.id);
        }}
        title="Delete product"
      />
    </div>
  );
}

