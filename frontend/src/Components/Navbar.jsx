import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Film, Search, User, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isActive = (paths) => paths.includes(location.pathname);
  const navClass = (active) =>
    `text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer ${
      active ? "text-[#f5c518]" : "text-gray-400 hover:text-[#f5c518]"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 min-h-20 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#f5c518] p-1.5 rounded-lg">
            <Film size={24} className="text-black" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            CINE<span className="text-[#f5c518]">BOOK</span>
          </span>
        </Link>

        {/* Centered Navigation */}
        <div className="order-3 flex w-full items-center justify-center gap-6 overflow-x-auto border-t border-white/5 pt-3 md:order-none md:w-auto md:border-t-0 md:pt-0 md:gap-10">
          <button
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={navClass(isActive(["/"]))}
          >
            Home
          </button>
          <button
            onClick={() => {
              if (location.pathname !== "/" && location.pathname !== "/movies") {
                navigate("/movies");
              } else {
                document
                  .getElementById("search-movies-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={navClass(isActive(["/movies"]))}
          >
            Movies
          </button>
          {user && user.role !== "admin" && (
            <Link
              to="/bookings"
              className={navClass(isActive(["/bookings", "/dashboard"]))}
            >
              My Bookings
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const searchInput = e.target.elements.search.value;
              if (searchInput.trim()) {
                navigate(`/?search=${searchInput}`);
              }
            }}
            className="relative hidden md:block group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className="text-gray-500 group-focus-within:text-[#f5c518] transition-colors duration-300"
                size={16}
              />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search movies..."
              className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm outline-none focus:border-[#f5c518]/50 focus:bg-white/10 focus:shadow-[0_0_15px_-3px_rgba(245,197,24,0.3)] transition-all duration-300 w-64 placeholder:text-gray-600 text-gray-300 font-medium tracking-wide"
            />
          </form>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="btn-outline-gold !py-1.5 !px-4 text-[10px] tracking-widest"
                >
                  ADMIN
                </Link>
              )}
              {user.role !== "admin" && (
              <Link
                to="/bookings"
                className="btn-fill-gold !py-1.5 !px-4 text-[10px] tracking-widest flex items-center gap-2"
              >
                  <User size={14} /> ACCOUNT
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn-outline-gold !py-1.5 !px-4 text-[10px] tracking-widest"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="btn-fill-gold !py-1.5 !px-4 text-[10px] tracking-widest"
              >
                JOIN
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
