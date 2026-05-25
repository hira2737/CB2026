import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../../config/api";
import Navbar from "../../Components/Navbar";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ticket,
  MapPin,
  ChevronRight,
} from "lucide-react";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get("/bookings/history");
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast.error("Failed to load booking history");
      }
    };
    fetchBookings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating profile...");
    try {
      const { data } = await API.put("/auth/profile", editData);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsEditing(false);
      setError("");
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto px-12 pt-32 pb-24 flex flex-col lg:flex-row gap-12">
        {/* Left Sidebar - Profile */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="bg-[#1a1a1a] rounded-[40px] p-10 border border-white/10 lg:sticky lg:top-32 relative overflow-hidden">
            {!isEditing ? (
              <>
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-32 h-32 bg-[#f5c518] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-[#f5c518]/20">
                    <User size={64} className="text-black" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    {user.name}
                  </h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Member since{" "}
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )}
                  </p>
                </div>

                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-[#f5c518] transition-colors">
                      <Mail size={18} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline-gold w-full mt-12 py-4 uppercase tracking-[0.2em] text-[10px] font-black"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form
                onSubmit={handleUpdateProfile}
                className="animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[#f5c518] mb-2">
                    Edit Profile
                  </h3>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    Update your identity
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <button
                    type="submit"
                    className="btn-fill-gold w-full py-4 uppercase tracking-[0.2em] text-[10px] font-black"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="w-full py-4 text-gray-500 hover:text-white uppercase tracking-[0.2em] text-[10px] font-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>

        {/* Right Content - My Bookings */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              My <span className="text-[#f5c518]">Bookings</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              {bookings.length} bookings
            </p>
          </div>

          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="group bg-[#1a1a1a] rounded-[40px] p-8 border border-white/10 hover:border-[#f5c518]/30 transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden active:scale-[0.99]"
              >
                {/* Poster on Card */}
                <div className="w-full md:w-32 h-44 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={
                      booking.show?.movie?.posterUrl ||
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-[#f5c518] transition-colors mb-1 truncate max-w-sm">
                          {booking.show?.movie?.title}
                        </h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                          {booking.show?.movie?.genre?.join(" • ")}
                        </p>
                      </div>
                      <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20 shrink-0">
                        Confirmed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[#f5c518]" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Date & Time
                          </p>
                          <p className="text-sm font-black text-gray-200">
                            {new Date(
                              booking.show?.startTime
                            ).toLocaleDateString()}{" "}
                            <span className="text-[#f5c518]">
                              {new Date(
                                booking.show?.startTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-[#f5c518]" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Cinema
                          </p>
                          <p className="text-sm font-black text-gray-200">
                            {booking.show?.screen?.cinema?.name ||
                              "CinePlex Grand"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Ticket size={16} className="text-[#f5c518]" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Seats
                          </p>
                          <p className="text-sm font-black text-gray-200">
                            {booking.seats?.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                    <p className="text-2xl font-black text-[#f5c518]">
                      BDT {booking.totalPrice?.toFixed(2)}
                    </p>
                    <ChevronRight
                      size={24}
                      className="text-gray-700 group-hover:text-[#f5c518] group-hover:translate-x-2 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="bg-[#1a1a1a] rounded-[40px] p-20 text-center border border-white/10 border-dashed">
                <Ticket size={64} className="text-gray-800 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-600 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-700 font-bold uppercase tracking-widest text-[10px]">
                  Time to start your cinematic journey!
                </p>
                <Link
                  to="/"
                  className="btn-fill-gold inline-block mt-10 !px-12 text-sm"
                >
                  Discover Movies
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
