import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import API from "../../config/api";
import Navbar from "../../Components/Navbar";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Signing in...");
    try {
      const { data } = await API.post("/auth/login", formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`, { id: loadingToast });
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
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
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-50 contrast-125 scale-110 animate-pulse-slow"
          alt="Cinema"
        />

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[150px] rounded-full animate-float"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f5c518]/10 blur-[150px] rounded-full animate-float"
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
                Access Portal
              </span>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                Welcome <span className="text-[#f5c518]">Back</span>
              </h2>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                Continue your journey
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
                Sign In
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                New to CINEBOOK?{" "}
                <Link
                  to="/register"
                  className="text-[#f5c518] hover:underline ml-2"
                >
                  Join the Membership
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
