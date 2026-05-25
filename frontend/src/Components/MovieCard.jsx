import React from "react";
import { Link } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import {
  formatDuration,
  formatRating,
  getMovieFormats,
  getMovieGenres,
  getMovieLanguages,
  getMovieStatus,
} from "../utils/movieFormatters";

const MovieCard = ({ movie, hasActiveShow = false }) => {
  const genres = getMovieGenres(movie);
  const languages = getMovieLanguages(movie);
  const formats = getMovieFormats(movie);
  const status = getMovieStatus(movie, hasActiveShow);

  return (
    <Link
      to={`/movie/${movie._id}`}
      className="group relative block transition-all duration-300 active:scale-95"
    >
      <div className="aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl bg-[#121212] border border-white/5 group-hover:border-[#f5c518]/60 group-hover:shadow-[0_0_35px_rgba(245,197,24,0.18)] transition-all duration-500">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <span className="rounded-xl bg-[#f5c518] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-black shadow-lg">
            {status}
          </span>
          {hasActiveShow && (
            <span className="rounded-xl border border-white/10 bg-black/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              Only in theatres
            </span>
          )}
        </div>

        <div className="absolute top-14 right-3 z-20 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Star size={14} className="text-[#f5c518] fill-[#f5c518]" />
          <span className="text-sm font-black text-white">
            {formatRating(movie.rating)}
          </span>
          <span className="text-[10px] font-black text-gray-400">/10</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 pt-28 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h3 className="text-base md:text-xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg group-hover:text-[#f5c518] transition-colors line-clamp-2">
            {movie.title}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <Clock size={13} />
            <span>{formatDuration(movie.duration)}</span>
            <span className="text-white/20">•</span>
            <span className="truncate">{languages.slice(0, 2).join(", ") || "Language TBA"}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-200"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {formats.slice(0, 4).map((format) => (
              <span
                key={format}
                className="rounded-md border border-[#f5c518]/30 bg-[#f5c518]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#f5c518]"
              >
                {format === "Dolby" ? "Dolby Cinema" : format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
