# 🎬 CineBook — Online Movie Ticket Booking System

<div align="center">

[![Live Frontend](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-black?style=for-the-badge&logo=vercel)](https://cine-book-rho.vercel.app/)
[![Live Backend](https://img.shields.io/badge/Backend-Live%20on%20Render-orange?style=for-the-badge&logo=render)](https://cinebook-1-3jg1.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-hira2737%2FCineBook-181717?style=for-the-badge&logo=github)](https://github.com/hira2737/CineBook)
[![Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A production-grade cinema ticket booking platform — browse movies, select seats in real-time, and pay securely via Razorpay.**

[🌐 Live Demo](https://cine-book-rho.vercel.app/) · [⚙️ API](https://cinebook-1-3jg1.onrender.com/) · [📂 Repository](https://github.com/hira2737/CineBook)

</div>

---

## 📌 About

**CineBook** is a full-stack movie ticket booking web application built with the **MERN stack**. It supports real-time concurrent seat locking, secure Razorpay payment with HMAC-SHA256 signature verification, Cloudinary image hosting, JWT authentication with role-based access, and a full admin dashboard — all deployed on Vercel + Render + MongoDB Atlas.

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend (Vercel) | https://cine-book-rho.vercel.app/ |
| ⚙️ Backend API (Render) | https://cinebook-1-3jg1.onrender.com/ |

> **Note:** The backend is on Render's free tier. The first request after inactivity may take ~30 seconds to wake up.

---

## ✨ Features

### 👤 User
- Browse movies with genre, language, and format filters
- View movie details, trailers, and show timings grouped by cinema
- Real-time seat selection with live seat-lock refresh (concurrent-safe)
- Secure payment via **Razorpay** with server-side signature verification
- Downloadable PDF ticket after booking
- View full booking history

### 🛠 Admin
- Add, edit, and delete movies (with Cloudinary poster upload)
- Manage cinemas, screens, and show schedules
- Show overlap validation — prevents double-booking a screen
- Manage movie categories
- View all bookings across all users

### 🔐 Security
- JWT authentication with role-based access control (user / admin)
- Razorpay HMAC-SHA256 payment signature verification
- Helmet security headers
- Rate limiting on auth and booking endpoints
- Atomic seat locking (race-condition safe via MongoDB `findOneAndUpdate` + unique index)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Axios, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Payments | Razorpay (INR, test + live mode) |
| Storage | Cloudinary (movie posters) |
| Email | Nodemailer (booking confirmations) |
| Security | Helmet, express-rate-limit |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## 🏗 Project Structure

```
CineBook/
├── backend/
│   ├── config/
│   │   ├── CloudinaryConfig.js     # Multer + Cloudinary storage
│   │   ├── DBConfig.js             # MongoDB Atlas connection
│   │   └── RazorpayConfig.js       # Razorpay instance
│   ├── Controllers/
│   │   ├── BookingController.js    # Order creation, payment verification
│   │   ├── MovieController.js      # Movie CRUD
│   │   ├── ShowController.js       # Show scheduling + overlap check
│   │   ├── SeatLockController.js   # Atomic seat locking (race-safe)
│   │   ├── CinemaController.js     # Cinema CRUD + cascade delete
│   │   ├── ScreenController.js     # Screen management
│   │   ├── CategoryController.js   # Category CRUD
│   │   └── UserController.js       # Auth (register, login, profile)
│   ├── Middlewares/
│   │   └── AuthMiddleware.js       # JWT verify + admin role guard
│   ├── Models/                     # Mongoose schemas
│   │   ├── Booking.js
│   │   ├── Movie.js
│   │   ├── Show.js
│   │   ├── Screen.js
│   │   ├── Cinema.js
│   │   ├── SeatLock.js             # TTL-indexed for auto-expiry
│   │   ├── Category.js
│   │   └── User.js
│   ├── Routes/                     # Express routers
│   ├── Services/
│   │   └── EmailService.js         # Booking confirmation emails
│   ├── index.js                    # App entry — CORS, Helmet, rate limiter
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── Components/             # Navbar, MovieCard, HeroCarousel, etc.
    │   ├── Pages/
    │   │   ├── Public/             # Home, MovieDetails, SeatSelection, Booking
    │   │   ├── Admin/              # Full admin dashboard
    │   │   └── User/               # User booking history
    │   ├── config/
    │   │   └── api.js              # Axios instance with auth interceptor
    │   └── utils/
    │       └── movieFormatters.js  # Shared formatting helpers
    ├── vite.config.js
    └── package.json
```

---

## 🔄 Booking Flow

```
Select Seats
     │
     ▼
Lock Seats (5-min TTL, atomic)
     │
     ▼
Create Razorpay Order  ──► Backend saves pending Booking
     │
     ▼
Razorpay Checkout Modal (frontend)
     │
     ▼
User Pays
     │
     ▼
Verify HMAC-SHA256 Signature  ──► Confirm Booking in DB
     │
     ▼
Release Seat Lock + Send Email
     │
     ▼
PDF Ticket Download
```

---

## 🛠 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Razorpay account (test keys)
- Cloudinary account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/hira2737/CineBook.git
cd CineBook
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8080

MONGODB_URI=mongodb://127.0.0.1:27017/cinebook_db

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_hex_secret

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_FROM_NAME=CineBook
MAIL_FROM_ADDRESS=noreply@cinebook.com
ADMIN_EMAIL=admin@cinebook.com
```

```bash
npm run dev       # Start backend on :8080
npm run seed      # (Optional) seed sample data
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

```bash
npm run dev       # Start frontend on :5173
```

Open `http://localhost:5173`

---

## 🔧 Environment Variables Reference

### Backend
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 8080) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (min 64 chars) |
| `FRONTEND_URL` | Allowed CORS origin (comma-separated for multiple) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `MAIL_USERNAME` | Gmail address for sending emails |
| `MAIL_PASSWORD` | Gmail App Password (not your login password) |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 🚀 Deployment

### Backend → Render
1. Connect GitHub repo → New Web Service
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node index.js`
5. Add all environment variables from the table above
6. Set `FRONTEND_URL` to your Vercel URL

### Frontend → Vercel
1. Connect GitHub repo → New Project
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Add `VITE_API_URL=https://your-backend.onrender.com/api`

### Database → MongoDB Atlas
1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → create user with password
3. Network Access → allow `0.0.0.0/0`
4. Copy the connection string into `MONGODB_URI`

---

## 💳 Payment Integration (Razorpay)

This project uses **Razorpay(Test Mode)** for secure payment processing during movie ticket booking.

---

### 🔐 Payment Flow

1. User selects seats → seats are temporarily locked (TTL-based)
2. Booking is created with **PENDING** status
3. Razorpay order is generated from backend
4. User completes payment via Razorpay checkout
5. Backend verifies payment using **HMAC-SHA256 signature verification**
6. On success:
   - Booking is marked as **CONFIRMED**
   - Seats are permanently reserved
7. On failure/cancel:
   - Booking is marked as **FAILED**
   - Seat locks are automatically released

---

## 🏦 Supported Payment Methods

Razorpay checkout supports multiple methods depending on configuration:

- 🏛️ Net Banking
- 📱 UPI Payments

---

## 🧪 Test Credentials (Razorpay Test Mode)

### 📱 UPI
- Success: `success@razorpay`
- Failure: `failure@razorpay`

---

## 📚 What I Learned

- Building a production MERN stack application end-to-end
- JWT authentication and role-based access control
- Preventing race conditions with MongoDB atomic operations (`findOneAndUpdate` + unique indexes)
- Secure payment integration with HMAC-SHA256 signature verification
- Cloud storage (Cloudinary) and CDN-hosted assets
- CORS configuration for cross-origin deployments
- Production deployment on Vercel + Render + MongoDB Atlas

---

## 👨‍💻 Author

**Hira** · [@hira2737](https://github.com/hira2737)

---

## ⭐ Support

If you found this project useful:

- ⭐ **Star** the repository
- 🍴 **Fork** it for your own learning
- 🐛 Open an **issue** if you find a bug

---

<div align="center">
Built with ❤️ using the MERN Stack
</div>
