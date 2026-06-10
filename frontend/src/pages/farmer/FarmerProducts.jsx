import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import toast from "react-hot-toast";

export default function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    productService.getMyProducts()
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await productService.delete(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
        <Link to="/dashboard/farmer/products/add" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading products…" />
      ) : products.length === 0 ? (
        <div className="text-center py-20 card">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4">No products listed yet</p>
          <Link to="/dashboard/farmer/products/add" className="btn-primary">List Your First Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image || PLACEHOLDER_IMAGE} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[180px]">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.quantity === 0 ? "text-red-500" : p.quantity < 10 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                        {p.quantity} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">⭐ {p.rating?.toFixed(1)} ({p.numReviews})</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/dashboard/farmer/products/edit/${p._id}`} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
