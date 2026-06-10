import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { orderService } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { PAYMENT_METHODS, PLACEHOLDER_IMAGE } from "../utils/constants";
import { CheckCircle, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const emptyAddress = { street: "", city: "", state: "", country: "", zip: "" };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  if (!items.length && !orderPlaced) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Your cart is empty</p>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Your order <span className="font-semibold text-gray-700 dark:text-gray-300">#{orderId?.slice(-8).toUpperCase()}</span> has been placed successfully.</p>
        <p className="text-gray-500 mb-8">We'll notify you when it's confirmed by the farmer.</p>
        <div className="flex justify-center gap-3">
          <Link to="/orders" className="btn-primary">View Orders</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [key, val] of Object.entries(address)) {
      if (!val.trim()) { toast.error(`Please fill in the ${key} field`); return; }
    }
    setSubmitting(true);
    try {
      const { data } = await orderService.create({ shippingAddress: address, paymentMethod });
      setOrderId(data.order._id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "street", label: "Street Address", full: true },
                  { key: "city", label: "City" },
                  { key: "state", label: "State / Province" },
                  { key: "country", label: "Country" },
                  { key: "zip", label: "ZIP / Postal Code" },
                ].map(({ key, label, full }) => (
                  <div key={key} className={full ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                    <input value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} placeholder={label} className="input" required />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ value, label }) => (
                  <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === value ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300"}`}>
                    <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {(items || []).map(({ product, quantity }) => (
                  <div key={product._id} className="flex gap-3">
                    <img src={product.image || PLACEHOLDER_IMAGE} alt={product.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">× {quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price * quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-5">
                <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
                {submitting ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
