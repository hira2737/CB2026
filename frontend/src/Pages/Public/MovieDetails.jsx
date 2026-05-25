import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../../config/api";
import Navbar from "../../Components/Navbar";

import {
  Calendar,
  Clock,
  Film,
  Languages,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import {
  formatDuration,
  formatRating,
  getBackdropUrl,
  getMovieFormats,
  getMovieCategories,
  getMovieLanguages,
  normalizeArrayResponse,
  normalizeSingleResponse,
} from "../../utils/movieFormatters";

const SEAT_CATEGORY_SUMMARY = [
  {
    category: "PLATINUM",
    price: 360,
    rows: ["A", "B"],
    seatsPerRow: 14,
  },
  {
    category: "GOLD",
    price: 270,
    rows: ["C", "D", "E", "F"],
    seatsPerRow: 16,
  },
  {
    category: "SILVER",
    price: 180,
    rows: ["G", "H", "I", "J"],
    seatsPerRow: 18,
  },
];

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildDateTabs = (days = 7) => {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      key: toDateKey(date),
      label:
        index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString([], { weekday: "short" }),
      date: date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      }),
    };
  });
};

const getAvailability = (bookedCount, totalSeats) => {
  const total = Number(totalSeats || 0);
  const booked = Number(bookedCount || 0);
  const percentage = total > 0 ? (booked / total) * 100 : 0;

  if (percentage >= 100) return { label: "Sold Out", tone: "text-gray-400", border: "border-gray-500/50" };
  if (percentage >= 95) return { label: "Few Seats Left", tone: "text-red-400", border: "border-red-400/60" };
  if (percentage >= 80) return { label: "Almost Full", tone: "text-orange-400", border: "border-orange-400/60" };
  if (percentage >= 60) return { label: "Filling Fast", tone: "text-amber-400", border: "border-amber-400/60" };
  return { label: "Available", tone: "text-green-400", border: "border-green-400/60" };
};

const getCategorySeatIds = (category) =>
  category.rows.flatMap((row) =>
    Array.from(
      { length: category.seatsPerRow },
      (_, index) => `${row}${index + 1}`
    )
  );

const getCategoryAvailability = (bookedSeats, category) => {
  const categorySeats = getCategorySeatIds(category);
  const bookedSet = new Set(bookedSeats || []);
  const bookedCount = categorySeats.filter((seat) =>
    bookedSet.has(seat)
  ).length;

  return {
    ...category,
    ...getAvailability(bookedCount, categorySeats.length),
    bookedCount,
    totalSeats: categorySeats.length,
  };
};

const getShowAvailability = (bookedSeats) => {
  const categories = SEAT_CATEGORY_SUMMARY.map((category) =>
    getCategoryAvailability(bookedSeats, category)
  );
  const bookedCount = categories.reduce(
    (total, category) => total + category.bookedCount,
    0
  );
  const totalSeats = categories.reduce(
    (total, category) => total + category.totalSeats,
    0
  );
  const allCategoriesSoldOut = categories.every(
    (category) => category.bookedCount >= category.totalSeats
  );

  if (allCategoriesSoldOut) {
    return {
      ...getAvailability(totalSeats, totalSeats),
      bookedCount,
      totalSeats,
      categories,
    };
  }

  const showAvailability = getAvailability(bookedCount, totalSeats);

  return {
    ...showAvailability,
    label:
      showAvailability.label === "Sold Out"
        ? "Few Seats Left"
        : showAvailability.label,
    bookedCount,
    totalSeats,
    categories,
  };
};

const DetailBadge = ({ children }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-200">
    {children}
  </span>
);

const MovieDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [movie, setMovie] = useState(null);

  const [shows, setShows] = useState([]);
  const [bookedSeatsByShow, setBookedSeatsByShow] = useState({});
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [showSeatModal, setShowSeatModal] = useState(false);

  const [selectedShowId, setSelectedShowId] = useState(null);

  const [seatCount, setSeatCount] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        setLoadError("");

        const [movieRes, showsRes] = await Promise.all([
          API.get(`/movies/${id}`),
          API.get(`/shows?movieId=${id}`),
        ]);

        if (!mounted) return;

        const normalizedMovie = normalizeSingleResponse(
          movieRes.data,
          "movie"
        );

        const normalizedShows = normalizeArrayResponse(
          showsRes.data,
          ["shows"]
        );

        setMovie(normalizedMovie);

        setShows(normalizedShows || []);

        const counts = await Promise.all(
          (normalizedShows || []).map(async (show) => {
            try {
              const { data } = await API.get(`/bookings/booked-seats/${show._id}`);
              return [show._id, Array.isArray(data) ? data : []];
            } catch (error) {
              return [show._id, []];
            }
          })
        );

        if (mounted) {
          setBookedSeatsByShow(Object.fromEntries(counts));
        }
      } catch (error) {
        console.error("Movie details error:", error);

        if (!mounted) return;

        setLoadError("Movie details are unavailable right now.");

        toast.error("Failed to load movie details");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const groupedShows = useMemo(() => {
    const now = Date.now();

    return shows
      .filter((show) => {
        const startTime = new Date(show.startTime).getTime();
        return startTime >= now && toDateKey(show.startTime) === selectedDate;
      })
      .reduce((acc, show) => {
      const cinemaName =
        show?.screen?.cinema?.name || "Unknown Cinema";

      if (!acc[cinemaName]) {
        acc[cinemaName] = [];
      }

      acc[cinemaName].push(show);

      return acc;
    }, {});
  }, [selectedDate, shows]);

  const openSeatModal = (showId) => {
    setSelectedShowId(showId);

    setSeatCount("");

    setShowSeatModal(true);
  };

  const closeSeatModal = () => {
    setShowSeatModal(false);

    setSelectedShowId(null);

    setSeatCount("");
  };

  const proceedToSeats = () => {
    const count = Number(seatCount);

    if (!count || count < 1 || count > 10) {
      toast.error("Enter seat count between 1 and 10");
      return;
    }

    navigate(`/book/${selectedShowId}?count=${count}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="max-w-screen-2xl mx-auto px-5 md:px-12 pt-32">
          <div className="h-[520px] rounded-[40px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !movie) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="max-w-screen-2xl mx-auto px-5 md:px-12 pt-32 pb-24">
          <div className="rounded-[40px] border border-white/10 bg-[#121212] p-10 text-center">
            <Film
              size={42}
              className="mx-auto text-[#f5c518] mb-5"
            />

            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Movie not found
            </h1>

            <p className="mt-3 text-gray-500 font-bold">
              {loadError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categories = getMovieCategories(movie);

  const languages = getMovieLanguages(movie);

  const formats = getMovieFormats(movie);
  const dateTabs = buildDateTabs();
  const selectedLanguage = searchParams.get("language") || languages[0] || "";
  const selectedFormat = searchParams.get("format") || formats[0] || "";
  const visibleShowCount = Object.values(groupedShows).reduce(
    (total, cinemaShows) => total + cinemaShows.length,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      {/* HERO */}

      <section className="relative min-h-[620px] md:h-[86vh] overflow-hidden">
        <img
          src={getBackdropUrl(movie)}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt={movie.title}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-5 md:px-12 pt-28 md:pt-36 flex flex-col lg:flex-row gap-10 items-center">
          <img
            src={movie.posterUrl || getBackdropUrl(movie)}
            className="w-56 md:w-80 rounded-[30px] border border-white/10 shadow-2xl"
            alt={movie.title}
          />

          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((category) => (
                <DetailBadge key={category}>
                  {category}
                </DetailBadge>
              ))}
            </div>

            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              {movie.title}
            </h1>

            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-gray-300 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Star
                  size={17}
                  className="text-[#f5c518] fill-[#f5c518]"
                />

                {formatRating(movie.rating)}/10
              </span>

              <span className="flex items-center gap-2">
                <Clock
                  size={16}
                  className="text-[#f5c518]"
                />

                {formatDuration(movie.duration)}
              </span>

              <span className="flex items-center gap-2">
                <Languages
                  size={16}
                  className="text-[#f5c518]"
                />

                {languages.join(", ")}
              </span>

              {selectedLanguage && selectedFormat && (
                <span className="flex items-center gap-2 text-[#f5c518]">
                  {selectedLanguage} - {selectedFormat}
                </span>
              )}

              <span className="flex items-center gap-2">
                <Calendar
                  size={16}
                  className="text-[#f5c518]"
                />

                {movie.releaseDate
                  ? new Date(movie.releaseDate).toLocaleDateString()
                  : "TBA"}
              </span>
            </div>

            <p className="mt-8 text-lg text-gray-300 leading-relaxed max-w-3xl">
              {movie.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {formats.map((format) => (
                <span
                  key={format}
                  className="rounded-xl border border-[#f5c518]/30 bg-[#f5c518]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#f5c518]"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWS */}

      <section className="max-w-screen-2xl mx-auto px-5 md:px-12 py-14">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Available Shows
          </h2>

          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {dateTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedDate(tab.key)}
              className={`min-w-[106px] rounded-2xl border px-4 py-3 text-center transition-all ${
                selectedDate === tab.key
                  ? "border-[#f5c518] bg-[#f5c518] text-black"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-[#f5c518]/50"
              }`}
            >
              <span className="block text-[10px] font-black uppercase tracking-widest">
                {tab.label}
              </span>
              <span className="mt-1 block text-sm font-black uppercase">
                {tab.date}
              </span>
            </button>
          ))}
        </div>

        {visibleShowCount === 0 ? (
          <div className="rounded-[32px] border border-white/5 bg-[#121212] p-10 text-center">
            <p className="text-gray-400 font-bold">
              No shows available for this date
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedShows).map(
              ([cinema, cinemaShows]) => (
                <div
                  key={cinema}
                  className="rounded-[32px] border border-white/5 bg-[#121212] p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-[#f5c518]/10 rounded-2xl text-[#f5c518]">
                      <MapPin size={22} />
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                      {cinema}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {cinemaShows.map((show) => {
                      const availability = getShowAvailability(
                        bookedSeatsByShow[show._id]
                      );
                      const isSoldOut = availability.label === "Sold Out";

                      return (
                        <button
                          key={show._id}
                          type="button"
                          disabled={isSoldOut}
                          onClick={() => openSeatModal(show._id)}
                          className={`group relative rounded-2xl border bg-white/5 px-4 py-5 text-center transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${availability.border} hover:bg-[#f5c518]/10`}
                        >
                          <span className="block text-lg font-black">
                            {new Date(show.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          <span className={`mt-2 block text-[10px] font-black uppercase tracking-widest ${availability.tone}`}>
                            {availability.label}
                          </span>

                          <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 hidden w-64 -translate-x-1/2 rounded-2xl border border-[#f5c518]/20 bg-black p-4 text-left shadow-2xl group-hover:block">
                            <div className="grid grid-cols-3 gap-3">
                              {availability.categories.map((item) => (
                                <div key={item.category}>
                                  <p className="text-sm font-black text-white">
                                    Rs.{item.price}
                                  </p>
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                    {item.category}
                                  </p>
                                  <p className={`mt-1 text-[10px] font-black uppercase ${item.tone}`}>
                                    {item.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* SEAT MODAL */}

      {showSeatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center px-5">
          <div className="w-full max-w-md bg-[#121212] border border-[#f5c518]/20 rounded-[32px] p-8 relative">
            <button
              onClick={closeSeatModal}
              className="absolute right-5 top-5 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[#f5c518]/10 flex items-center justify-center text-[#f5c518]">
                <Users size={30} />
              </div>
            </div>

            <h2 className="text-3xl font-black text-center uppercase tracking-tighter">
              How many seats?
            </h2>

            <p className="text-center text-gray-400 mt-3">
              Enter number of seats you want
            </p>

            <input
              type="number"
              min="1"
              max="10"
              value={seatCount}
              onChange={(e) => setSeatCount(e.target.value)}
              placeholder="Enter seats count"
              className="w-full mt-8 bg-black border border-white/10 rounded-2xl px-5 py-4 text-center text-2xl font-black outline-none focus:border-[#f5c518]"
            />

            <button
              onClick={proceedToSeats}
              className="w-full mt-6 bg-[#f5c518] text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              Select Seats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
