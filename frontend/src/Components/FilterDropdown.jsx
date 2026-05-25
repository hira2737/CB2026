import React from "react";

const FilterDropdown = ({ label, value, options, onChange }) => (
  <label className="block w-full">
    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-3.5 px-5 outline-none hover:border-white/20 focus:border-[#f5c518]/50 transition-all text-sm font-bold text-white cursor-pointer"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default FilterDropdown;
