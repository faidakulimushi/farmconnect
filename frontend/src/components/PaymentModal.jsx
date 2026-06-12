import { useState } from "react";
import { X, ArrowLeft, Loader2, Lock, CheckCircle } from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import toast from "react-hot-toast";

const PROVIDERS = [
  {
    id: "mpesa",
    name: "M-Pesa",
    sub: "Safaricom",
    type: "mobile",
    emoji: "🟢",
    gradient: "from-green-500 to-green-700",
    placeholder: "+254 712 345 678",
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    sub: "Airtel Africa",
    type: "mobile",
    emoji: "🔴",
    gradient: "from-red-500 to-red-700",
    placeholder: "+234 802 345 6789",
  },
  {
    id: "mtn_money",
    name: "MTN Mobile Money",
    sub: "MTN Group",
    type: "mobile",
    emoji: "🟡",
    gradient: "from-yellow-400 to-yellow-600",
    placeholder: "+237 670 123 456",
  },
  {
    id: "orange_money",
    name: "Orange Money",
    sub: "Orange Telecom",
    type: "mobile",
    emoji: "🟠",
    gradient: "from-orange-500 to-orange-700",
    placeholder: "+221 77 123 4567",
  },
  {
    id: "paypal",
    name: "PayPal",
    sub: "PayPal Inc.",
    type: "email",
    emoji: "💙",
    gradient: "from-blue-500 to-blue-800",
    placeholder: "you@paypal.com",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    sub: "Visa · Mastercard · Amex",
    type: "card",
    emoji: "💳",
    gradient: "from-slate-600 to-slate-900",
    placeholder: "",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    sub: "Any Bank",
    type: "bank",
    emoji: "🏦",
    gradient: "from-teal-500 to-teal-700",
    placeholder: "TXN-XXXXXXXXXX",
  },
];

const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtExp = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

