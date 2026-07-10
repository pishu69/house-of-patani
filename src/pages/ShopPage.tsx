import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyProductsState } from "@/components/shop/EmptyProductsState";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { LoadingProductsSkeleton } from "@/components/shop/LoadingProductsSkeleton";
import { Pagination } from "@/components/shop/Pagination";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { ShopFilterDrawer } from "@/components/shop/ShopFilterDrawer";
import { SortDropdown } from "@/components/shop/SortDropdown";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCategories } from "@/hooks/useCategories";
import { shopSortOptions, useShopCatalog } from "@/hooks/useShopCatalog";

export function ShopPage() {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const catalog = useShopCatalog();
  const categoriesQuery = useCategories();
  const shopCategories = categoriesQuery.data?.data ?? [];
  const categoryNameBySlug = Object.fromEntries(
    shopCategories.map((category) => [category.slug, category.name]),
  );

  const resetFilters = () => {
    catalog.resetFilters();
    setIsFilterDrawerOpen(false);
  };

  const filterProps = {
    bestSeller: catalog.bestSeller,
    categories: catalog.categoryOptions,
    category: catalog.category,
    featured: catalog.featured,
    maxPrice: catalog.maxPrice,
    maxPriceLimit: catalog.maxPriceLimit,
    minPrice: catalog.minPrice,
    newArrival: catalog.newArrival,
    onBestSellerChange: catalog.setBestSeller,
    onCategoryChange: catalog.setCategory,
    onFeaturedChange: catalog.setFeatured,
    onMaxPriceChange: catalog.setMaxPrice,
    onMinPriceChange: catalog.setMinPrice,
    onNewArrivalChange: catalog.setNewArrival,
    onReset: resetFilters,
  };

  return (
    <>
      <section
        className="scroll-mt-24 bg-background pb-8 pt-5 sm:pb-10 sm:pt-6 lg:pb-12 lg:pt-8"
        id="catalog"
      >
        <div className="section-shell">
          <div className="grid gap-6 lg:grid-cols-[16.5rem_1fr] lg:gap-8">
            <div className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
                <FilterSidebar>
                  <ProductFilters {...filterProps} idPrefix="desktop" />
                </FilterSidebar>
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-lg border border-maroon/10 bg-card p-3 shadow-lift sm:p-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,34rem)_auto] lg:items-center lg:justify-between">
                  <div className="min-w-0 lg:max-w-xl">
                    <SearchBar
                      onChange={catalog.setQuery}
                      value={catalog.query}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:gap-3">
                    <Button
                      className="h-11 shrink-0 px-4 text-sm lg:hidden"
                      onClick={() => setIsFilterDrawerOpen(true)}
                      variant="outline"
                    >
                      <SlidersHorizontal aria-hidden="true" size={17} />
                      Filters
                    </Button>
                    <SortDropdown
                      onChange={catalog.setSort}
                      options={shopSortOptions}
                      value={catalog.sort}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-maroon/10 pt-3">
                  <p
                    aria-live="polite"
                    className="text-sm font-semibold text-charcoal"
                  >
                    {catalog.filteredProducts.length} Products
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    {catalog.visibleProducts.length > 0 ? (
                      <span>
                        Showing {catalog.resultStart}-{catalog.resultEnd}
                      </span>
                    ) : null}
                    {catalog.category !== "all" ? (
                      <span className="font-semibold text-maroon">
                        {categoryNameBySlug[catalog.category]}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
                {catalog.categoryOptions.map((category) => {
                  const selected = catalog.category === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => catalog.setCategory(category.value)}
                      className={
                        selected
                          ? "shrink-0 rounded-full bg-maroon px-3.5 py-2 text-xs font-semibold text-ivory shadow-lift"
                          : "shrink-0 rounded-full border border-maroon/20 bg-card px-3.5 py-2 text-xs font-semibold text-maroon"
                      }
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {catalog.isPending ? (
                <div className="mt-6">
                  <LoadingProductsSkeleton />
                </div>
              ) : catalog.visibleProducts.length > 0 ? (
                <>
                  <ProductGrid className="mt-6">
                    {catalog.visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </ProductGrid>
                  {catalog.totalPages > 1 ? (
                    <div className="mt-10">
                      <Pagination
                        currentPage={catalog.currentPage}
                        onPageChange={(page) => {
                          catalog.setPage(page);
                          document
                            .getElementById("catalog")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        totalPages={catalog.totalPages}
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-6">
                  <EmptyProductsState
                    action={
                      <div className="flex flex-col justify-center gap-2 sm:flex-row">
                        <Button onClick={resetFilters} variant="outline">
                          <RotateCcw aria-hidden="true" size={16} />
                          Clear Filters
                        </Button>
                        <Link
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
                          to={ROUTES.SHOP}
                          onClick={resetFilters}
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    }
                    description={
                      catalog.query
                        ? `No results matched "${catalog.query}". Try a broader search or reset the filters.`
                        : "No products match the selected filters. Try widening your price range or choosing another category."
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ShopFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onReset={resetFilters}
      >
        <ProductFilters {...filterProps} idPrefix="mobile" />
      </ShopFilterDrawer>
    </>
  );
}
