require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// ── Route imports ─────────────────────────────
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");

// ── Bootstrap ─────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────
// CORS – allow localhost in dev + any Vercel/Render preview in production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// Accept any URL set in CLIENT_URL (supports comma-separated list)
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((u) => allowedOrigins.push(u.trim()));
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow no-origin requests (Postman, curl, mobile apps)
      if (!origin) return cb(null, true);
      // Allow any localhost port (Vite uses 5173-5200+)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      // Allow any vercel.app or onrender.com preview URL
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin)
      ) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logging – brief in production, verbose in development
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health check ──────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);

// ── Error Handling ────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server (local dev only) ─────────────
// Vercel uses module.exports = app (serverless), not app.listen()
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀  AgriLink server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

module.exports = app;
