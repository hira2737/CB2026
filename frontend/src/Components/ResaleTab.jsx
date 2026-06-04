import React, { useEffect, useState } from "react";
import API from "../../../../config/api";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

const ResaleTab = () => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | sold | expired

  useEffect(() => {
    fetchAdminResaleData();
  }, []);

  const fetchAdminResaleData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/resale/admin/all");
      setListings(data.listings || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Failed to fetch resale data:", error);
      toast.error("Failed to load resale data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
      sold:    "bg-green-500/10 text-green-400 border-green-500/20",
      expired: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    const label = {
      active: "Active",
      sold: "Sold",
      expired: "Expired",
    };
    return (
      <span
        className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded border ${
          styles[status] || "bg-white/5 text-gray-400 border-white/10"
        }`}
      >
        {label[status] || status}
      </span>
    );
  };

  // Only show active, sold, expired (no cancelled per requirement)
  const filteredListings = listings.filter((l) => {
    if (l.status === "cancelled") return false; // never show cancelled
    if (filter === "all") return true;
    return l.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[#f5c518] animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-bold">Loading resale data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">
          Resale <span className="text-[#f5c518]">Tracking</span>
        </h3>
        <p className="text-sm text-gray-400">Monitor all resale marketplace activity</p>
      </div>

      {/* Stats Cards — Active | Sold | Expired | Platform Revenue */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Active
            </p>
            <p className="text-2xl font-black text-blue-400">{stats.totalActive || 0}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Sold
            </p>
            <p className="text-2xl font-black text-green-400">{stats.totalSold || 0}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Expired
            </p>
            <p className="text-2xl font-black text-gray-400">{stats.totalExpired || 0}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#f5c518]/20">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Platform Revenue
            </p>
            {/* Platform commission ONLY — not total resale price */}
            <p className="text-2xl font-black text-[#f5c518]">₹{stats.totalCommission || 0}</p>
          </div>
        </div>
      )}

      {/* Filter Buttons — Active | Sold | Expired only (no Cancelled) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "active", "sold", "expired"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              filter === status
                ? "bg-[#f5c518] text-black"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Resale Table */}
      {filteredListings.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/10 text-center">
          <AlertCircle size={40} className="text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-bold">No resale listings found</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {[
                  "Movie", "Seller", "Buyer", "Seats",
                  "Original", "Resale", "Commission", "Status", "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr
                  key={listing._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-bold text-white max-w-[160px] truncate">
                    {listing.movieTitle}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                    {listing.seller?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                    {listing.buyer?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {(listing.seats || []).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-white">
                    ₹{listing.originalPrice}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-white">
                    ₹{listing.resalePrice}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#f5c518]">
                    ₹{listing.platformCommission}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(listing.status)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResaleTab;