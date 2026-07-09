import { CategoryFilter } from "@/components/shop/CategoryFilter";
import type { CategoryFilterOption } from "@/components/shop/CategoryFilter";
import { FilterToggle } from "@/components/shop/FilterToggle";
import { PriceFilter } from "@/components/shop/PriceFilter";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  bestSeller: boolean;
  categories: CategoryFilterOption[];
  category: string;
  featured: boolean;
  idPrefix?: string;
  maxPrice: number;
  maxPriceLimit: number;
  minPrice: number;
  newArrival: boolean;
  onBestSellerChange: (value: boolean) => void;
  onCategoryChange: (value: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onMaxPriceChange: (value: number) => void;
  onMinPriceChange: (value: number) => void;
  onNewArrivalChange: (value: boolean) => void;
  onReset: () => void;
}

export function ProductFilters({
  bestSeller,
  categories,
  category,
  featured,
  idPrefix = "shop",
  maxPrice,
  maxPriceLimit,
  minPrice,
  newArrival,
  onBestSellerChange,
  onCategoryChange,
  onFeaturedChange,
  onMaxPriceChange,
  onMinPriceChange,
  onNewArrivalChange,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="space-y-5">
      <CategoryFilter
        name={`${idPrefix}-category`}
        onChange={onCategoryChange}
        options={categories}
        value={category}
      />
      <div className="h-px bg-maroon/10" />
      <PriceFilter
        maxLimit={maxPriceLimit}
        maxValue={maxPrice}
        minValue={minPrice}
        onMaxChange={onMaxPriceChange}
        onMinChange={onMinPriceChange}
      />
      <div className="h-px bg-maroon/10" />
      <fieldset>
        <legend className="font-serif text-xl text-charcoal">
          Collections
        </legend>
        <div className="mt-2 space-y-1">
          <FilterToggle
            checked={featured}
            label="Featured"
            onChange={onFeaturedChange}
          />
          <FilterToggle
            checked={bestSeller}
            label="Best sellers"
            onChange={onBestSellerChange}
          />
          <FilterToggle
            checked={newArrival}
            label="New arrivals"
            onChange={onNewArrivalChange}
          />
        </div>
      </fieldset>
      <Button fullWidth onClick={onReset} size="sm" variant="ghost">
        Reset filters
      </Button>
    </div>
  );
}
