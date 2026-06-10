# AgriLink Market 🌱

**AI-Powered Farmers Marketplace** – connecting farmers directly with customers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Images | Cloudinary |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | react-hot-toast |

---

## Project Structure

```
farmconnect/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Helpers
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/  # Reusable UI
        ├── context/     # Auth, Cart, Wishlist, Theme
        ├── hooks/       # Custom hooks
        ├── layouts/     # MainLayout, DashboardLayout
        ├── pages/       # All page components
        ├── services/    # Axios API wrappers
        └── utils/       # Helpers & constants
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env
```

### 3. Run development servers

```bash
# Terminal 1 – Backend (port 5000)
cd backend && npm run dev

# Terminal 2 – Frontend (port 5173)
cd frontend && npm run dev
```

### 4. Seed initial categories (optional, via MongoDB Compass or Atlas)

```json
[
  { "name": "Vegetables" },
  { "name": "Fruits" },
  { "name": "Grains" },
  { "name": "Dairy" },
  { "name": "Meat" },
  { "name": "Herbs" },
  { "name": "Eggs" },
  { "name": "Honey" }
]
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register user |
| POST | /api/login | Login |
| GET | /api/products | List products |
| GET | /api/products/:id | Product detail |
| POST | /api/products | Create product (farmer) |
| GET | /api/cart | Get cart |
| POST | /api/cart | Add to cart |
| POST | /api/orders | Place order |
| GET | /api/orders | My orders |
| POST | /api/reviews | Leave review |

---

## Deployment

- **Frontend** → Vercel (`npm run build` → deploy `frontend/dist`)
- **Backend** → Render (set env vars in Render dashboard)

---

## User Roles

| Role | Capabilities |
|------|-------------|
| Customer | Browse, search, cart, checkout, wishlist, reviews |
| Farmer | List products, manage inventory, view/update orders, sales dashboard |
| Admin | Manage users, farmers, products, orders, categories |
