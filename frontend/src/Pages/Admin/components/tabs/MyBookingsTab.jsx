import React, { useEffect, useState } from "react";
import API from "../../../../config/api";
import toast from "react-hot-toast";
import { Calendar, MapPin, Ticket } from "lucide-react";

const MyBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminBookings();
  }, []);

  const fetchAdminBookings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/bookings/history");
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch admin bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatusBadge = (status) => {
    const statusStyles = {
      confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
      resale_listed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      resale_sold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    const statusLabels = {
      confirmed: "Confirmed",
      resale_listed: "Listed for Resale",
      resale_sold: "Resale Sold",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
          statusStyles[status] || statusStyles.confirmed
        }`}
      >
        {statusLabels[status] || "Unknown"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#f5c518] animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm font-bold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">
          My <span className="text-[#f5c518]">Bookings</span>
        </h3>
        <p className="text-sm text-gray-400">View and manage your personal bookings</p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-xl p-12 border border-white/10 text-center">
          <Ticket size={40} className="text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-bold">No bookings yet</p>
          <p className="text-gray-600 text-sm mt-1">You haven't made any bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 hover:border-[#f5c518]/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                {/* Left: Movie Title & Seats */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white mb-2 truncate">
                    {booking.show?.movie?.title || "Movie"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Ticket size={14} className="text-[#f5c518]" />
                      <span>Seats: {(booking.seats || []).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} className="text-[#f5c518]" />
                      <span>{new Date(booking.show?.startTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Price */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                      Total Price
                    </p>
                    <p className="text-xl font-black text-[#f5c518]">
                      ₹{booking.totalPrice}
                    </p>
                  </div>
                  {getBookingStatusBadge(booking.bookingStatus)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsTab;
