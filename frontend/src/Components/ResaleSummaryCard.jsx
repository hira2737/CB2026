import React from "react";
import { TrendingUp, Package, DollarSign, AlertCircle } from "lucide-react";

const ResaleSummaryCard = ({ listings = [] }) => {
  if (!listings || listings.length === 0) {
    return null; // Don't show if no resale activity
  }

  // Calculate stats
  const activeListing = listings.filter((l) => l.status === "active").length;
  const soldListings = listings.filter((l) => l.status === "sold").length;
  const totalEarnings = listings
    .filter((l) => l.status === "sold")
    .reduce((sum, l) => sum + (l.sellerAmount || 0), 0);
  const totalFees = listings
    .filter((l) => l.status === "sold")
    .reduce((sum, l) => sum + (l.platformCommission || 0), 0);

  const latestSale = listings
    .filter((l) => l.status === "sold")
    .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))[0];

  return (
    <div className="bg-gradient-to-br from-[#f5c518]/5 to-transparent rounded-[32px] p-6 sm:p-8 border border-[#f5c518]/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#f5c518]/10 flex items-center justify-center">
          <TrendingUp size={24} className="text-[#f5c518]" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            Resale <span className="text-[#f5c518]">Summary</span>
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
            Your resale activity & earnings
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Listings */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Total Listings
          </p>
          <p className="text-2xl font-black text-white">{listings.length}</p>
        </div>

        {/* Active Listings */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Active
          </p>
          <p className="text-2xl font-black text-[#f5c518]">{activeListing}</p>
        </div>

        {/* Sold Listings */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Sold
          </p>
          <p className="text-2xl font-black text-green-400">{soldListings}</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Earnings
          </p>
          <p className="text-lg font-black text-white">₹{totalEarnings}</p>
        </div>
      </div>

      {/* Platform Fee Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Platform Fees */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-[#f5c518]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Platform Fees Paid
            </p>
          </div>
          <p className="text-xl font-black text-white">₹{totalFees}</p>
        </div>

        {/* Latest Sale */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Latest Sale
          </p>
          {latestSale ? (
            <div>
              <p className="text-sm font-bold text-white truncate">
                {latestSale.movieTitle}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(latestSale.soldAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No sales yet</p>
          )}
        </div>
      </div>

      {/* Notice */}
      <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 flex items-start gap-3">
        <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-300">
            Track your resale earnings and monitor active listings from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResaleSummaryCard;
