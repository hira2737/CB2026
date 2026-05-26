const express = require("express");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const DBConnect = require("./config/DBConfig");

const app = express();

const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────
DBConnect();

// ─────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────
// BODY PARSER
// ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

// ─────────────────────────────────────────────
// CORS (FINAL PRODUCTION VERSION)
// ─────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    credentials: true,
  })
);

// ─────────────────────────────────────────────
// RATE LIMITERS
// ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Try again later.",
  },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many booking requests. Slow down.",
  },
});

// Apply limiters
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/bookings/initiate", bookingLimiter);
app.use("/api/bookings/lock", bookingLimiter);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal Server Error",
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});