export default function PaymentModal({ isOpen, onClose, onConfirm, amount }) {
  const [step, setStep] = useState(1); // 1=select, 2=details, 3=processing
  const [provider, setProvider] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [txRef, setTxRef] = useState("");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });

  if (!isOpen) return null;

  const reset = () => {
    setStep(1);
    setProvider(null);
    setPhone("");
    setEmail("");
    setTxRef("");
    setCard({ name: "", number: "", expiry: "", cvv: "" });
  };

  const handleClose = () => {
    if (step === 3) return;
    reset();
    onClose();
  };

  const handleSelect = (p) => {
    setProvider(p);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setProvider(null);
  };

  const handlePay = () => {
    if (provider.type === "mobile") {
      if (phone.replace(/\D/g, "").length < 9) {
        toast.error("Enter a valid phone number");
        return;
      }
    }
    if (provider.type === "email") {
      if (!email.trim() || !email.includes("@")) {
        toast.error("Enter a valid PayPal email address");
        return;
      }
    }
    if (provider.type === "card") {
      if (!card.name.trim()) { toast.error("Enter cardholder name"); return; }
      if (card.number.replace(/\s/g, "").length !== 16) { toast.error("Card number must be 16 digits"); return; }
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) { toast.error("Enter expiry as MM/YY"); return; }
      const [mm, yy] = card.expiry.split("/").map(Number);
      if (mm < 1 || mm > 12 || new Date(2000 + yy, mm - 1) < new Date()) {
        toast.error("Card is expired or invalid");
        return;
      }
      if (!/^\d{3,4}$/.test(card.cvv)) { toast.error("CVV must be 3–4 digits"); return; }
    }
    if (provider.type === "bank") {
      if (!txRef.trim()) { toast.error("Enter your transaction reference"); return; }
    }

    setStep(3);
    setTimeout(() => {
      const details =
        provider.type === "mobile" ? { phone } :
        provider.type === "email" ? { email } :
        provider.type === "card" ? { ...card } :
        { txRef };
      onConfirm({ provider: provider.id, providerName: provider.name, details });
      reset();
    }, 1800);
  };

  const stepTitle =
    step === 1 ? "Choose Payment Method" :
    step === 2 ? provider?.name :
    "Processing Payment…";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 mr-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-bold text-gray-900 dark:text-white">{stepTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            {amount && step !== 3 && (
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(amount)}
              </span>
            )}
            {step !== 3 && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Step 1 – Provider grid */}
          {step === 1 && (
            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select how you'd like to pay for your order.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all group bg-white dark:bg-gray-800 text-left"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      {p.emoji}
                    </div>
                    <div className="text-center w-full">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 – Provider form */}
          {step === 2 && provider && (
            <div className="p-5 space-y-5">
              {/* Provider banner */}
              <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${provider.gradient} text-white shadow-md`}>
                <span className="text-3xl">{provider.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">{provider.name}</p>
                  <p className="text-xs opacity-75">{provider.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs opacity-75">Amount</p>
                  <p className="font-extrabold text-xl">{formatCurrency(amount)}</p>
                </div>
              </div>

              {/* Mobile money */}
              {provider.type === "mobile" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📱 Mobile Phone Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={provider.placeholder}
                    className="input w-full text-lg font-mono"
                    inputMode="tel"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    After clicking Pay Now, you will receive a payment prompt on this number.
                    Enter your PIN to approve the payment.
                  </p>
                </div>
              )}

              {/* PayPal */}
              {provider.type === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📧 PayPal Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={provider.placeholder}
                    className="input w-full"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {formatCurrency(amount)} will be charged from your PayPal account.
                  </p>
                </div>
              )}

              {/* Card */}
              {provider.type === "card" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3.5 h-3.5 text-green-500" />
                    <span>256-bit SSL encrypted · Secure payment</span>
                  </div>
                  {/* Card preview */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-5 text-white font-mono shadow-xl select-none">
                    <div className="flex justify-between items-start mb-5">
                      <p className="text-xs opacity-50">AgriLink Pay</p>
                      <p className="text-sm font-bold opacity-70">💳</p>
                    </div>
                    <p className="text-lg tracking-[0.2em] mb-5 text-slate-200">
                      {card.number || "0000 0000 0000 0000"}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-xs opacity-50 mb-0.5">Card Holder</p>
                        <p className="uppercase font-semibold">{card.name || "YOUR NAME"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-50 mb-0.5">Expires</p>
                        <p>{card.expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cardholder Name</label>
                    <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Name on card" className="input" autoComplete="cc-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card Number</label>
                    <input value={card.number} onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })} placeholder="0000 0000 0000 0000" className="input font-mono tracking-widest" autoComplete="cc-number" inputMode="numeric" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date</label>
                      <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: fmtExp(e.target.value) })} placeholder="MM/YY" className="input" autoComplete="cc-exp" inputMode="numeric" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV</label>
                      <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="•••" type="password" className="input" autoComplete="cc-csc" inputMode="numeric" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {provider.type === "bank" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-4">
                    <p className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-3">
                      Transfer to this account:
                    </p>
                    <div className="space-y-1.5 text-sm">
                      {[
                        ["Bank", "AgriLink National Bank"],
                        ["Account Name", "AgriLink Market Ltd"],
                        ["Account No.", "0123 4567 8901"],
                        ["Sort Code", "00-00-00"],
                        ["Amount", formatCurrency(amount)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-teal-600 dark:text-teal-400 font-medium">{label}</span>
                          <span className="text-teal-800 dark:text-teal-300 font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Transaction Reference / Receipt No.
                    </label>
                    <input
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder={provider.placeholder}
                      className="input w-full font-mono"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Enter the reference number shown on your bank transfer confirmation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 – Processing */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-14 text-center px-8">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${provider?.gradient} flex items-center justify-center text-4xl mb-6 shadow-xl`}
              >
                {provider?.emoji}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                <p className="font-bold text-gray-900 dark:text-white text-xl">Processing Payment…</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Connecting to {provider?.name}
              </p>
              {provider?.type === "mobile" && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full">
                  <span>📱</span> Check your phone for a payment prompt
                </div>
              )}
              <div className="flex gap-1 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer – Pay button */}
        {step === 2 && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={handlePay}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-base bg-gradient-to-r ${provider?.gradient} hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2`}
            >
              <CheckCircle className="w-5 h-5" />
              Pay {formatCurrency(amount)} with {provider?.name}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secured &amp; encrypted payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
