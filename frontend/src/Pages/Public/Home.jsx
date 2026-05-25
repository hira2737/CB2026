// KEEP YOUR IMPORTS SAME

import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  getMovieGenres,
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

  const genreMatch =
    filters.genre === "All" ||
    getMovieGenres(movie).includes(filters.genre);

  const languageMatch =
    filters.language === "All" ||
    getMovieLanguages(movie).includes(filters.language);

  const formatMatch =
    filters.format === "All" ||
    getMovieFormats(movie).includes(filters.format);

  return (
    searchMatch &&
    genreMatch &&
    languageMatch &&
    formatMatch
  );
};

const movieGrid = (movies, activeMovieIds) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
    {movies.map((movie) => (
      <MovieCard
        key={movie._id}
        movie={movie}
        hasActiveShow={activeMovieIds.has(movie._id)}
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

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    genre: "All",
    language: "All",
    format: "All",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showRes] = await Promise.all([
          API.get("/movies"),
          API.get("/shows"),
        ]);

        setMovies(
          normalizeArrayResponse(movieRes.data, ["movies"])
        );

        setShows(
          normalizeArrayResponse(showRes.data, ["shows"])
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        key: "genre",
        label: "Genre",
        options: uniqueOptions(
          movies.flatMap(getMovieGenres),
          "All Genres"
        ),
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
    [movies]
  );

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) =>
        movieMatchesFilter(movie, filters)
      ),
    [movies, filters]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <HeroCarousel />

      <SectionWrapper
        id="movies-section"
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
        eyebrow="Fresh Arrivals"
        title="Now Showing"
        count={filteredMovies.length}
      >
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredMovies.length > 0 ? (
          movieGrid(filteredMovies, activeMovieIds)
        ) : (
          <EmptyState />
        )}
      </SectionWrapper>

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