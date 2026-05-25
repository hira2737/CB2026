import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search movies..." }) => (
  <div className="relative group w-full">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f5c518] transition-colors"
      size={18}
    />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:border-[#f5c518]/50 transition-all text-sm font-bold text-white placeholder:text-gray-600"
    />
  </div>
);

export default SearchBar;
