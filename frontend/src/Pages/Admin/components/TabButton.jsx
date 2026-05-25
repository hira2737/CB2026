import React from "react";

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, label }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 ${
      activeTab === id
        ? "bg-[#f5c518] text-black shadow-lg shadow-[#f5c518]/20"
        : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default TabButton;
