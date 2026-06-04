import React from "react";
import { AlertCircle, Clock, TrendingDown } from "lucide-react";

const ResaleInfoCard = ({ compact = false }) => {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f5c518]/10 flex items-center justify-center">
          <AlertCircle size={20} className="text-[#f5c518]" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Resale Information
          </h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
            Important Terms & Rules
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        {/* Rule 1: Monthly Limit */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Monthly Limit
          </p>
          <p className="text-sm font-bold text-white">2 listings per month</p>
          <p className="text-xs text-gray-500 mt-1">Maximum resale listings allowed</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            How Resale Works
          </p>
          <p className="text-sm font-bold text-white">Discounted tickets from other users</p>
          <p className="text-xs text-gray-500 mt-1">Buyers pay less than the original tier price</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Platform Commission
          </p>
          <p className="text-sm font-bold text-white">10% of resale price</p>
          <p className="text-xs text-gray-500 mt-1">Seller receives the remaining amount</p>
        </div>

        {/* Rule 2: Time Restriction */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-[#f5c518]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Time Restriction
            </p>
          </div>
          <p className="text-sm font-bold text-white">1 hour before show</p>
          <p className="text-xs text-gray-500 mt-1">Resale closes when show begins</p>
        </div>

        {/* Rule 3: Platinum Pricing */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Platinum
            </p>
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">
              Premium
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            ₹235 <span className="text-gray-500 line-through text-xs ml-1">₹360</span>
          </p>
        </div>

        {/* Rule 4: Gold Pricing */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Gold
            </p>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded">
              Standard
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            ₹175 <span className="text-gray-500 line-through text-xs ml-1">₹270</span>
          </p>
        </div>

        {/* Rule 5: Silver Pricing */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Silver
            </p>
            <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-[10px] font-bold rounded">
              Economy
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            ₹115 <span className="text-gray-500 line-through text-xs ml-1">₹180</span>
          </p>
        </div>

        {/* Rule 6: Disclaimer */}
        <div className="bg-rose-500/5 rounded-xl p-4 border border-rose-500/10 md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-rose-400 shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">
              Important Notice
            </p>
          </div>
          <p className="text-xs text-rose-200">
            Listing a ticket for resale does not guarantee it will be sold. Success depends on demand, seat quality, show timing, and buyer interest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResaleInfoCard;
