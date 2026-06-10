import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { formatCurrency, formatDate, statusColor, capitalise } from "../../utils/helpers";
import { ORDER_STATUSES } from "../../utils/constants";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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
      toast.success("Order status updated");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders…" />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Orders</h1>

      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
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
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(order.totalPrice)}</span>
                  {expandedId === order._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandedId === order._id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-4 animate-fade-in">
                  {/* Items */}
                  <div className="space-y-2">
                    {(order.items || []).map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img src={item.image || PLACEHOLDER_IMAGE} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">× {item.quantity} @ {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Update status */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="input text-sm w-auto"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{capitalise(s)}</option>
                      ))}
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
