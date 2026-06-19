import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  AdminSelect,
  AdminSourceBadge,
  DataTable,
  EmptyAdminState,
  LoadingTableSkeleton,
  PageTitle,
  SearchInput,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { categoryNameBySlug, shopCategories } from "@/data/categories";
import { useProducts } from "@/hooks";
import type { CatalogProduct } from "@/types/product.types";
import { formatCurrency } from "@/utils";

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

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
  filter: StockFilter,
) {
  if (filter === "out-of-stock") return product.stock === 0;
  if (filter === "low-stock") return product.stock > 0 && product.stock <= 5;
  if (filter === "in-stock") return product.stock > 5;
  return true;
}

const columns: DataTableColumn<CatalogProduct>[] = [
  {
    header: "Product",
    id: "product",
    render: (product) => (
      <div className="flex min-w-56 items-center gap-3">
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
          <p className="truncate font-semibold text-charcoal">{product.name}</p>
          <p className="mt-0.5 text-xs">{categoryNameBySlug[product.category]}</p>
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
    header: "Inventory",
    id: "inventory",
    render: (product) => `${product.stock} units`,
  },
  {
    header: "Status",
    id: "status",
    render: (product) => {
      const status = getStockState(product);
      return <StatusBadge label={status.label} tone={status.tone} />;
    },
  },
  {
    header: "Actions",
    id: "actions",
    render: (product) => (
      <div className="flex items-center gap-1">
        <Link
          aria-label={`Edit ${product.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
          title="Edit product"
          to={`/admin/products/${product.id}/edit`}
        >
          <Pencil aria-hidden="true" size={16} />
        </Link>
        <button
          aria-label={`Delete ${product.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive transition hover:bg-destructive/5"
          onClick={() =>
            toast.info("Product deletion will be enabled in Phase 7B.")
          }
          title="Delete product"
          type="button"
        >
          <Trash2 aria-hidden="true" size={16} />
        </button>
      </div>
    ),
  },
];

export function ProductsPage() {
  const productsQuery = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const products = productsQuery.data?.data ?? [];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        (category === "all" || product.category === category) &&
        matchesStockFilter(product, stock) &&
        (!normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch),
          )),
    );
  }, [category, products, search, stock]);

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
        description="Review catalogue details, inventory, and merchandising state."
        title="Products"
      />

      <section
        aria-label="Product filters"
        className="grid gap-3 rounded-lg border border-maroon/10 bg-card p-4 shadow-lift md:grid-cols-[minmax(15rem,1fr)_13rem_12rem_auto]"
      >
        <SearchInput
          onChange={setSearch}
          placeholder="Search products or tags"
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
          label="Filter by stock status"
          onChange={(event) => setStock(event.target.value as StockFilter)}
          value={stock}
        >
          <option value="all">All statuses</option>
          <option value="in-stock">In stock</option>
          <option value="low-stock">Low stock</option>
          <option value="out-of-stock">Out of stock</option>
        </AdminSelect>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} products
          </span>
          <AdminSourceBadge source={productsQuery.data?.source} />
        </div>
      </section>

      {productsQuery.isLoading ? (
        <LoadingTableSkeleton columns={5} rows={8} />
      ) : filteredProducts.length > 0 ? (
        <DataTable
          caption="Product catalogue"
          columns={columns}
          getRowKey={(product) => product.id}
          rows={filteredProducts}
        />
      ) : (
        <EmptyAdminState
          description="Try adjusting the search, category, or inventory status."
          title="No products match these filters"
        />
      )}
    </div>
  );
}
