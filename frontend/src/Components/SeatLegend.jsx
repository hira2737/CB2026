import React from "react";
import { Lock, Sofa } from "lucide-react";

const SeatLegend = ({ showResaleLegend = false }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-300 mb-5">
        Seat Legend
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {/* Available Seat */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-t-xl rounded-b-md bg-[#1a1a1a] border border-[#f5c518]/30 text-[#f5c518] cursor-pointer hover:bg-[#f5c518]/20 hover:border-[#f5c518] transition-colors flex items-center justify-center">
            <Sofa size={16} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Available
          </p>
        </div>

        {/* Booked Seat */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-t-xl rounded-b-md bg-gray-700 border border-gray-700 opacity-40 cursor-not-allowed flex items-center justify-center">
            <Lock size={15} className="text-gray-300" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Booked
          </p>
        </div>

        {/* Selected Seat */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-t-xl rounded-b-md bg-[#f5c518] border border-[#f5c518] flex items-center justify-center shadow-[0_0_18px_rgba(245,197,24,0.35)]">
            <Sofa size={16} className="text-black" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Selected
          </p>
        </div>

        {/* Resale Seat - Only show if in resale mode */}
        {showResaleLegend && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-black border border-[#f5c518] text-[#f5c518] cursor-pointer flex items-center justify-center shadow-[0_0_14px_rgba(245,197,24,0.18)]">
              <span className="text-sm font-black leading-none">R</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Resale
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatLegend;
