import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import type { CategoryFilterOption } from "@/components/shop/CategoryFilter";
import type { SortOption } from "@/components/shop/SortDropdown";
import { shopCategories } from "@/data/categories";
import { useProducts } from "@/hooks/useProducts";
import { reviewService } from "@/services";
import { filterCatalogProducts, type ShopSort } from "@/lib/catalog";
import type { ProductCategory } from "@/types/product.types";

export type { ShopSort } from "@/lib/catalog";

type ShopCategoryFilter = "all" | ProductCategory;

interface UpdateOptions {
  replace?: boolean;
  transition?: boolean;
}

const PAGE_SIZE = 12;
const DEFAULT_MAX_PRODUCT_PRICE = 100000;

export const shopSortOptions: SortOption[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Best Sellers", value: "best-sellers" },
];

const validSorts = new Set<ShopSort>(
  shopSortOptions.map((option) => option.value as ShopSort),
);

function isProductCategory(value: string): value is ProductCategory {
  return shopCategories.some((category) => category.slug === value);
}

export function useShopCatalog() {
  const productsQuery = useProducts();

  const reviewsQuery = useQuery({
    queryKey: ["shop-review-stats"],
    queryFn: reviewService.listAll,
    staleTime: 5 * 60 * 1000,
  });

  const approvedReviews =
    reviewsQuery.data?.data.filter((review) => review.approved) ?? [];

  const products = useMemo(() => {
    const baseProducts = productsQuery.data?.data ?? [];

    return baseProducts.map((product) => {
      const productReviews = approvedReviews.filter(
        (review) => review.product_id === product.id,
      );

      if (productReviews.length === 0) {
        return {
          ...product,
          rating: 0,
          reviewCount: 0,
        };
      }

      const averageRating =
        productReviews.reduce((sum, review) => sum + review.rating, 0) /
        productReviews.length;

      return {
        ...product,
        rating: averageRating,
        reviewCount: productReviews.length,
      };
    });
  }, [approvedReviews, productsQuery.data?.data]);

  const maxProductPrice = Math.max(
    DEFAULT_MAX_PRODUCT_PRICE,
    ...products.map((product) => product.price),
  );

  const categoryOptions: CategoryFilterOption[] = [
    { count: products.length, label: "All Categories", value: "all" },
    ...shopCategories.map((category) => ({
      count: products.filter((product) => product.category === category.slug)
        .length,
      label: category.name,
      value: category.slug,
    })),
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") ?? "";
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const categoryParam = searchParams.get("category") ?? "all";
  const category: ShopCategoryFilter = isProductCategory(categoryParam)
    ? categoryParam
    : "all";
  const sortParam = searchParams.get("sort") ?? "featured";
  const sort: ShopSort = validSorts.has(sortParam as ShopSort)
    ? (sortParam as ShopSort)
    : "featured";
  const featured = searchParams.get("featured") === "true";
  const bestSeller = searchParams.get("bestSeller") === "true";
  const newArrival = searchParams.get("newArrival") === "true";
  const parsedMaxPrice = Number(searchParams.get("maxPrice"));
  const maxPrice =
    Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0
      ? Math.min(parsedMaxPrice, maxProductPrice)
      : maxProductPrice;
  const parsedMinPrice = Number(searchParams.get("minPrice"));
  const minPrice =
    Number.isFinite(parsedMinPrice) && parsedMinPrice > 0
      ? Math.min(parsedMinPrice, maxPrice)
      : 0;
  const parsedPage = Number(searchParams.get("page"));
  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const updateParams = useCallback(
    (
      updates: Record<string, string | null>,
      options: UpdateOptions = {},
    ) => {
      const nextParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      });

      const commit = () =>
        setSearchParams(nextParams, { replace: options.replace ?? false });

      if (options.transition === false) {
        commit();
      } else {
        startTransition(commit);
      }
    },
    [searchParams, setSearchParams],
  );

  const filteredProducts = useMemo(
    () =>
      filterCatalogProducts(products, {
        bestSeller,
        category,
        featured,
        maxPrice,
        minPrice,
        newArrival,
        query: deferredQuery,
        sort,
      }),
    [
      products,
      bestSeller,
      category,
      deferredQuery,
      featured,
      maxPrice,
      minPrice,
      newArrival,
      sort,
    ],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    if (requestedPage !== currentPage) {
      updateParams(
        { page: currentPage === 1 ? null : String(currentPage) },
        { replace: true },
      );
    }
  }, [currentPage, requestedPage, updateParams]);

  const resetFilters = useCallback(() => {
    startTransition(() => setSearchParams({}, { replace: true }));
  }, [setSearchParams]);

  const resultStart =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(
    currentPage * PAGE_SIZE,
    filteredProducts.length,
  );

  return {
    bestSeller,
    category,
    categoryOptions,
    currentPage,
    featured,
    filteredProducts,
    isPending: isPending || productsQuery.isLoading || reviewsQuery.isLoading,
    maxPrice,
    maxPriceLimit: maxProductPrice,
    minPrice,
    newArrival,
    query,
    resetFilters,
    resultEnd,
    resultStart,
    setBestSeller: (value: boolean) =>
      updateParams(
        { bestSeller: value ? "true" : null, page: null },
        { transition: false },
      ),
    setCategory: (value: string) =>
      updateParams(
        {
          category: value === "all" ? null : value,
          page: null,
        },
        { transition: false },
      ),
    setFeatured: (value: boolean) =>
      updateParams(
        { featured: value ? "true" : null, page: null },
        { transition: false },
      ),
    setMaxPrice: (value: number) =>
      updateParams(
        {
          maxPrice: value >= maxProductPrice ? null : String(value),
          page: null,
        },
        { replace: true, transition: false },
      ),
    setMinPrice: (value: number) =>
      updateParams(
        {
          minPrice: value <= 0 ? null : String(Math.min(value, maxPrice)),
          page: null,
        },
        { replace: true, transition: false },
      ),
    setNewArrival: (value: boolean) =>
      updateParams(
        { newArrival: value ? "true" : null, page: null },
        { transition: false },
      ),
    setPage: (page: number) =>
      updateParams({ page: page === 1 ? null : String(page) }),
    setQuery: (value: string) =>
      updateParams(
        { page: null, q: value || null },
        { replace: true, transition: false },
      ),
    setSort: (value: string) =>
      updateParams({
        page: null,
        sort: value === "featured" ? null : value,
      }),
    sort,
    totalPages,
    visibleProducts,
  };
}
