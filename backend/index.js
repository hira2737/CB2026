const express = require("express");
require("dotenv").config();

const reviewRoutes = require("./Routes/ReviewRoutes");
const notificationRoutes = require("./Routes/NotificationRoutes");
const resaleRoutes = require("./Routes/ResaleRoutes");
const groupRoutes = require("./Routes/GroupRoutes");

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const DBConnect = require("./config/DBConfig");

const app = express();

const PORT = process.env.PORT || 8080;

// ── Database ─────────────────────────────
DBConnect();

// ── Security ─────────────────────────────
app.use(helmet());

// ── Body Parser ──────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── CORS (PRODUCTION SAFE) ───────────────

const allowedOrigins = [
  "https://cb-2026-gamma.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        !origin // fallback safety
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// ── Rate Limiting ────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many booking requests. Slow down.",
  },
});

// Apply limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/bookings/initiate", bookingLimiter);
app.use("/api/bookings/lock", bookingLimiter);

// ── Routes ───────────────────────────────
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
    message: "CineBook API is running 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resale", resaleRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/groups", groupRoutes);
// ── 404 Handler ──────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Error Handler ────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
