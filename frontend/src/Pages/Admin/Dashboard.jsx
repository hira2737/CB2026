import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import API from "../../config/api";
import Navbar from "../../Components/Navbar";
import TabButton from "./components/TabButton";
import BookingsTab from "./components/tabs/BookingsTab";
import CategoriesTab from "./components/tabs/CategoriesTab";
import MoviesTab from "./components/tabs/MoviesTab";
import CinemasTab from "./components/tabs/CinemasTab";
import ShowsTab from "./components/tabs/ShowsTab";
import ConfirmModal from "./components/ConfirmModal";
import {
  durationPartsToMinutes,
  normalizeArrayResponse,
  normalizeSingleResponse,
} from "../../utils/movieFormatters";

import {
  BarChart3,
  Film,
  MapPin,
  Calendar,
  Ticket,
  Plus,
  TrendingUp,
} from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#121212] w-full max-w-xl rounded-[28px] sm:rounded-[40px] border border-white/5 p-6 sm:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="pr-10 text-2xl sm:text-3xl font-black uppercase tracking-tighter text-[#f5c518] mb-8 break-words">
          {title}
        </h2>

        {children}

        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <Plus size={32} className="rotate-45" />
        </button>
      </div>
    </div>
  );
};

const emptyMovieForm = {
  title: "",
  category: "",
  durationHours: "",
  durationMinutes: "",
  rating: "",
  posterUrl: "",
  description: "",
  releaseDate: "",
  language: "",
  formats: ["2D"],
};

const toDateInputValue = (date) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().split("T")[0];
};

const movieToForm = (movie) => {
  const duration = Number(movie?.duration || 0);

  return {
    title: movie?.title || "",
    category:
      typeof movie?.category === "object"
        ? movie?.category?._id || ""
        : movie?.category || "",
    durationHours: duration ? String(Math.floor(duration / 60)) : "",
    durationMinutes: duration ? String(duration % 60) : "",
    rating: movie?.rating ?? "",
    posterUrl: movie?.posterUrl || "",
    description: movie?.description || "",
    releaseDate: toDateInputValue(movie?.releaseDate),
    language: Array.isArray(movie?.language)
      ? movie.language.join(", ")
      : movie?.language || "",
    formats: Array.isArray(movie?.formats) && movie.formats.length
      ? movie.formats
      : ["2D"],
  };
};

const AdminDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState("overview");

  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [shows, setShows] = useState([]);
  const [screens, setScreens] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showShowModal, setShowShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [newMovie, setNewMovie] = useState({
    ...emptyMovieForm,
  });

  const [posterFile, setPosterFile] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);

  const [newCinema, setNewCinema] = useState({
    name: "",
    city: "Chennai",
    address: "",
  });

  const [newShow, setNewShow] = useState({
    movie: "",
    screen: "",
    showDate: "",
    startClock: "",
    endClock: "",
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // Fetch Data
  const fetchData = async () => {
    const fetchers = [
      {
        key: "movies",
        url: "/movies",
        setter: setMovies,
        responseKeys: ["movies"],
      },
      {
        key: "bookings",
        url: "/bookings/all",
        setter: setBookings,
        responseKeys: ["bookings"],
      },
      {
        key: "cinemas",
        url: "/cinemas",
        setter: setCinemas,
        responseKeys: ["cinemas"],
      },
      {
        key: "shows",
        url: "/shows",
        setter: setShows,
        responseKeys: ["shows"],
      },
      {
        key: "categories",
        url: "/categories",
        setter: setCategories,
        responseKeys: ["categories"],
      },
      {
        key: "screens",
        url: "/screens",
        setter: setScreens,
        responseKeys: ["screens"],
      },
    ];

    await Promise.all(
      fetchers.map(async (f) => {
        try {
          const response = await API.get(f.url);

          f.setter(
            normalizeArrayResponse(response.data, f.responseKeys)
          );
        } catch (error) {
          console.error(`Failed to fetch ${f.key}:`, error);

          toast.error(`Failed to load ${f.key}`);

          f.setter([]);
        }
      })
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        await fetchData();
      } finally {
        if (mounted) {
          setIsLoadingData(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const resetMovieForm = () => {
    setNewMovie({ ...emptyMovieForm });
    setPosterFile(null);
    setEditingMovie(null);
  };

  const openAddMovieModal = () => {
    resetMovieForm();
    setShowMovieModal(true);
  };

  const openEditMovieModal = (movie) => {
    setEditingMovie(movie);
    setNewMovie(movieToForm(movie));
    setPosterFile(null);
    setShowMovieModal(true);
  };

  const closeMovieModal = () => {
    setShowMovieModal(false);
    resetMovieForm();
  };

  // Add / Edit Movie
  const handleSaveMovie = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editingMovie ? "Updating movie..." : "Publishing movie..."
    );

    try {
      const formData = new FormData();

      Object.keys(newMovie).forEach((key) => {
        if (
          !["posterUrl", "durationHours", "durationMinutes"].includes(key)
        ) {
          let value = newMovie[key];

          if (key === "rating" && value === "") {
            value = "0";
          }

          if (Array.isArray(value)) {
            value = value.join(",");
          }

          formData.append(key, value);
        }
      });

      const duration = durationPartsToMinutes(
        newMovie.durationHours,
        newMovie.durationMinutes
      );

      formData.append("duration", duration);

      if (posterFile) {
        formData.append("poster", posterFile);
      } else if (newMovie.posterUrl) {
        formData.append("posterUrl", newMovie.posterUrl);
      }

      if (!posterFile && !newMovie.posterUrl) {
        toast.error(
          "Please provide either a poster file or a poster URL",
          {
            id: loadingToast,
          }
        );

        return;
      }

      if (duration <= 0) {
        toast.error("Please enter a valid movie duration", {
          id: loadingToast,
        });

        return;
      }

      const rating = Number(newMovie.rating || 0);

      if (!Number.isFinite(rating) || rating < 0 || rating > 10) {
        toast.error("Rating must be between 0 and 10", {
          id: loadingToast,
        });

        return;
      }

      if (!newMovie.formats?.length) {
        toast.error("Please select at least one format", {
          id: loadingToast,
        });

        return;
      }

      const request = editingMovie
        ? API.put(`/movies/${editingMovie._id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        : API.post("/movies", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

      const { data } = await request;

      const savedMovie = normalizeSingleResponse(data, "movie");

      toast.success(
        editingMovie
          ? "Movie updated successfully!"
          : "Movie published successfully!",
        {
          id: loadingToast,
        }
      );

      if (savedMovie?._id) {
        setMovies((prev) => {
          const normalized = normalizeArrayResponse(prev);

          if (editingMovie) {
            return normalized.map((movie) =>
              movie._id === savedMovie._id ? savedMovie : movie
            );
          }

          return [savedMovie, ...normalized];
        });
      }

      setShowMovieModal(false);
      resetMovieForm();

      await fetchData();
    } catch (error) {
      console.error("Failed to save movie:", error);

      toast.error(
        error.response?.data?.message || "Failed to save movie",
        {
          id: loadingToast,
        }
      );
    }
  };

  // Add Cinema
  const handleAddCinema = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Registering cinema...");

    try {
      const { data } = await API.post("/cinemas", newCinema);

      await API.post("/screens", {
        cinema: data._id,
        name: "Screen 1",
        totalSeats: 80,
      });

      toast.success("Cinema hub registered!", {
        id: loadingToast,
      });

      setShowCinemaModal(false);

      setNewCinema({
        name: "",
        city: "Chennai",
        address: "",
      });

      fetchData();
    } catch (error) {
      toast.error("Failed to add cinema", {
        id: loadingToast,
      });
    }
  };

  // Add Show
  const handleAddShow = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Creating show...");

    try {
      const {
        movie,
        screen,
        showDate,
        startClock,
        endClock,
      } = newShow;

      // Merge date + time
      const startTime = new Date(`${showDate}T${startClock}`);
      const endTime = new Date(`${showDate}T${endClock}`);

      if (startTime < new Date()) {
        toast.error("Cannot create shows in the past", {
          id: loadingToast,
        });

        return;
      }

      if (endTime <= startTime) {
        toast.error("End time must be after start time", {
          id: loadingToast,
        });

        return;
      }

      await API.post("/shows", {
        movie,
        screen,
        startTime,
        endTime,
      });

      toast.success("Show created successfully!", {
        id: loadingToast,
      });

      setShowShowModal(false);

      setNewShow({
        movie: "",
        screen: "",
        showDate: "",
        startClock: "",
        endClock: "",
        price: "",
      });

      fetchData();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to create show",
        {
          id: loadingToast,
        }
      );
    }
  };

  // Delete Movie
  const performDeleteMovie = async (id) => {
    const loadingToast = toast.loading("Deleting movie...");

    try {
      await API.delete(`/movies/${id}`);

      setMovies((prev) =>
        normalizeArrayResponse(prev).filter(
          (movie) => movie._id !== id
        )
      );

      toast.success("Movie deleted successfully!", {
        id: loadingToast,
      });

      await fetchData();
    } catch (error) {
      toast.error("Failed to delete movie", {
        id: loadingToast,
      });
    }
  };

  // Delete Cinema
  const performDeleteCinema = async (id) => {
    const loadingToast = toast.loading("Deleting cinema...");

    try {
      await API.delete(`/cinemas/${id}`);

      setCinemas((prev) =>
        normalizeArrayResponse(prev).filter(
          (cinema) => cinema._id !== id
        )
      );

      toast.success("Cinema deleted successfully!", {
        id: loadingToast,
      });

      await fetchData();
    } catch (error) {
      toast.error("Failed to delete cinema", {
        id: loadingToast,
      });
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Adding category...");

    try {
      await API.post("/categories", newCategory);

      toast.success("Category added successfully!", {
        id: loadingToast,
      });

      setShowCategoryModal(false);

      setNewCategory({
        name: "",
        description: "",
      });

      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add category",
        {
          id: loadingToast,
        }
      );
    }
  };

  // Delete Category
  const performDeleteCategory = async (id) => {
    const loadingToast = toast.loading("Deleting category...");

    try {
      await API.delete(`/categories/${id}`);

      setCategories((prev) =>
        normalizeArrayResponse(prev).filter(
          (category) => category._id !== id
        )
      );

      toast.success("Category deleted successfully!", {
        id: loadingToast,
      });

      await fetchData();
    } catch (error) {
      toast.error("Failed to delete category", {
        id: loadingToast,
      });
    }
  };

  // Delete Confirm
  const openDeleteConfirmation = (type, id, name) => {
    const labels = {
      movie: "movie",
      category: "category",
      cinema: "cinema",
    };

    setConfirmDelete({
      type,
      id,
      title: `Delete ${labels[type]}`,
      message: `This will permanently remove ${
        name || `this ${labels[type]}`
      }.`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    const { type, id } = confirmDelete;

    setConfirmDelete(null);

    if (type === "movie") {
      await performDeleteMovie(id);
    }

    if (type === "category") {
      await performDeleteCategory(id);
    }

    if (type === "cinema") {
      await performDeleteCinema(id);
    }
  };

  // Overview
  const analytics = useMemo(() => {
    const confirmedBookings = bookings.filter(
      (booking) => booking.bookingStatus !== "cancelled"
    );
    const trendMap = new Map();

    confirmedBookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const key = Number.isNaN(date.getTime())
        ? "Unknown"
        : date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          });

      const current = trendMap.get(key) || { label: key, bookings: 0, revenue: 0 };

      current.bookings += 1;
      current.revenue += Number(booking.totalPrice || 0);
      trendMap.set(key, current);
    });

    const trends = Array.from(trendMap.values()).slice(-7);
    const maxBookings = Math.max(...trends.map((item) => item.bookings), 1);
    const maxRevenue = Math.max(...trends.map((item) => item.revenue), 1);
    const paid = bookings.filter((booking) => booking.paymentStatus === "paid").length;
    const pending = bookings.filter(
      (booking) => booking.paymentStatus !== "paid" && booking.paymentStatus !== "failed"
    ).length;
    const failed = bookings.filter((booking) => booking.paymentStatus === "failed").length;
    const totalPaymentStates = Math.max(paid + pending + failed, 1);

    return {
      trends,
      maxBookings,
      maxRevenue,
      paymentStates: [
        { label: "Paid", value: paid, width: (paid / totalPaymentStates) * 100 },
        {
          label: "Pending",
          value: pending,
          width: (pending / totalPaymentStates) * 100,
        },
        { label: "Failed", value: failed, width: (failed / totalPaymentStates) * 100 },
      ],
    };
  }, [bookings]);

  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Movies",
            value: movies.length,
            icon: Film,
            color: "text-[#f5c518]",
            bg: "bg-yellow-400/10",
          },
          {
            label: "Total Cinemas",
            value: cinemas.length,
            icon: MapPin,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Active Shows",
            value: shows.length,
            icon: Calendar,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Total Bookings",
            value: bookings.length,
            icon: Ticket,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#121212] p-5 sm:p-8 rounded-[32px] border border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all"
          >
            <div
              className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}
            >
              <stat.icon size={24} />
            </div>

            <div>
              <p className="text-3xl font-black text-white">
                {stat.value}
              </p>

              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#121212] rounded-[32px] border border-white/5 p-5 sm:p-8 xl:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter">
              Booking Trends
            </h2>
            <TrendingUp className="text-[#f5c518]" size={22} />
          </div>

          <div className="h-56 flex items-end gap-3">
            {(analytics.trends.length ? analytics.trends : [{ label: "No Data", bookings: 0 }]).map(
              (item) => (
                <div key={item.label} className="flex-1 min-w-0">
                  <div className="h-44 flex items-end rounded-t-xl overflow-hidden bg-white/5">
                    <div
                      className="w-full bg-[#f5c518] rounded-t-xl"
                      style={{
                        height: `${Math.max(
                          (item.bookings / analytics.maxBookings) * 100,
                          item.bookings ? 12 : 3
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-center text-[10px] text-gray-500 font-black uppercase truncate">
                    {item.label}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-[#121212] rounded-[32px] border border-white/5 p-5 sm:p-8">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-8">
            Booking Analytics
          </h2>

          <div className="space-y-6">
            {analytics.paymentStates.map((state) => (
              <div key={state.label}>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                  <span className="text-gray-400">{state.label}</span>
                  <span className="text-[#f5c518]">{state.value}</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f5c518]"
                    style={{ width: `${state.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#121212] rounded-[32px] border border-white/5 p-5 sm:p-8 xl:col-span-3">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-8">
            Revenue Analytics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {(analytics.trends.length ? analytics.trends : [{ label: "No Data", revenue: 0 }]).map(
              (item) => (
                <div key={item.label} className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black text-[#f5c518]">
                    ₹{item.revenue || 0}
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-black overflow-hidden">
                    <div
                      className="h-full bg-[#f5c518]"
                      style={{
                        width: `${Math.max(
                          ((item.revenue || 0) / analytics.maxRevenue) * 100,
                          item.revenue ? 8 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMovies = () => (
    <MoviesTab
      movies={movies}
      categories={categories}
      onAddClick={openAddMovieModal}
      onEdit={openEditMovieModal}
      onDelete={(movie) =>
        openDeleteConfirmation(
          "movie",
          movie?._id,
          movie?.title
        )
      }
      isLoading={isLoadingData}
      showModal={showMovieModal}
      onCloseModal={closeMovieModal}
      newMovie={newMovie}
      setNewMovie={setNewMovie}
      posterFile={posterFile}
      setPosterFile={setPosterFile}
      onSubmit={handleSaveMovie}
      Modal={Modal}
      isEditing={Boolean(editingMovie)}
    />
  );

  const renderCinemas = () => (
    <CinemasTab
      cinemas={cinemas}
      onAddClick={() => setShowCinemaModal(true)}
      onDelete={(cinema) =>
        openDeleteConfirmation(
          "cinema",
          cinema?._id,
          cinema?.name
        )
      }
      showModal={showCinemaModal}
      onCloseModal={() => setShowCinemaModal(false)}
      newCinema={newCinema}
      setNewCinema={setNewCinema}
      onSubmit={handleAddCinema}
      Modal={Modal}
    />
  );

  const renderShows = () => (
    <ShowsTab
      shows={shows}
      movies={movies}
      screens={screens}
      showModal={showShowModal}
      onAddClick={() => setShowShowModal(true)}
      onCloseModal={() => setShowShowModal(false)}
      newShow={newShow}
      setNewShow={setNewShow}
      onSubmit={handleAddShow}
      Modal={Modal}
    />
  );

  const renderBookings = () => (
    <BookingsTab bookings={bookings} />
  );

  const renderCategories = () => (
    <CategoriesTab
      categories={categories}
      onAddClick={() => setShowCategoryModal(true)}
      onDelete={(category) =>
        openDeleteConfirmation(
          "category",
          category?._id,
          category?.name
        )
      }
    />
  );

  // Category Modal
  const renderCategoryModal = () => (
    <Modal
      isOpen={showCategoryModal}
      onClose={() => setShowCategoryModal(false)}
      title="Add New Category"
    >
      <form
        onSubmit={handleAddCategory}
        className="space-y-6 font-bold"
      >
        <div className="relative">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
            Category Name
          </label>

          <input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                name: e.target.value,
              })
            }
            required
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm"
          />
        </div>

        <div className="relative">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
            Description
          </label>

          <textarea
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                description: e.target.value,
              })
            }
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 text-sm h-24 resize-none"
          />
        </div>

        <button
          type="submit"
          className="btn-fill-gold w-full py-5 uppercase tracking-widest text-[10px] font-black"
        >
          Add Category
        </button>
      </form>
    </Modal>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-heading">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-12 pt-36 md:pt-32">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-normal mb-3">
            Admin <span className="text-[#f5c518]">Dashboard</span>
          </h1>

          <p className="text-gray-500 font-bold">
            Manage your cinema empire from here.
          </p>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          <TabButton
            id="overview"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={BarChart3}
            label="Overview"
          />

          <TabButton
            id="movies"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={Film}
            label="Movies"
          />

          <TabButton
            id="cinemas"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={MapPin}
            label="Cinemas"
          />

          <TabButton
            id="shows"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={Calendar}
            label="Shows"
          />

          <TabButton
            id="bookings"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={Ticket}
            label="Bookings"
          />

          <TabButton
            id="categories"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={Film}
            label="Categories"
          />
        </div>

        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "movies" && renderMovies()}
          {activeTab === "cinemas" && renderCinemas()}
          {activeTab === "shows" && renderShows()}
          {activeTab === "bookings" && renderBookings()}
          {activeTab === "categories" && renderCategories()}
        </div>
      </div>

      {renderCategoryModal()}

      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title={confirmDelete?.title}
        message={confirmDelete?.message}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default AdminDashboard;
