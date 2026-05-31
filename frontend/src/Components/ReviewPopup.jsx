import React, { useEffect, useState } from "react";
import { CheckCircle2, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "../config/api";

const ReviewPopup = ({ bookingId, isOpen, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  const submitReview = async () => {
    if (!bookingId || loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    try {
      setLoading(true);

      await API.post("/reviews", {
        bookingId,
        rating,
        comment: comment.trim(),
      });

      setSubmitted(true);
      toast.success("Review submitted");
      onSubmitted?.();

      setTimeout(() => {
        onClose?.();
      }, 1200);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-md max-h-[calc(100svh-3rem)] overflow-y-auto rounded-[28px] border border-[#f5c518]/25 bg-[#121212] p-5 text-white shadow-2xl shadow-black/60 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-2 text-gray-400 transition hover:border-[#f5c518]/50 hover:text-[#f5c518]"
          aria-label="Close review popup"
        >
          <X size={18} />
        </button>

        <div className="pr-10">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#f5c518]">
            CineBook
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tighter sm:text-3xl">
            Rate Your Experience
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-gray-400">
            Your review helps improve future movie nights.
          </p>
        </div>

        <div className="mt-7 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= rating;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`rounded-2xl border p-3 transition active:scale-95 ${
                  active
                    ? "border-[#f5c518]/60 bg-[#f5c518]/15 text-[#f5c518]"
                    : "border-white/10 bg-white/5 text-gray-600 hover:border-[#f5c518]/40 hover:text-[#f5c518]"
                }`}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={22}
                  className={active ? "fill-[#f5c518]" : ""}
                />
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="Write a review (optional)"
          value={comment}
          maxLength={500}
          onChange={(e) => setComment(e.target.value)}
          className="mt-6 h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm font-medium text-white outline-none transition placeholder:text-gray-600 focus:border-[#f5c518]/60"
        />

        <div className="mt-2 text-right text-[10px] font-bold uppercase tracking-widest text-gray-600">
          {comment.length}/500
        </div>

        {submitted ? (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-[#f5c518]/30 bg-[#f5c518]/10 px-4 py-3 text-sm font-black uppercase tracking-widest text-[#f5c518]">
            <CheckCircle2 size={18} />
            Thanks for your feedback
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={submitReview}
              disabled={loading}
              className="rounded-2xl bg-[#f5c518] px-5 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-[#ffe066] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPopup;
