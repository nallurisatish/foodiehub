# 🍔 FoodieHub — Complete Full-Stack Food Ordering & Delivery Platform

> *"Your Cravings, Delivered Fresh."*

FoodieHub is a modern, responsive, and functional full-stack food ordering and delivery web application inspired by platforms such as Swiggy and Zomato. Engineered using the **MERN** stack (MongoDB, Express.js, React.js with Vite, Node.js), this project demonstrates intermediate-to-advanced B.Tech Computer Science and Engineering competencies including frontend component architecture, RESTful API engineering, MongoDB schema modeling, secure authentication, role-based access control, Google Sign-In, shopping cart state management, Razorpay payment gateway integration, live order tracking, and an administrative dashboard.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Interactive Landing & Discovery**:
  - Hero banner with quick food search and cuisine recommendations.
  - Category selector for Biryani, Pizza, Indian Meals, Burgers, Chinese, Starters, Desserts, and Beverages.
  - Handpicked partner restaurants with ratings, estimated delivery times, and price for two.
  - Pure vegetarian filter toggle and bestselling dish badges.
- **Restaurant & Menu Exploration**:
  - Dedicated restaurant pages with cover imagery, hygiene assurances, and category tabs.
  - In-restaurant dish search and instant dish preview modal.
- **Cart & Server-Side Price Engine**:
  - Single-restaurant cart protection with automated modal prompt if adding from another restaurant.
  - Quantity stepper (+ / -), persistent local state across refreshes and logins.
  - Real-time coupon validator with percentage and flat discounts (e.g., `FOODIE50`, `WELCOME20`, `FREEDEL`).
  - Transparent itemized bill calculation: Subtotal, Delivery Fee (Free on orders ₹500+ or via coupon), and 5% GST tax.
- **Seamless Checkout**:
  - 2-Column responsive layout.
  - Saved delivery address selector and inline "+ Add Address" form.
  - Delivery instructions for rider (e.g. "Leave at door").
  - Payment method selector: **Razorpay Online Payments** (UPI, Credit/Debit Cards, NetBanking) and **Cash on Delivery (COD)**.
- **Payment Verification & Confirmation**:
  - Official Razorpay SDK integration with HMAC-SHA256 cryptographic signature verification.
  - Interactive test simulation fallback for zero-friction local development without live merchant accounts.
  - Confetti celebration animation upon order confirmation.
  - Official printable/downloadable tax invoice receipt (`ReceiptModal`).
- **Live Location & Restaurant Discovery**:
  - Device GPS satellite auto-detection with fallback to OpenStreetMap Nominatim reverse geocoding.
  - Interactive location modal with pin preview, door/landmark inputs, and one-click food hubs (Benz Circle, Jubilee Hills, Koramangala, Bandra West).
  - Dynamic restaurant localization: calculates proximity distances, estimated delivery times, and free delivery thresholds relative to user's live position.
- **Interactive Live Map & Real-Time Rider Tracking ("Where He Has Arrived")**:
  - Interactive OpenStreetMap route map (`LiveDeliveryMap.jsx`) with custom markers for kitchen outlet, customer delivery pin, and rider scooter with radar pulse.
  - Real-time animated delivery route polyline and live rider position advancing toward destination.
  - Live distance remaining countdown (meters/km) and dynamic ETA calculator.
  - **Rider Arrival Engine**: Celebratory arrival banner, synthesized Web Audio chime, and confetti celebration when rider reaches customer doorstep.
  - Rider profile card with name, vehicle number, phone call action, and 4-digit Delivery PIN security verification.
  - "⚡ Simulate Rider Arrival" and "Replay Delivery Run" controls for instant interactive testing.
- **Visual 5-Stage Stepper & Lifecycle**:
  - Stepper stages: `Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`.
  - Self-service order cancellation for eligible orders in `Pending` or `Confirmed` status.
- **User Profile & Address Management**:
  - Profile update for name and phone.
  - Multiple saved addresses (Home, Work, Other) with instant deletion and default tagging.

### 🛡️ Administrator Operations
- **Dedicated Admin Portal** (`/admin/login` & `/admin/dashboard`):
  - Protected by backend role-based access control middleware (`role: 'admin'`).
  - Secure seed initialization script to create the initial admin account (`admin@foodiehub.com` / `Admin@123456`).
- **Real-Time Analytics & Financial Metrics**:
  - Overview metrics: Total Revenue (₹), Total Orders, In-Progress Orders, and Registered Customers.
  - Weekly sales bar chart visualization.
  - Top-selling dishes table and recent orders feed.
- **Restaurant Management** (`/admin/restaurants`):
  - Add new restaurant partners with images, cuisines, delivery fee, and time estimates.
  - Edit restaurant details and toggle real-time kitchen open/closed status.
