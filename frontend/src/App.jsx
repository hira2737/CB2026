import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./Pages/Public/Home";
import MovieDetails from "./Pages/Public/MovieDetails";
import Login from "./Pages/Public/Login";
import Register from "./Pages/Public/Register";
import SeatSelection from "./Pages/Public/SeatSelection";
import BookingSuccess from "./Pages/Public/BookingSuccess";
import BookingFailed from "./Pages/Public/BookingFailed";
import Dashboard from "./Pages/User/Dashboard";
import AdminDashboard from "./Pages/Admin/Dashboard";

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/book/:showId"
          element={
            <ProtectedRoute>
              <SeatSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/success"
          element={
            <ProtectedRoute>
              <BookingSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/failed"
          element={
            <ProtectedRoute>
              <BookingFailed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
