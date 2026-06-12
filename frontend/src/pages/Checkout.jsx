import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { orderService } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { PLACEHOLDER_IMAGE } from "../utils/constants";
import { ShoppingBag, Truck, Globe, CheckCircle } from "lucide-react";
import PaymentModal from "../components/PaymentModal";
import toast from "react-hot-toast";

const emptyAddress = { street: "", city: "", state: "", country: "", zip: "" };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [onlinePayment, setOnlinePayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!items.length) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Your cart is empty</p>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const handlePaymentConfirmed = (payment) => {
    setOnlinePayment(payment);
    setPaymentMethod("online");
    setShowPaymentModal(false);
    toast.success(`${payment.providerName} selected`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [key, val] of Object.entries(address)) {
      if (!val.trim()) { toast.error(`Please fill in the ${key} field`); return; }
    }
    if (paymentMethod === "online" && !onlinePayment) {
      toast.error("Please select a payment method");
      setShowPaymentModal(true);
      return;
    }

    const method = paymentMethod === "online" ? onlinePayment.provider : "cash_on_delivery";
    setSubmitting(true);
    try {
      const { data } = await orderService.create({ shippingAddress: address, paymentMethod: method });
      const orderId = data.order._id;

      if (paymentMethod === "online") {
        setProcessing(true);
        await new Promise((r) => setTimeout(r, 600));
        await orderService.payOrder(orderId);
        setProcessing(false);
      }

      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  const isLoading = submitting || processing;
  const buttonLabel =
    processing ? "Confirming Payment…" :
    submitting ? "Placing Order…" :
    paymentMethod === "online" && onlinePayment ? `Pay ${formatCurrency(total)}` :
    "Place Order";

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
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
                    <input
                      value={address[key]}
                      onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                      placeholder={label}
                      className="input"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              <div className="space-y-3">

                {/* Cash on Delivery */}
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "cash_on_delivery" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={() => { setPaymentMethod("cash_on_delivery"); setOnlinePayment(null); }}
                    className="text-primary-600"
                  />
                  <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when your order arrives</p>
                  </div>
                </label>

                {/* Online Payment – opens modal */}
                <div
                  onClick={() => { setPaymentMethod("online"); setShowPaymentModal(true); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-primary-300"}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "online" ? "border-primary-600" : "border-gray-400"}`}>
                    {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                  </div>
                  <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Pay Online</p>
                    <p className="text-xs text-gray-400">M-Pesa · Airtel · MTN · PayPal · Card · Bank</p>
                  </div>
                  {onlinePayment ? (
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">
                      {onlinePayment.providerName}
                    </span>
                  ) : (
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium shrink-0">
                      Select →
                    </span>
                  )}
                </div>
              </div>

              {/* Confirmed provider badge */}
              {onlinePayment && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {onlinePayment.providerName} ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {(items || []).map(({ product, quantity }) => (
                  <div key={product._id} className="flex gap-3">
                    <img
                      src={product.image || PLACEHOLDER_IMAGE}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">× {quantity} {product.unit || "kg"}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white shrink-0">
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base gap-2 disabled:opacity-70"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </form>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirmed}
        amount={total}
      />
    </div>
  );
}