- **Food Catalog Management** (`/admin/food`):
  - Add new dishes, set prices in INR, category, image URL, and veg/non-veg indicator.
  - Toggle stock availability (`In Stock` / `Out of Stock`) and bestselling tags.
- **Order Lifecycle Management** (`/admin/orders`):
  - Filter orders by status or search by order number / customer.
  - Live order status transition dropdown (`Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
  - Terminal status protection (cannot reverse delivered or cancelled orders).
- **Voucher & Coupon Management** (`/admin/coupons`):
  - Create promotional codes (percentage or flat discount, minimum order value, maximum discount cap, expiry date).
  - Enable, disable, or delete active coupons.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide React, Canvas-Confetti |
| **Styling** | Vanilla CSS3 (Custom Design System, Poppins / Plus Jakarta Sans fonts, Glassmorphism, Responsive Grid) |
| **State Management** | React Context API (`AuthContext`, `CartContext`) with localStorage synchronization |
| **Backend** | Node.js (v18+ or v24+), Express.js, RESTful Architecture |
| **Database** | MongoDB with Mongoose ODM (Atlas Cloud or Local MongoDB with resilient in-memory fallback) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs, Google Auth Library (`OAuth2Client`) |
| **Payments** | Official Razorpay Node.js SDK, HMAC-SHA256 signature verification, Webhook handler |
| **Security** | Helmet, CORS allowlisting, Express Rate Limit, Cookie-Parser, Input validation |

---

## 📁 Project Structure

```
weather/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── config/
│       │   ├── db.js             # Mongoose connection with resilient fallback
│       │   ├── google.js         # Google Identity token verification
│       │   └── razorpay.js       # Razorpay SDK initialization & HMAC helpers
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── cartController.js
│       │   ├── couponController.js
│       │   ├── foodController.js
│       │   ├── orderController.js
│       │   ├── paymentController.js
│       │   └── restaurantController.js
│       ├── middleware/
│       │   ├── authenticate.js   # JWT validation
│       │   ├── authorize.js      # Role check (admin vs customer)
│       │   ├── errorHandler.js   # Centralized error handler
│       │   └── rateLimiter.js    # Rate limiting for auth & API
│       ├── models/
│       │   ├── Cart.js
│       │   ├── Coupon.js
│       │   ├── Food.js
│       │   ├── Order.js
│       │   ├── PaymentEvent.js
│       │   ├── Restaurant.js
│       │   └── User.js
│       ├── routes/               # API route definitions under /api/v1
│       ├── scripts/
│       │   ├── seedAdmin.js      # Initial administrator setup script
│       │   ├── seedDemoData.js   # 6 restaurants, 20+ dishes, and coupons
│       │   └── test_flow.js      # Automated 11-step E2E verification test
│       ├── app.js
│       └── server.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── components/           # Header, Footer, FoodCard, OrderTracker, etc.
│       ├── context/              # AuthContext, CartContext
│       ├── layouts/              # CustomerLayout, AdminLayout
│       ├── pages/                # Home, Menu, Cart, Checkout, Tracking, Admin...
│       ├── services/             # Axios API service adapters
│       ├── App.jsx
│       ├── index.css             # FoodieHub Master Design System
│       └── main.jsx
├── FOODIEHUB_README.md           # This comprehensive guide
└── package.json                  # Root orchestrator scripts
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9+
- **MongoDB**: MongoDB Atlas connection string OR local MongoDB (port 27017)

### 1. Install Dependencies
In the workspace root directory:
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Configure Environment Variables
Copy the example environment files:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Review `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/foodiehub
JWT_SECRET=foodiehub_super_secret_jwt_key_2026_secure_random_string_987654321
CLIENT_URL=http://localhost:5173

# Admin Credentials
ADMIN_EMAIL=admin@foodiehub.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Seed Database
The backend server automatically seeds demo data on its first launch, or you can run the scripts manually:
```bash
# Seed initial administrator
node backend/src/scripts/seedAdmin.js

# Seed demo restaurants, food dishes, and active coupons
node backend/src/scripts/seedDemoData.js
```

### 4. Start the Application
Run both backend and frontend servers:

```bash
# Terminal 1 - Backend API (runs on http://localhost:5000)
npm run foodie:backend

# Terminal 2 - Frontend UI (runs on http://localhost:5173)
npm run foodie:frontend
```

Now open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🔑 Default Credentials

### Administrator Account
- **Portal URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email**: `admin@foodiehub.com`
- **Password**: `Admin@123456`
- *(Tip: Click the "Autofill" button on the Admin Login page for 1-click login!)*

### Demo Customer Account
- **Login URL**: [http://localhost:5173/login](http://localhost:5173/login)
- **Email**: `customer.demo@foodiehub.com`
- **Password**: `Customer@123`
- *(Or click "Continue with Google" for instant OAuth authentication!)*

---

## 💳 Razorpay Payment Gateway Integration

FoodieHub implements the official Razorpay Node.js SDK and Checkout workflow:

1. **Order Creation**:
   - Customer proceeds to checkout.
   - The backend validates item availability and recalculates prices from the database.
   - The backend creates an internal order and calls Razorpay API: `razorpay.orders.create({ amount: totalAmount * 100, currency: 'INR' })`.
2. **Client Checkout**:
   - The frontend opens Razorpay Checkout modal via `https://checkout.razorpay.com/v1/checkout.js`.
3. **Cryptographic Verification**:
   - Upon completion, the frontend transmits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/v1/payments/razorpay/verify`.
   - The backend calculates the expected signature:
     ```javascript
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(`${orderId}|${paymentId}`)
       .digest('hex');
     ```
   - If signatures match, `paymentStatus` is updated to `'Paid'` and `orderStatus` to `'Confirmed'`.
4. **Webhook Reconciliation**:
   - Webhook events (`payment.captured`, `order.paid`) are processed idempotently at `/api/v1/payments/razorpay/webhook`.

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication (`/auth`)
- `POST /auth/register` — Register new customer account
- `POST /auth/login` — Login with email and password
- `POST /auth/google` — Authenticate using Google ID credential token
- `GET /auth/me` — Retrieve current authenticated session
- `PUT /auth/profile` — Update customer name or phone
- `POST /auth/addresses` — Add saved delivery address
- `DELETE /auth/addresses/:addressId` — Delete delivery address

### Restaurants (`/restaurants`)
- `GET /restaurants` — Search, filter by cuisine, sort by rating/cost
- `GET /restaurants/:id` — Get restaurant profile and categorized menu
- `POST /restaurants` — Admin: Create restaurant partner
- `PUT /restaurants/:id` — Admin: Update restaurant or toggle open/closed
- `DELETE /restaurants/:id` — Admin: Delete restaurant

### Food Catalog (`/food`)
- `GET /food` — Filter by category, search by name, pure veg toggle
- `GET /food/:id` — Get single dish details
- `POST /food` — Admin: Create new food item
- `PUT /food/:id` — Admin: Update dish, price, or stock availability
- `DELETE /food/:id` — Admin: Delete food item

### Orders & Tracking (`/orders`)
- `POST /orders` — Create and calculate order totals on the server
- `GET /orders/my-orders` — Customer: List historical orders
- `GET /orders/:id` — View live tracking stepper and receipt details
- `PATCH /orders/:id/cancel` — Customer: Cancel order with reason (if in Pending/Confirmed)

### Payments (`/payments`)
- `POST /payments/razorpay/verify` — Verify cryptographic HMAC payment signature
- `POST /payments/razorpay/webhook` — Webhook event receiver and reconciler
- `GET /payments/:orderId/status` — Get payment transaction status

### Administrator (`/admin`)
- `GET /admin/dashboard` — Live revenue, order counts, and weekly sales data
- `GET /admin/orders` — List and filter all platform orders
- `PATCH /admin/orders/:id/status` — Advance order status (`Preparing`, `Out for Delivery`, `Delivered`)
- `GET /admin/customers` — List registered customers
- `GET /admin/reports` — Detailed financial and volume reports

---

## 🧪 Automated Testing

FoodieHub includes an end-to-end verification test suite covering 11 critical operational phases. To run the automated tests:

```bash
node backend/src/scripts/test_flow.js
```

Test phases executed:
1. API Health Check
2. Restaurant & Food catalog querying
3. Customer Registration with hashed password
4. Customer Login & JWT issuance
5. Coupon code validation (`FOODIE50`)
6. Server-side Order Creation with delivery fee and 5% GST tax calculation
7. Razorpay HMAC signature verification
8. Order status tracking retrieval
9. Administrator login & role authorization
10. Dashboard analytics & revenue calculation
11. Admin order status lifecycle update (`Preparing` ➔ `Out for Delivery`)

---

## 🚀 Production Deployment Guide

### Frontend (e.g. Vercel)
1. Set root directory to `frontend/`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Environment variables:
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`
   - `VITE_RAZORPAY_KEY_ID=your_razorpay_key_id`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

### Backend (e.g. Render / Railway)
1. Set root directory to `backend/`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_long_random_production_secret`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`

---

## 📜 License & Academic Integrity

Developed for B.Tech Computer Science and Engineering coursework and portfolio demonstrations. All food imagery provided via Unsplash royalty-free photography licenses.

Designed with ❤️ for Foodies everywhere!
