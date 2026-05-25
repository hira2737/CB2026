// KEEP YOUR IMPORTS SAME

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../config/api";
import MovieCard from "../../Components/MovieCard";
import Navbar from "../../Components/Navbar";
import HeroCarousel from "../../Components/HeroCarousel";
import SearchBar from "../../Components/SearchBar";
import FilterDropdown from "../../Components/FilterDropdown";
import SectionWrapper from "../../Components/SectionWrapper";
import SkeletonLoader from "../../Components/SkeletonLoader";

import {
  DEFAULT_FORMATS,
  getMovieFormats,
  getMovieLanguages,
  normalizeArrayResponse,
} from "../../utils/movieFormatters";

import {
  Film,
  Instagram,
  Youtube,
} from "lucide-react";

import { FaXTwitter } from "react-icons/fa6";

const emptyOption = (label) => ({
  label,
  value: "All",
});

const uniqueOptions = (items, label) => [
  emptyOption(label),
  ...Array.from(new Set(items.filter(Boolean)))
    .sort()
    .map((item) => ({
      label: item,
      value: item,
    })),
];

const movieMatchesFilter = (movie, filters) => {
  const searchMatch = movie.title
    ?.toLowerCase()
    .includes(filters.search.trim().toLowerCase());

  const categoryId =
    typeof movie?.category === "object" ? movie.category?._id : movie?.category;

  const categoryMatch =
    filters.category === "All" || categoryId === filters.category;

  const languageMatch =
    filters.language === "All" ||
    getMovieLanguages(movie).includes(filters.language);

  const formatMatch =
    filters.format === "All" ||
    getMovieFormats(movie).includes(filters.format);

  return (
    searchMatch &&
    categoryMatch &&
    languageMatch &&
    formatMatch
  );
};

const movieGrid = (movies, activeMovieIds, onSelectMovie) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
    {movies.map((movie) => (
      <MovieCard
        key={movie._id}
        movie={movie}
        hasActiveShow={activeMovieIds.has(movie._id)}
        onSelect={onSelectMovie}
      />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="py-16 text-center text-gray-500 font-bold uppercase tracking-widest text-xs border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
    No movies found
  </div>
);

const Home = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMovie, setSelectionMovie] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "All",
    language: "All",
    format: "All",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showRes, categoryRes] = await Promise.all([
          API.get("/movies"),
          API.get("/shows"),
          API.get("/categories"),
        ]);

        setMovies(
          normalizeArrayResponse(movieRes.data, ["movies"])
        );

        setShows(
          normalizeArrayResponse(showRes.data, ["shows"])
        );

        setCategories(
          normalizeArrayResponse(categoryRes.data, ["categories"])
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location.pathname === "/movies") {
      window.setTimeout(() => {
        document
          .getElementById("search-movies-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.pathname]);

  const activeMovieIds = useMemo(() => {
    const now = Date.now();

    return new Set(
      shows
        .filter(
          (show) =>
            new Date(show.startTime).getTime() >= now
        )
        .map((show) => show.movie?._id || show.movie)
        .filter(Boolean)
    );
  }, [shows]);

  const filterConfig = useMemo(
    () => [
      {
        key: "category",
        label: "Category",
        options: [
          emptyOption("All Categories"),
          ...categories.map((category) => ({
            label: category.name,
            value: category._id,
          })),
        ],
      },
      {
        key: "language",
        label: "Language",
        options: uniqueOptions(
          movies.flatMap(getMovieLanguages),
          "All Languages"
        ),
      },
      {
        key: "format",
        label: "Format",
        options: uniqueOptions(
          [...DEFAULT_FORMATS, ...movies.flatMap(getMovieFormats)],
          "All Formats"
        ),
      },
    ],
    [categories, movies]
  );

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) =>
        movieMatchesFilter(movie, filters)
      ),
    [movies, filters]
  );

  const openMovieSelection = (movie) => {
    const languages = getMovieLanguages(movie);
    const formats = getMovieFormats(movie);

    setSelectionMovie(movie);
    setSelectedLanguage(languages.length === 1 ? languages[0] : "");
    setSelectedFormat(formats.length === 1 ? formats[0] : "");
  };

  const confirmMovieSelection = () => {
    if (!selectionMovie || !selectedLanguage || !selectedFormat) return;

    const params = new URLSearchParams({
      language: selectedLanguage,
      format: selectedFormat,
    });

    navigate(`/movie/${selectionMovie._id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <HeroCarousel />

      <SectionWrapper
        id="search-movies-section"
        eyebrow="Find your show"
        title="Search Movies"
      >
        <div className="rounded-[32px] border border-white/5 bg-[#0f0f0f] p-5 md:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4">
            <SearchBar
              value={filters.search}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  search: value,
                }))
              }
            />

            {filterConfig.map((filter) => (
              <FilterDropdown
                key={filter.key}
                label={filter.label}
                value={filters[filter.key]}
                options={filter.options}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    [filter.key]: value,
                  }))
                }
              />
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="now-showing-section"
        eyebrow="Fresh Arrivals"
        title="Now Showing"
        count={filteredMovies.length}
      >
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredMovies.length > 0 ? (
          movieGrid(filteredMovies, activeMovieIds, openMovieSelection)
        ) : (
          <EmptyState />
        )}
      </SectionWrapper>

      {selectionMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-[#f5c518]/20 bg-[#121212] p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              {selectionMovie.title}
            </h2>

            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              Choose your show preference
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#f5c518]/60"
                >
                  <option value="">Select language</option>
                  {getMovieLanguages(selectionMovie).map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#f5c518]/60"
                >
                  <option value="">Select format</option>
                  {getMovieFormats(selectionMovie).map((format) => (
                    <option key={format} value={format}>
                      {format === "Dolby" ? "Dolby Cinema" : format}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSelectionMovie(null)}
                className="rounded-xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMovieSelection}
                disabled={!selectedLanguage || !selectedFormat}
                className="btn-fill-gold flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 bg-[#050505] py-12">
        <div className="max-w-screen-2xl mx-auto px-5 md:px-12 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <div className="bg-[#f5c518] p-1.5 rounded-lg">
                <Film size={20} className="text-black" />
              </div>

              <span className="text-2xl font-black tracking-tighter text-white">
                CINE
                <span className="text-[#f5c518]">
                  BOOK
                </span>
              </span>
            </Link>

            <p className="mt-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
              CineBook Premium Movie Experience
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-5">
            <div className="flex flex-wrap gap-5 text-gray-400 text-sm">
              <a
                href="#"
                className="hover:text-[#f5c518] transition-all"
              >
                Terms & Conditions
              </a>

              <a
                href="#"
                className="hover:text-[#f5c518] transition-all"
              >
                Privacy Policy
              </a>

              <a
                href="#"
                className="hover:text-[#f5c518] transition-all"
              >
                Content Guidelines
              </a>
            </div>

            <div className="flex gap-5 text-gray-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5c518] transition-all"
              >
                <Instagram />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5c518] transition-all"
              >
                <FaXTwitter />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5c518] transition-all"
              >
                <Youtube />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
