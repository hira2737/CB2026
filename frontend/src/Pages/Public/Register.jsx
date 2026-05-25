import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import API from "../../config/api";
import Navbar from "../../Components/Navbar";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating account...");
    try {
      await API.post("/auth/register", formData);
      toast.success("Account created successfully! Please login.", {
        id: loadingToast,
      });
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      <Navbar />

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-50 contrast-125 scale-110 animate-pulse-slow"
          alt="Cinema"
        />

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full animate-float"></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f5c518]/10 blur-[150px] rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="bg-[#121212] p-12 rounded-[40px] shadow-2xl border border-white/5 relative overflow-hidden"
          >
            <div className="text-center mb-10">
              <span className="text-[#f5c518] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                Membership
              </span>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                Join <span className="text-[#f5c518]">CINEBOOK</span>
              </h2>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                Create your identity
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 text-center">
                {error}
              </div>
            )}

            <div className="space-y-8">
              <div className="relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold placeholder:text-gray-700"
                  placeholder="Your Name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold placeholder:text-gray-700"
                  placeholder="name@example.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest absolute -top-2.5 left-5 bg-[#121212] px-2 z-10">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#f5c518]/50 transition-all font-bold placeholder:text-gray-700"
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-fill-gold w-full py-5 text-sm uppercase tracking-widest font-black shadow-2xl shadow-[#f5c518]/10 active:scale-95 transition-all"
              >
                Join the Cinematic Fold
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Already a member?{" "}
                <Link
                  to="/login"
                  className="text-[#f5c518] hover:underline ml-2"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
