# CineBook - Production-Ready Movie Ticket Booking Platform

<div align="center">

[![Live Frontend](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-black?style=for-the-badge&logo=vercel)](https://cb-2026-gamma.vercel.app/)
[![Live Backend](https://img.shields.io/badge/Backend-Live%20on%20Render-orange?style=for-the-badge&logo=render)](https://cinebook-backend-s7ry.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-hira2737%2FCB2026-181717?style=for-the-badge&logo=github)](https://github.com/hira2737/CB2026)
[![Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Full-stack cinema booking system with smart seat booking, secure Razorpay payments, admin management, and production deployment on Vercel, Render, and MongoDB Atlas.

[Live Demo](https://cb-2026-gamma.vercel.app/) - [Backend API](https://cinebook-backend-s7ry.onrender.com/) - [Repository](https://github.com/hira2737/CB2026)

</div>

---

## About The Project

**CineBook** is a production-style MERN stack movie ticket booking platform. It allows users to browse movies, choose show preferences, view available shows, select seats, complete payments through Razorpay, and manage booking history.

The backend provides protected authentication, admin workflows, show scheduling, seat locking, payment verification, and booking APIs. The frontend is a responsive React/Vite application deployed on Vercel with React Router SPA refresh support.

---

## Live Deployment

| Service | URL |
| --- | --- |
| Frontend | https://cb-2026-gamma.vercel.app/ |
| Backend API | https://cinebook-backend-s7ry.onrender.com/ |
| Repository | https://github.com/hira2737/CB2026 |

> Render free-tier note: the backend may sleep after inactivity. The first request after a pause can take 30-50 seconds while the service wakes up.

---

## Major Features

### User Features

- Browse current movies in a responsive interface
- Filter movies by category, language, and format
- Select language and format before choosing show slots
- View movie details, cinema grouping, and date-based show slots
- View occupancy-based slot labels such as Available, Filling Fast, Almost Full, Few Seats Left, and Sold Out
- Select seats with smart automatic seat selection
- Live booked-seat refresh during seat selection
- Secure Razorpay checkout flow
- Booking success and failure pages
- User booking history
- Mobile, tablet, and desktop support

### Admin Features

- Admin dashboard overview
- Add, edit, and delete movies
- Cloudinary poster upload support
- Manage categories
- Create cinemas and screens
- Create show timings
- Prevent overlapping shows for the same screen
- Prevent past show creation
- View bookings across users
- Hide expired shows from active show views while preserving booking history

### Security Features

- JWT authentication
- Protected user routes
- Protected admin routes
- Password hashing with bcrypt
- Helmet security middleware
- Express rate limiting
- Production CORS configuration
- Razorpay HMAC-SHA256 signature verification
- MongoDB-backed seat locking to reduce race conditions
- Environment-variable driven deployment configuration

---

## Latest Production Updates

- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB Atlas production database support
- React Router refresh fallback configured for Vercel
- Production API base URL configured through `VITE_API_URL`
- Expired shows hidden from public and admin active show views
- Category-based movie filtering
- Date-based show tabs
- Per-category slot availability tooltip behavior
- Responsive navigation and booking pages

---

## Smart Seat Booking System

CineBook includes a smart seat booking workflow designed to reduce double booking and improve booking clarity.

- Users choose the number of seats before entering the seat map
- The seat map auto-selects available seats to the right from the clicked seat
- Booked seats and temporary locks are refreshed during seat selection
- Seats are locked before payment order creation
- Confirmed bookings permanently reserve seats
- Expired or conflicting locks do not proceed to payment

### Seat Category Pricing

| Category | Rows | Price |
| --- | --- | --- |
| PLATINUM | A-B | INR 360 |
| GOLD | C-F | INR 270 |
| SILVER | G-J | INR 180 |

Each category has independent availability. A show is considered sold out only when all seat categories are fully booked.

---

## Razorpay Integration

CineBook uses Razorpay for secure payment processing.

1. User selects seats
2. Backend locks seats temporarily
3. Backend creates a Razorpay order
4. Frontend opens Razorpay checkout
5. User completes or cancels payment
6. Backend verifies the Razorpay signature
7. Booking is confirmed only after successful verification
8. Failed payments are marked safely without deleting booking history

Test mode credentials can be used in local development through Razorpay test keys.

---

## Deployment Architecture

```text
User Browser
     |
     v
Vercel Frontend (React + Vite)
     |
     v
Render Backend (Node.js + Express)
     |
     v
MongoDB Atlas

Supporting services:
- Razorpay for payments
- Cloudinary for poster storage
- Nodemailer for email notifications
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| API Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Payments | Razorpay |
| Media Storage | Cloudinary |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, CORS |
| Deployment | Vercel, Render |

---

## Project Structure

```bash
CB2026/
|-- backend/
|   |-- config/
|   |-- Controllers/
|   |-- Middlewares/
|   |-- Models/
|   |-- Routes/
|   |-- Services/
|   |-- index.js
|   `-- package.json
|
|-- frontend/
|   |-- src/
|   |   |-- Components/
|   |   |-- Pages/
|   |   |-- config/
|   |   |-- utils/
|   |   `-- App.jsx
|   |-- vercel.json
|   |-- vite.config.js
|   `-- package.json
|
`-- README.md
```

---

## Booking Flow

```text
Browse Movie
     |
Choose Language and Format
     |
Select Date and Show Slot
     |
Choose Seat Count
     |
Select Seats
     |
Lock Seats Temporarily
     |
Create Razorpay Order
     |
Complete Payment
     |
Verify Payment Signature
     |
Confirm Booking
     |
Show Booking Result
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas or local MongoDB
- Razorpay test account
- Cloudinary account

### 1. Clone Repository

```bash
git clone https://github.com/hira2737/CB2026.git
cd CB2026
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_NAME=CineBook
MAIL_FROM_ADDRESS=noreply@cinebook.com
ADMIN_EMAIL=admin@cinebook.com
```

Run backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Run frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## Environment Variables

### Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Allowed frontend origin |
| `BACKEND_URL` | Backend public URL |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password or app password |
| `MAIL_FROM_NAME` | Sender display name |
| `MAIL_FROM_ADDRESS` | Sender email address |
| `ADMIN_EMAIL` | Admin notification email |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL without `/api` |

Production frontend value:

```env
VITE_API_URL=https://cinebook-backend-s7ry.onrender.com
```

The Axios client appends `/api` internally.

---

## Deployment Guide

### Backend on Render

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Required production environment values:

```env
PORT=8080
MONGODB_URI=your_production_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://cb-2026-gamma.vercel.app
BACKEND_URL=https://cinebook-backend-s7ry.onrender.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend on Vercel

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Required production environment value:

```env
VITE_API_URL=https://cinebook-backend-s7ry.onrender.com
```

The frontend includes `frontend/vercel.json` with an SPA rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents Vercel 404 errors when users refresh routes such as `/login`, `/admin`, `/movie/:id`, and booking pages.

---

## Production Deployment Notes

- Do not include `/api` in `VITE_API_URL`; the frontend Axios instance adds it.
- Keep `FRONTEND_URL` on Render aligned with the deployed Vercel domain.
- Keep Razorpay secrets only in backend environment variables.
- Keep Cloudinary credentials only in backend environment variables.
- Vercel must use the `frontend` directory as the project root.
- Render must use the `backend` directory as the service root.
- The Render free tier can sleep after inactivity, so the first API call may be slower.

---

## What I Learned

- Building a full MERN application with separate frontend and backend deployments
- Managing production environment variables safely
- Handling React Router SPA refresh behavior on Vercel
- Designing protected user and admin workflows
- Implementing secure Razorpay payment verification
- Reducing seat booking race conditions with backend seat locks
- Connecting MongoDB Atlas to a production Express API
- Managing media uploads through Cloudinary
- Debugging real deployment issues such as CORS, API URLs, and route rewrites

---

## Author

**Hira**

- GitHub: https://github.com/hira2737
- Repository: https://github.com/hira2737/CB2026

---

## Support

If this project is useful:

- Star the repository
- Fork it for learning or extension
- Open an issue for bugs or suggestions
- Share it with other developers

---

<div align="center">

Built with the MERN stack for a production-style movie booking experience.

</div>
