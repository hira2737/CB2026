import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../config/api";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar";
import ResaleInfoCard from "../../Components/ResaleInfoCard";
import { MapPin, Ticket, Clock, TrendingDown } from "lucide-react";

const ResaleMarket = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await API.get("/resale");
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      if (loading) {
        toast.error("Failed to load resale marketplace");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleBuy = async (id, movieTitle) => {
    try {
      setProcessingId(id);
      const { data } = await API.post(`/resale/${id}/buy-order`, {});

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Failed to load payment checkout");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "CineBook",
        description: `Resale Ticket - ${movieTitle}`,
        theme: {
          color: "#f5c518",
        },
        handler: async function (response) {
  try {
    const verifyResponse = await API.post(`/resale/${id}/verify`, {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });

    console.log("RESALE VERIFY RESPONSE:", verifyResponse.data);
    toast.success("Resale ticket purchased successfully!");
    navigate(`/booking/success/${verifyResponse.data.bookingId}`);
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed"
            );
          } finally {
            setProcessingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to initiate purchase";
      toast.error(message);
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#f5c518] animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold">Loading resale marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-2">
            Resale <span className="text-[#f5c518]">Marketplace</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Find discounted tickets for upcoming shows
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-12">
          <ResaleInfoCard compact={true} />
        </div>

        {/* Listings or Empty State */}
        {listings.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-[32px] p-12 sm:p-16 border border-white/10 text-center">
            <Ticket size={56} className="text-gray-600 mx-auto mb-6 opacity-40" />
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              No Resale Tickets Available
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              Check back later for discounted tickets
            </p>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
              New listings added frequently
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                {listings.length} Available Listing{listings.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={fetchListings}
                className="text-[10px] font-black text-[#f5c518] uppercase tracking-widest hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const originalPrice = listing.originalPrice || 0;
                const savings = Math.max(
                  originalPrice - (listing.resalePrice || 0),
                  0
                );

                return (
                  <div
                    key={listing._id}
                    className="group bg-[#1a1a1a] rounded-[24px] p-6 border border-white/10 hover:border-[#f5c518]/30 transition-all hover:shadow-[0_0_30px_rgba(245,197,24,0.1)]"
                  >
                    {/* Movie Title */}
                    <h2 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#f5c518] transition-colors mb-4 line-clamp-2">
                      {listing.movieTitle}
                    </h2>

                    {/* Seat Category Badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="px-3 py-1 bg-[#f5c518]/10 text-[#f5c518] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#f5c518]/20">
                        {listing.seatCategory}
                      </span>
                      <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                        {listing.seats?.length} Seat{listing.seats?.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Seats */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Seats
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {listing.seats?.map((seat) => (
                          <span
                            key={seat}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-bold text-white"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cinema & Show Time */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-[#f5c518] shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-300 font-bold line-clamp-2">
                          {listing.cinemaName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={14} className="text-[#f5c518]" />
                        <span>
                          {new Date(listing.showTime).toLocaleDateString()} at{" "}
                          {new Date(listing.showTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-5">
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Price
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-[#f5c518]">
                            ₹{listing.resalePrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{originalPrice}
                          </span>
                        </div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                        <div className="flex items-center gap-1 text-green-400">
                          <TrendingDown size={12} />
                          <span className="text-xs font-bold">
                            Save ₹{savings}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuy(listing._id, listing.movieTitle)}
                      disabled={processingId === listing._id}
                      className="w-full bg-[#f5c518] hover:bg-[#f5c518]/90 text-black py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {processingId === listing._id ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleMarket;
