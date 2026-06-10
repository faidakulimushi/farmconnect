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

export const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/demo/image/upload/v1/samples/food/spices.jpg";
