import { useState, useEffect } from "react";
import { productService } from "../services/productService";

/**
 * Fetches paginated products with optional filters.
 * Returns { products, loading, error, pagination, fetchProducts }
 */
export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchProducts = async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productService.getAll(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, loading, error, pagination, fetchProducts };
}
