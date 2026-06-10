import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { Trash2, Search } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import toast from "react-hot-toast";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchProducts = (p = page) => {
    setLoading(true);
    productService.getAll({ page: p, limit: 15, keyword: search || undefined })
      .then(({ data }) => { setProducts(data.products || []); setPagination({ pages: data.pages || 1, total: data.total || 0 }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(1); };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await productService.delete(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
        <span className="text-sm text-gray-500">{pagination.total} total products</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input pl-9 text-sm" />
        </div>
        <button type="submit" className="btn-primary btn-sm">Search</button>
      </form>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Farmer</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(products || []).map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image || PLACEHOLDER_IMAGE} alt={p.title} className="w-9 h-9 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                          <span className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[160px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.farmer?.farmName || p.farmer?.name}</td>
                      <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.quantity} {p.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${p.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No products found.</p>}
            </div>
          </div>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
