import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, Home, Ticket } from "lucide-react";
import Navbar from "../../Components/Navbar";

const BookingFailed = () => {
  const [searchParams] = useSearchParams();
  const errorMsg =
    searchParams.get("error") || "Payment was unsuccessful. Please try again.";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto px-5 sm:px-12 pt-36 md:pt-32 pb-24 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-rose-500/10 rounded-full flex items-center justify-center border-4 border-rose-500 animate-in zoom-in duration-700">
              <XCircle size={56} className="text-rose-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter">
              Payment <span className="text-rose-500">Failed</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              We couldn't process your payment. Please try again.
            </p>
          </div>

          <div className="bg-[#1a1a1a] rounded-3xl p-5 sm:p-8 border border-rose-500/20">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-black mb-2">
              Error Details
            </p>
            <p className="text-rose-400 font-bold break-words">{errorMsg}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/"
              className="btn-fill-gold !px-10 !py-4 text-sm flex items-center gap-2 justify-center uppercase tracking-widest"
            >
              <Ticket size={18} /> Try Again
            </Link>

            <Link
              to="/bookings"
              className="btn-outline-gold !px-10 !py-4 text-sm flex items-center gap-2 justify-center uppercase tracking-widest"
            >
              <Home size={18} /> My Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;
