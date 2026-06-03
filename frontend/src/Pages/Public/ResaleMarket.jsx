import React, { useEffect, useState } from "react";
import API from "../../config/api";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar";

const ResaleMarket = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch resale listings
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await API.get("/resale");
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resale marketplace");
    } finally {
      setLoading(false);
    }
  };

  // BUY ticket
  const handleBuy = async (id) => {
    try {
      const { data } = await API.post(`/resale/buy/${id}`);

      toast.success("Ticket purchased successfully!");
      fetchListings(); // refresh market
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to buy ticket";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-black mb-10">
          🎟️ Resale Marketplace
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-500">No resale tickets available</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {listings.map((item) => (
              <div
                key={item._id}
                className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10"
              >
                <h2 className="text-xl font-bold">
                  {item.movieTitle}
                </h2>

                <p className="text-gray-400 mt-2">
                  Seats: {item.seats?.join(", ")}
                </p>

                <p className="text-gray-400">
                  Price: ₹{item.resalePrice}
                </p>

                <p className="text-green-400 font-bold mt-2">
                  Cinema: {item.cinemaName}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Expires:{" "}
                  {new Date(item.showTime).toLocaleString()}
                </p>

                <button
                  onClick={() => handleBuy(item._id)}
                  className="mt-4 w-full bg-yellow-500 text-black font-bold py-2 rounded-lg"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleMarket;