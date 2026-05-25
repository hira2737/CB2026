import React, { useMemo, useState } from "react";
import { Plus, Search, Trash2, Film, Pencil } from "lucide-react";
import {
  DEFAULT_FORMATS,
  formatDuration,
  formatRating,
  getMovieLanguages,
  normalizeArrayResponse,
} from "../../../../utils/movieFormatters";

const MoviesTab = ({
  movies = [],
  categories = [],
  onAddClick,
  onEdit,
  onDelete,
  showModal,
  onCloseModal,
  newMovie,
  setNewMovie,
  posterFile,
  setPosterFile,
  onSubmit,
  Modal,
  isLoading = false,
  isEditing = false,
}) => {
  const safeMovies = normalizeArrayResponse(movies, ["movies"]);
  const safeCategories = normalizeArrayResponse(categories, ["categories"]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredMovies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return safeMovies;

    return safeMovies.filter((movie) => {
      const category =
        typeof movie?.category === "object"
          ? movie?.category?.name
          : movie?.category;
      const languages = getMovieLanguages(movie).join(" ");

      return [movie?.title, category, languages]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [safeMovies, searchTerm]);

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
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#121212] border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#f5c518]/50 transition-all w-full text-sm font-bold text-white"
          />
        </div>

        <button
          onClick={onAddClick}
          className="btn-fill-gold flex items-center gap-2 !px-8 !py-4 text-xs font-black uppercase tracking-widest w-full md:w-auto"
        >
          <Plus size={18} />
          Add Movie
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-[#121212] rounded-[40px] border border-white/5 overflow-x-auto shadow-2xl">
        <table className="w-full min-w-[900px] text-left font-bold">
          <thead className="bg-white/5 text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-10 py-6">Movie</th>
              <th className="px-10 py-6">Category</th>
              <th className="px-10 py-6">Duration</th>
              <th className="px-10 py-6">Rating</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filteredMovies.map((movie, index) => (
              <tr
                key={movie?._id || index}
                className="hover:bg-white/5 transition-colors group"
              >
                {/* Movie */}
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    {movie?.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        className="w-12 h-16 object-cover rounded-xl shadow-lg"
                        alt={movie?.title || "Movie"}
                      />
                    ) : (
                      <div className="w-12 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                        <Film size={20} className="text-gray-600" />
                      </div>
                    )}

                    <div>
                      <p className="font-black text-white uppercase tracking-tighter text-lg group-hover:text-[#f5c518] transition-colors">
                        {movie?.title || "Untitled"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {getMovieLanguages(movie).join(", ") ||
                          "Unknown Language"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-10 py-6 text-gray-400 text-sm">
                  {movie?.category?.name ||
                    movie?.category ||
                    "Uncategorized"}
                </td>

                {/* Duration */}
                <td className="px-10 py-6 text-gray-400 text-sm">
                  {formatDuration(movie?.duration)}
                </td>

                {/* Rating */}
                <td className="px-10 py-6 text-gray-400 text-sm">
                  <span className="text-[#f5c518] font-black">
                    {formatRating(movie?.rating)}
                  </span>{" "}
                  /10
                </td>

                {/* Actions */}
                <td className="px-10 py-6">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(movie)}
                      className="p-3 hover:bg-[#f5c518]/10 rounded-2xl text-gray-600 hover:text-[#f5c518] transition-all"
                      aria-label={`Edit ${movie?.title || "movie"}`}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(movie)}
                      className="p-3 hover:bg-rose-500/10 rounded-2xl text-gray-600 hover:text-rose-500 transition-all"
                      aria-label={`Delete ${movie?.title || "movie"}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {filteredMovies.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-10 py-20 text-center text-gray-600 italic"
                >
                  {isLoading
                    ? "Loading movies..."
                    : searchTerm
                    ? "No movies match your search."
                    : "No movies found in database."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Movie Modal */}
      <Modal
        isOpen={showModal}
        onClose={onCloseModal}
        title={isEditing ? "Edit Movie" : "Add New Movie"}
      >
        <form onSubmit={onSubmit} className="space-y-6 font-bold">
          {/* Title + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                Title
              </label>

              <input
                type="text"
                value={newMovie?.title || ""}
                onChange={(e) =>
                  setNewMovie({
                    ...newMovie,
                    title: e.target.value,
                  })
                }
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                Category
              </label>

              <select
                value={newMovie?.category || ""}
                onChange={(e) =>
                  setNewMovie({
                    ...newMovie,
                    category: e.target.value,
                  })
                }
                required
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
              >
                <option value="">Select Category</option>

                {safeCategories.map((cat, index) => (
                  <option key={cat?._id || index} value={cat?._id}>
                    {cat?.name}
                  </option>
                ))}
              </select>

              {safeCategories.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  No categories found. Add categories first.
                </p>
              )}
            </div>
          </div>

          {/* Duration + Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                  Hours
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={newMovie?.durationHours || ""}
                  onChange={(e) =>
                    setNewMovie({
                      ...newMovie,
                      durationHours: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                  Minutes
                </label>

                <input
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  value={newMovie?.durationMinutes || ""}
                  onChange={(e) =>
                    setNewMovie({
                      ...newMovie,
                      durationMinutes: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                Rating /10
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="8.5"
                value={newMovie?.rating || ""}
                onChange={(e) =>
                  setNewMovie({
                    ...newMovie,
                    rating: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
              />
            </div>
          </div>

          {/* Formats */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Formats
            </p>

            <div className="flex flex-wrap gap-3">
              {DEFAULT_FORMATS.map((format) => {
                const checked = (newMovie?.formats || []).includes(format);

                return (
                  <label
                    key={format}
                    className={`cursor-pointer rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      checked
                        ? "border-[#f5c518]/40 bg-[#f5c518] text-black"
                        : "border-white/10 bg-black/20 text-gray-400 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const currentFormats = newMovie?.formats || [];

                        setNewMovie({
                          ...newMovie,
                          formats: checked
                            ? currentFormats.filter((item) => item !== format)
                            : [...currentFormats, format],
                        });
                      }}
                      className="sr-only"
                    />

                    {format === "Dolby" ? "Dolby Cinema" : format}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Poster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="file"
              onChange={(e) => setPosterFile(e.target.files[0])}
              accept="image/*"
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white"
            />

            <input
              type="url"
              placeholder="Poster URL"
              value={newMovie?.posterUrl || ""}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  posterUrl: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white"
            />
          </div>

          {/* Release Date + Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="date"
              value={newMovie?.releaseDate || ""}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  releaseDate: e.target.value,
                })
              }
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white"
            />

            <input
              type="text"
              placeholder="Languages (English, Hindi)"
              value={newMovie?.language || ""}
              onChange={(e) =>
                setNewMovie({
                  ...newMovie,
                  language: e.target.value,
                })
              }
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white"
            />
          </div>

          {/* Description */}
          <textarea
            value={newMovie?.description || ""}
            onChange={(e) =>
              setNewMovie({
                ...newMovie,
                description: e.target.value,
              })
            }
            required
            placeholder="Description"
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm text-white h-32 resize-none"
          />

          <button
            type="submit"
            disabled={safeCategories.length === 0}
            className="btn-fill-gold w-full py-5 uppercase tracking-widest text-[10px] font-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? "Update Movie" : "Publish Movie"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MoviesTab;
