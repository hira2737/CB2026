import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../../config/api";
import Navbar from "../../Components/Navbar";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  MapPin,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import ResaleSummaryCard from "../../Components/ResaleSummaryCard";
import ResaleInfoCard from "../../Components/ResaleInfoCard";

  const getBookingCategory = (booking) => {
    const category = booking.show?.movie?.category;
    return typeof category === "object" ? category?.name : category;
  };

  const getStatusBadge = (bookingStatus) => {
    const statusConfig = {
      confirmed: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-500",
        label: "Confirmed",
      },
      resale_listed: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-500",
        label: "Listed for Resale",
      },
      resale_sold: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-500",
        label: "Resale Sold",
      },
      transferred_out: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-500",
        label: "Transferred Out",
      },
      transferred_in: {
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        text: "text-cyan-500",
        label: "Transferred In",
      },
      cancelled: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-500",
        label: "Cancelled",
      },
    };

    const config = statusConfig[bookingStatus] || statusConfig.confirmed;

    return (
      <span
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${config.bg} ${config.border} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [resaleListings, setResaleListings] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
  });
  const [error, setError] = useState("");
  const [showResaleModal, setShowResaleModal] = useState(false);
  const [resaleBookingId, setResaleBookingId] = useState(null);
  const [selectedResaleSeats, setSelectedResaleSeats] = useState([]);
  const [resaleProcessing, setResaleProcessing] = useState(false);

  const activeResaleSeats = resaleListings
    .filter(
      (listing) =>
        listing.status === "active" &&
        String(listing.bookingId?._id || listing.bookingId) === String(resaleBookingId)
    )
    .flatMap((listing) => listing.seats || []);

  const getResaleSeatPrice = (seat) => {
    const row = String(seat || "")[0]?.toUpperCase();
    if (["A", "B"].includes(row)) return 235;
    if (["C", "D", "E", "F"].includes(row)) return 175;
    if (["G", "H", "I", "J"].includes(row)) return 115;
    return 0;
  };

  const resalePreviewTotal = selectedResaleSeats.reduce(
    (sum, seat) => sum + getResaleSeatPrice(seat),
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, resaleRes] = await Promise.all([
          API.get("/bookings/history"),
          API.get("/resale/mine"),
        ]);

        // Filter bookings to last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const filteredBookings = (bookingsRes.data || []).filter(
          (booking) => new Date(booking.createdAt) >= thirtyDaysAgo
        );

        setBookings(filteredBookings);
        setResaleListings(resaleRes.data?.listings || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load booking history");
      }
    };
    fetchData();
  }, []);
  const handleListForResale = (bookingId, bookingSeats) => {
    setResaleBookingId(bookingId);
    setSelectedResaleSeats([]);
    setShowResaleModal(true);
  };

  const toggleResaleSeat = (seat) => {
    setSelectedResaleSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const submitResaleList = async () => {
    if (selectedResaleSeats.length === 0) {
      toast.error("Select at least one seat to list for resale");
      return;
    }

    setResaleProcessing(true);
    const toastId = toast.loading("Listing for resale...");

    try {
      await API.post("/resale/list", {
        bookingId: resaleBookingId,
        selectedSeats: selectedResaleSeats,
      });

      toast.success("Ticket listed for resale!", { id: toastId });
      setShowResaleModal(false);
      setSelectedResaleSeats([]);

      // Refresh data
      const [bookingsRes, resaleRes] = await Promise.all([
        API.get("/bookings/history"),
        API.get("/resale/mine"),
      ]);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const filteredBookings = (bookingsRes.data || []).filter(
        (booking) => new Date(booking.createdAt) >= thirtyDaysAgo
      );

      setBookings(filteredBookings);
      setResaleListings(resaleRes.data?.listings || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to list ticket for resale",
        { id: toastId }
      );
    } finally {
      setResaleProcessing(false);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading("Updating profile...");
    try {
      const { data } = await API.put("/auth/profile", editData);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsEditing(false);
      setError("");
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 pt-36 md:pt-32 pb-24 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Sidebar - Profile */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="bg-[#1a1a1a] rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/10 lg:sticky lg:top-32 relative overflow-hidden">
            {!isEditing ? (
              <>
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f5c518] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#f5c518]/20">
                    <User size={56} className="text-black" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2 break-words">
                    {user.name}
                  </h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Member since{" "}
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )}
                  </p>
                </div>

                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 shrink-0 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-[#f5c518] transition-colors">
                      <Mail size={18} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline-gold w-full mt-12 py-4 uppercase tracking-[0.2em] text-[10px] font-black"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form
                onSubmit={handleUpdateProfile}
                className="animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[#f5c518] mb-2">
                    Edit Profile
                  </h3>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    Update your identity
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <button
                    type="submit"
                    className="btn-fill-gold w-full py-4 uppercase tracking-[0.2em] text-[10px] font-black"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full py-4 text-gray-500 hover:text-white uppercase tracking-[0.2em] text-[10px] font-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>

        {/* Right Content - My Bookings */}
        <main className="flex-1">
          {/* Resale Summary Card */}
          <div className="mb-12">
            <ResaleSummaryCard listings={resaleListings} />
          </div>

          {/* Resale Info Card */}
          <div className="mb-12">
            <ResaleInfoCard compact={true} />
          </div>

          {resaleListings.some((listing) => listing.status === "active") && (
            <div className="mb-12 bg-[#1a1a1a] rounded-[24px] p-5 sm:p-6 border border-white/10">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-lg font-black uppercase tracking-tighter">
                  Active <span className="text-[#f5c518]">Resale Listings</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {resaleListings.filter((listing) => listing.status === "active").length} active
                </span>
              </div>

              <div className="space-y-3">
                {resaleListings
                  .filter((listing) => listing.status === "active")
                  .map((listing) => (
                    <div
                      key={listing._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/5 border border-white/5 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-white truncate">
                          {listing.movieTitle}
                        </p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          Seats {listing.seats?.join(", ")} · ₹{listing.resalePrice}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                My <span className="text-[#f5c518]">Bookings</span>
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">
                Last 30 days
              </p>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              {bookings.length} bookings
            </p>
          </div>

          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="group bg-[#1a1a1a] rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-white/10 hover:border-[#f5c518]/30 transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden active:scale-[0.99]"
              >
                {/* Poster on Card */}
                <div className="w-full md:w-32 h-44 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={
                      booking.show?.movie?.posterUrl ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white group-hover:text-[#f5c518] transition-colors mb-1 break-words sm:truncate sm:max-w-sm">
                          {booking.show?.movie?.title}
                        </h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                          {getBookingCategory(booking) || "Uncategorized"}
                        </p>
                      </div>
                      {getStatusBadge(booking.bookingStatus)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <Calendar size={16} className="shrink-0 text-[#f5c518]" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Date & Time
                          </p>
                          <p className="text-sm font-black text-gray-200 break-words">
                            {new Date(
                              booking.show?.startTime
                            ).toLocaleDateString()}{" "}
                            <span className="text-[#f5c518]">
                              {new Date(
                                booking.show?.startTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <MapPin size={16} className="shrink-0 text-[#f5c518]" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Cinema
                          </p>
                          <p className="text-sm font-black text-gray-200 break-words">
                            {booking.show?.screen?.cinema?.name ||
                              "CinePlex Grand"}
                          </p>
                        </div>
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <Ticket size={16} className="shrink-0 text-[#f5c518]" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Seats
                          </p>
                          <p className="text-sm font-black text-gray-200 break-words">
                            {booking.seats?.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                  <p className="text-2xl font-black text-[#f5c518]">
                    ₹ {booking.totalPrice?.toFixed(0)}
                  </p>

                    {booking.bookingStatus === "confirmed" && (
                      <button
                        onClick={() =>
                          handleListForResale(booking._id, booking.seats)
                        }
                        className="px-4 py-2 bg-[#f5c518] text-black rounded-xl font-bold text-sm hover:bg-[#ffe066] hover:shadow-[0_0_18px_rgba(245,197,24,0.3)] transition-all active:scale-95 cursor-pointer"
                      >
                        List For Resale
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}

{bookings.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-[32px] sm:rounded-[40px] p-8 sm:p-20 text-center border border-white/10 border-dashed">
                <Ticket size={64} className="text-gray-800 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-600 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-700 font-bold uppercase tracking-widest text-[10px]">
                  Time to start your cinematic journey!
                </p>
                <Link
                  to="/"
                  className="btn-fill-gold inline-block mt-10 !px-12 text-sm"
                >
                  Discover Movies
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Resale Seat Selection Modal */}
        {showResaleModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Select Seats to Resale
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Choose which seats you want to list
                  </p>
                </div>
                <button
                  onClick={() => setShowResaleModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-[#f5c518]/5 border border-[#f5c518]/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-300 font-bold">
                  <AlertCircle className="inline mr-2" size={14} />
                  You can list partial seats. Pricing is calculated per selected seat.
                </p>
              </div>

              {/* Seat Selection */}
              <div className="mb-8">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Your Seats
                </p>
                <div className="flex flex-wrap gap-3">
                  {resaleBookingId &&
                    bookings
                      .find((b) => b._id === resaleBookingId)
                      ?.seats?.map((seat) => {
                        const alreadyListed = activeResaleSeats.includes(seat);

                        return (
                          <button
                            key={seat}
                            type="button"
                            disabled={alreadyListed}
                            onClick={() => toggleResaleSeat(seat)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer disabled:cursor-not-allowed ${
                              alreadyListed
                                ? "bg-gray-700/40 text-gray-500 border border-gray-700/50"
                                : selectedResaleSeats.includes(seat)
                                ? "bg-[#f5c518] text-black border border-[#f5c518] shadow-[0_0_18px_rgba(245,197,24,0.3)]"
                                : "bg-white/5 text-white border border-white/10 hover:border-[#f5c518] hover:text-[#f5c518] hover:bg-[#f5c518]/10"
                            }`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                </div>
                {selectedResaleSeats.length > 0 && (
                  <p className="text-xs text-[#f5c518] font-bold mt-3 break-words">
                    Selected: {selectedResaleSeats.join(", ")} · Resale total ₹{resalePreviewTotal}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResaleModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResaleList}
                  disabled={selectedResaleSeats.length === 0 || resaleProcessing}
                  className="flex-1 px-4 py-3 bg-[#f5c518] text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#f5c518]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {resaleProcessing ? "Listing..." : "List for Resale"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
