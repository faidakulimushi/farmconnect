export const APP_NAME = "AgriLink Market";
export const APP_TAGLINE = "Farm Fresh, Delivered to You";

export const CATEGORIES_ICONS = {
  Vegetables: "🥦",
  Fruits: "🍎",
  Grains: "🌾",
  Dairy: "🥛",
  Meat: "🥩",
  Poultry: "🍗",
  Herbs: "🌿",
  Spices: "🌶️",
  Honey: "🍯",
  Eggs: "🥚",
  Other: "🌱",
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "mobile_money", label: "Mobile Money" },
];

// A grey SVG placeholder – shown only when a product has no uploaded image.
// Using a data URI avoids any external dependency and never shows a wrong image.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Crect x='140' y='130' width='120' height='90' rx='8' fill='%23d1d5db'/%3E%3Ccircle cx='170' cy='155' r='12' fill='%239ca3af'/%3E%3Cpolygon points='140,220 185,170 215,195 245,160 260,220' fill='%239ca3af'/%3E%3Ctext x='200' y='265' font-family='sans-serif' font-size='14' fill='%236b7280' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
