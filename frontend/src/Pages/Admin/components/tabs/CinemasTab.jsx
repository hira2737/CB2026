import React, { useMemo, useState } from "react";
import { Plus, Search, Trash2, MapPin } from "lucide-react";
import {
  ALLOWED_CITIES,
  normalizeArrayResponse,
} from "../../../../utils/movieFormatters";

const CinemasTab = ({
  cinemas,
  onAddClick,
  onDelete,
  showModal,
  onCloseModal,
  newCinema,
  setNewCinema,
  onSubmit,
  Modal,
}) => {
  const safeCinemas = normalizeArrayResponse(cinemas, ["cinemas"]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCinemas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return safeCinemas;

    return safeCinemas.filter((cinema) =>
      [cinema?.name, cinema?.address]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [safeCinemas, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="relative group w-full md:w-96">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f5c518] transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search cinemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#121212] border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#f5c518]/50 transition-all w-full text-sm font-bold"
        />
      </div>
      <button
        onClick={onAddClick}
        className="btn-fill-gold flex items-center gap-2 !px-8 !py-4 text-xs font-black uppercase tracking-widest w-full md:w-auto"
      >
        <Plus size={18} /> Add Cinema
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCinemas.map((cinema) => (
        <div
          key={cinema._id}
          className="bg-[#121212] p-8 rounded-[40px] border border-white/5 group relative hover:border-[#f5c518]/20 transition-all"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-[#f5c518] group-hover:bg-[#f5c518] group-hover:text-black transition-all">
              <MapPin size={24} />
            </div>
            <button
              onClick={() => onDelete(cinema)}
              className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-600 hover:text-rose-500 transition-all"
              aria-label={`Delete ${cinema.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
            {cinema.name}
          </h3>
          <p className="text-gray-500 text-xs font-bold font-heading mb-6">
            {cinema.address}, {cinema.city}
          </p>
        </div>
      ))}

      {filteredCinemas.length === 0 && (
        <div className="bg-[#121212] p-8 rounded-[40px] border border-white/5 text-gray-600 italic md:col-span-2 lg:col-span-3 text-center">
          {searchTerm ? "No cinemas match your search." : "No cinemas found."}
        </div>
      )}
    </div>

    <Modal isOpen={showModal} onClose={onCloseModal} title="Add New Cinema">
      <form onSubmit={onSubmit} className="space-y-6 font-bold">
        <div className="relative">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
            Cinema Name
          </label>
          <input
            type="text"
            value={newCinema.name}
            onChange={(e) =>
              setNewCinema({ ...newCinema, name: e.target.value })
            }
            required
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
              City
            </label>
            <select
              value={newCinema.city}
              onChange={(e) =>
                setNewCinema({ ...newCinema, city: e.target.value })
              }
              required
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
            >
              {ALLOWED_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
              Address
            </label>
            <input
              type="text"
              value={newCinema.address}
              onChange={(e) =>
                setNewCinema({ ...newCinema, address: e.target.value })
              }
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-fill-gold w-full py-5 uppercase tracking-widest text-[10px] font-black"
        >
          Register Cinema Hub
        </button>
      </form>
    </Modal>
  </div>
  );
};

export default CinemasTab;
