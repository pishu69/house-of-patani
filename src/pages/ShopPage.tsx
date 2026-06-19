import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/common/PageHero";
import { CategoryCard } from "@/components/home/CategoryCard";
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
import { categoryNameBySlug, shopCategories } from "@/data/categories";
import { shopSortOptions, useShopCatalog } from "@/hooks/useShopCatalog";

export function ShopPage() {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const catalog = useShopCatalog();

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
      <PageHero
        description="Explore textiles, jewelry, crafted objects, books, and home accents selected with a quiet sense of heritage."
        eyebrow="The Collection"
        title="Shop House of Patani"
      />

      <section className="bg-linen/55 py-12">
        <div className="section-shell">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shopCategories.map((category) => (
              <CategoryCard
                category={category}
                key={category.slug}
                to={`/shop?category=${category.slug}#catalog`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-24 bg-background py-14 sm:py-16"
        id="catalog"
      >
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <FilterSidebar>
                  <ProductFilters {...filterProps} idPrefix="desktop" />
                </FilterSidebar>
              </div>
            </div>

            <div className="min-w-0">
              <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                <SearchBar
                  onChange={catalog.setQuery}
                  value={catalog.query}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="lg:hidden"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    size="sm"
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-maroon/10 pb-5">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  Showing {catalog.resultStart}-{catalog.resultEnd} of{" "}
                  {catalog.filteredProducts.length} products
                </p>
                {catalog.category !== "all" ? (
                  <p className="text-sm font-semibold text-maroon">
                    {categoryNameBySlug[catalog.category]}
                  </p>
                ) : null}
              </div>

              {catalog.isPending ? (
                <div className="mt-8">
                  <LoadingProductsSkeleton />
                </div>
              ) : catalog.visibleProducts.length > 0 ? (
                <>
                  <ProductGrid className="mt-8">
                    {catalog.visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </ProductGrid>
                  {catalog.totalPages > 1 ? (
                    <div className="mt-12">
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
                <div className="mt-8">
                  <EmptyProductsState
                    action={
                      <Button onClick={resetFilters} variant="outline">
                        Reset filters
                      </Button>
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
      >
        <ProductFilters {...filterProps} idPrefix="mobile" />
      </ShopFilterDrawer>
    </>
  );
}
