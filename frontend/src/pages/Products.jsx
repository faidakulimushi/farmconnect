import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import { SORT_OPTIONS } from "../utils/constants";
import { useDebounce } from "../hooks/useDebounce";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state (controlled)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Dynamic price range from the database
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [priceError, setPriceError] = useState("");

  // Sync state when URL search params change (e.g. navbar search navigation)
  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
    setCategory(searchParams.get("category") || "");
    setSort(searchParams.get("sort") || "newest");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const debouncedKeyword = useDebounce(keyword, 400);

  const fetchProducts = useCallback(async () => {
    // Don't fetch if the user has entered an invalid price range
    if (priceError) return;
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await productService.getAll(params);
      setProducts(data.products || []);
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, category, sort, minPrice, maxPrice, page, priceError]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  // Fetch dynamic price range on mount
  useEffect(() => {
    api.get("/products/price-range")
      .then(({ data }) => setPriceRange({ min: data.min, max: data.max }))
      .catch(() => {});
  }, []);

  const handleClearFilters = () => {
    setKeyword(""); setCategory(""); setSort("newest");
    setMinPrice(""); setMaxPrice(""); setPage(1);
    setPriceError("");
    setSearchParams({});
  };

  const handleMinPriceChange = (e) => {
    const val = e.target.value;
    setMinPrice(val);
    setPage(1);
    const min = val === "" ? 0 : Number(val);
    const max = maxPrice === "" ? priceRange.max : Number(maxPrice);
    setPriceError(min > max ? "Minimum price cannot exceed maximum price." : "");
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value;
    setMaxPrice(val);
    setPage(1);
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = val === "" ? priceRange.max : Number(val);
    setPriceError(min > max ? "Minimum price cannot exceed maximum price." : "");
  };

  const hasFilters = keyword || category || minPrice || maxPrice || sort !== "newest";

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 btn-secondary btn-sm md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}>
          <div className="card p-5 sticky top-20 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {hasFilters && (
                <button onClick={handleClearFilters} className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Search</label>
              <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} placeholder="Search products…" className="input text-sm" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input text-sm">
                <option value="">All Categories</option>
                {(categories || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sort By</label>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input text-sm">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Price Range
                {priceRange.max > 0 && (
                  <span className="ml-1 text-gray-400 font-normal">(up to ${priceRange.max.toLocaleString()})</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  min={0}
                  max={priceRange.max || undefined}
                  className={`input text-sm w-1/2 ${priceError ? "border-red-400 focus:ring-red-300" : ""}`}
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder={priceRange.max > 0 ? String(priceRange.max) : "Max"}
                  min={0}
                  max={priceRange.max || undefined}
                  className={`input text-sm w-1/2 ${priceError ? "border-red-400 focus:ring-red-300" : ""}`}
                />
              </div>
              {priceError && (
                <p className="mt-1.5 text-xs text-red-500">{priceError}</p>
              )}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner text="Loading products…" />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No products found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
              <button onClick={handleClearFilters} className="btn-primary btn-sm mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                {(products || []).map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
