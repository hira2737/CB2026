import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const BookingsTab = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return safeBookings;

    return safeBookings.filter((booking) =>
      [
        booking?.transactionId,
        booking?.user?.name,
        booking?.show?.movie?.title,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [safeBookings, searchTerm]);

  return (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="relative group w-full md:w-96">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f5c518] transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#121212] border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#f5c518]/50 transition-all w-full text-sm font-bold"
        />
      </div>
    </div>

    <div className="bg-[#121212] rounded-[40px] border border-white/5 overflow-x-auto shadow-2xl">
      <table className="w-full min-w-[1100px] text-left font-bold text-sm">
        <thead className="bg-white/5 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] border-b border-white/5">
          <tr>
            <th className="px-10 py-6">Transaction ID</th>
            <th className="px-10 py-6">User</th>
            <th className="px-10 py-6">Movie</th>
            <th className="px-10 py-6">Seats</th>
            <th className="px-10 py-6">Amount</th>
            <th className="px-10 py-6">Payment</th>
            <th className="px-10 py-6">Date</th>
            <th className="px-10 py-6 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredBookings.map((booking, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors group">
              <td className="px-10 py-6 text-gray-500 text-xs font-black font-mono">
                {booking.transactionId || "—"}
              </td>
              <td className="px-10 py-6 text-gray-400">
                {booking.user?.name || "Unknown"}
              </td>
              <td className="px-10 py-6 font-black text-white uppercase tracking-tighter truncate max-w-[200px]">
                {booking.show?.movie?.title}
              </td>
              <td className="px-10 py-6 text-gray-400 text-xs">
                {booking.seats?.join(", ")}
              </td>
              <td className="px-10 py-6 text-[#f5c518] font-black">
                ₹ {booking.totalPrice}
              </td>
              <td className="px-10 py-6">
                {booking.paymentStatus === "paid" ? (
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                    Paid
                  </span>
                ) : booking.paymentStatus === "failed" ? (
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-500/20">
                    Failed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-10 py-6 text-gray-400 text-xs">
                {new Date(booking.createdAt).toLocaleDateString()}
              </td>
              <td className="px-10 py-6 text-right">
                <span
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    booking.bookingStatus === "confirmed"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : booking.bookingStatus === "cancelled"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }`}
                >
                  {booking.bookingStatus}
                </span>
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr>
              <td
                colSpan="8"
                className="px-10 py-20 text-center text-gray-600 italic"
              >
                {searchTerm
                  ? "No bookings match your search."
                  : "No payment history found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default BookingsTab;
