import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "faidakulimushi431@gmail.com",
    href: "mailto:faidakulimushi431@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+254 733 689 669",
    href: "tel:+254733689669",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nairobi, Kenya",
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.message.trim()) {
      errs.message = "Message is required.";
    } else if (form.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you. Fill in the form and we'll
            get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="container-custom py-14">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Get in touch</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Our team is available Monday – Friday, 8 am – 6 pm EAT.
              </p>
            </div>

            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </aside>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card p-10 flex flex-col items-center text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Message sent successfully!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Thanks for reaching out. We've sent a confirmation to your email and will reply
                  as soon as possible.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="btn-primary btn-sm mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="card p-8 space-y-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send a message</h2>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className={`input ${errors.name ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`input ${errors.email ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here…"
                    className={`input resize-none ${errors.message ? "border-red-400 focus:ring-red-300" : ""}`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
