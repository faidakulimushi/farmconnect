import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { formatCurrency, formatDate, statusColor, capitalise } from "../../utils/helpers";
import { ORDER_STATUSES } from "../../utils/constants";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    orderService.getAll()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success("Status updated");
    } catch { toast.error("Update failed"); }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch = !search || o._id.includes(search) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Orders</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or customer…" className="input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input text-sm w-auto">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{capitalise(s)}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
          {filtered.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-wrap text-left">
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.customer?.name}</span>
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className={`badge ${statusColor(order.status)}`}>{capitalise(order.status)}</span>
                  <span className={`badge ${statusColor(order.paymentStatus)}`}>{capitalise(order.paymentStatus)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalPrice)}</span>
                  {expandedId === order._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expandedId === order._id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img src={item.image || PLACEHOLDER_IMAGE} alt={item.title} className="w-9 h-9 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">× {item.quantity} @ {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</label>
                    <select value={order.status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)} className="input text-sm w-auto">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{capitalise(s)}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
