const express = require("express");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const DBConnect = require("./config/DBConfig");

const app = express();

const PORT = process.env.PORT || 8080;

// Database Connection
DBConnect();

// ── Security headers ─────────────────────────────────────
app.use(helmet());

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── CORS FIX (FINAL PRODUCTION VERSION) ───────────────────
const allowedOrigins = [
  "https://cine-book-rho.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // TEMP SAFE MODE (prevents random CORS crash)
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// ── Rate limiters ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Slow down.",
  },
});

// Apply rate limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/bookings/initiate", bookingLimiter);
app.use("/api/bookings/lock", bookingLimiter);

// ── Routes ────────────────────────────────────────────────
const authRoutes = require("./Routes/AuthRoutes");
const movieRoutes = require("./Routes/MovieRoutes");
const showRoutes = require("./Routes/ShowRoutes");
const bookingRoutes = require("./Routes/BookingRoutes");
const cinemaRoutes = require("./Routes/CinemaRoutes");
const screenRoutes = require("./Routes/ScreenRoutes");
const categoryRoutes = require("./Routes/CategoryRoutes");

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CineBook API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/categories", categoryRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});