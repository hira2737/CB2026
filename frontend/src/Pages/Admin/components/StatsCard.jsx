import React from "react";

const StatsCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-[#1a1a1a] p-10 rounded-[40px] border border-white/10 relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-32 h-32 ${bg} blur-3xl opacity-20 rounded-full`}
    ></div>
    <div
      className={`w-16 h-16 ${bg} rounded-3xl flex items-center justify-center mb-6 relative z-10`}
    >
      <Icon size={28} className={color} />
    </div>
    <p className="text-5xl font-black mb-2 relative z-10">{value}</p>
    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] relative z-10">
      {label}
    </p>
  </div>
);

export default StatsCard;
