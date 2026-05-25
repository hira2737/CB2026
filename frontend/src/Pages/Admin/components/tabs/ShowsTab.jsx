import React, { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

const ShowsTab = ({
  shows,
  movies,
  screens,
  onAddClick,
  onCinemaChange,
  showModal,
  onCloseModal,
  newShow,
  setNewShow,
  onSubmit,
  Modal,
}) => {
  // ✅ Prevent past dates
  const today = new Date().toISOString().split("T")[0];
  const [searchTerm, setSearchTerm] = useState("");
  const safeShows = Array.isArray(shows) ? shows : [];
  const filteredShows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return safeShows;

    return safeShows.filter((show) => {
      const date = show?.startTime
        ? new Date(show.startTime).toLocaleDateString()
        : "";

      return [show?.movie?.title, show?.screen?.cinema?.name, date]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [safeShows, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative group w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#f5c518] transition-colors"
            size={18}
          />

          <input
            type="text"
            placeholder="Search shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#121212] border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#f5c518]/50 transition-all w-full text-sm font-bold"
          />
        </div>

        <button
          onClick={onAddClick}
          className="btn-fill-gold flex items-center gap-2 !px-8 !py-4 text-xs font-black uppercase tracking-widest w-full md:w-auto"
        >
          <Plus size={18} />
          Create Show
        </button>
      </div>

      {/* Shows Table */}
      <div className="bg-[#121212] rounded-[40px] border border-white/5 overflow-x-auto shadow-2xl">
        <table className="w-full min-w-[760px] table-fixed text-left font-bold text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[30%]" />
            <col className="w-[27%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="bg-white/5 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-10 py-6">Movie</th>
              <th className="px-10 py-6">Cinema</th>
              <th className="px-10 py-6">Time</th>
              <th className="px-10 py-6 text-right">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filteredShows.map((show) => (
              <tr
                key={show._id}
                className="hover:bg-white/5 transition-colors group"
              >
                {/* Movie */}
                <td className="px-10 py-6 font-black text-white uppercase tracking-tighter truncate max-w-[200px]">
                  {show.movie?.title}
                </td>

                {/* Cinema */}
                <td className="px-10 py-6 text-gray-400">
                  {show.screen?.cinema?.name}
                </td>

                {/* Time */}
                <td className="px-10 py-6 text-gray-400">
                  {new Date(show.startTime).toLocaleDateString()}{" "}
                  <span className="text-[#f5c518]">
                    {new Date(show.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>

                {/* Status */}
                <td className="px-10 py-6 text-right">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                    Active
                  </span>
                </td>
              </tr>
            ))}

            {/* Empty */}
            {filteredShows.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-10 py-20 text-center text-gray-600 italic"
                >
                  {searchTerm
                    ? "No shows match your search."
                    : "No shows scheduled. Create one to get started!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Show Modal */}
      <Modal
        isOpen={showModal}
        onClose={onCloseModal}
        title="Create New Show"
      >
        <form onSubmit={onSubmit} className="space-y-6 font-bold">
          {/* Movie */}
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
              Select Movie
            </label>

            <select
              value={newShow.movie}
              onChange={(e) =>
                setNewShow({
                  ...newShow,
                  movie: e.target.value,
                })
              }
              required
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
            >
              <option value="">Choose a movie</option>

              {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          {/* Screen */}
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
              Select Screen
            </label>

            <select
              value={newShow.screen}
              onChange={(e) =>
                setNewShow({
                  ...newShow,
                  screen: e.target.value,
                })
              }
              required
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
            >
              <option value="">Choose a screen</option>

              {screens.map((screen) => (
                <option key={screen._id} value={screen._id}>
                  {screen.cinema?.name} - {screen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="relative">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
              Show Date
            </label>

            <input
              type="date"
              min={today}
              value={newShow.showDate || ""}
              onChange={(e) =>
                setNewShow({
                  ...newShow,
                  showDate: e.target.value,
                })
              }
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
            />
          </div>

          {/* Start + End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Start Time */}
            <div className="relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                Start Time
              </label>

              <input
                type="time"
                value={newShow.startClock || ""}
                onChange={(e) =>
                  setNewShow({
                    ...newShow,
                    startClock: e.target.value,
                  })
                }
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
              />
            </div>

            {/* End Time */}
            <div className="relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                End Time
              </label>

              <input
                type="time"
                value={newShow.endClock || ""}
                onChange={(e) =>
                  setNewShow({
                    ...newShow,
                    endClock: e.target.value,
                  })
                }
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-fill-gold w-full py-5 uppercase tracking-widest text-[10px] font-black"
          >
            Create Show
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ShowsTab;
