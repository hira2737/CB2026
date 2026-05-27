import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import {
  CheckCircle2,
  Download,
  Share2,
  LayoutDashboard,
} from "lucide-react";
import jsPDF from "jspdf";
import API from "../../config/api";
import toast from "react-hot-toast";
import ticketTemplate from "./tickets/CineBook_Ticket.png";

const ADMIT_WORDS = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
};

const loadTicketImage = () =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = ticketTemplate;
  });

const fitText = (pdf, text, maxWidth, fontSize) => {
  pdf.setFontSize(fontSize);

  let value = String(text || "-");

  while (pdf.getTextWidth(value) > maxWidth && value.length > 3) {
    value = `${value.slice(0, -4)}...`;
  }

  return value;
};

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId && !tran_id) {
          setBooking(null);
          return;
        }

        const { data } = bookingId
          ? await API.get(`/bookings/${bookingId}`)
          : await API.get(`/bookings/transaction/${tran_id}`);

        setBooking(data.booking || data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, tran_id]);

  // ============================================
  // DOWNLOAD PDF TICKET
  // ============================================

  const handleDownload = async () => {
    if (!booking) return;

    try {
      const pdf = new jsPDF("landscape", "mm", [85, 170]);
      const templateImage = await loadTicketImage();

      pdf.addImage(templateImage, "PNG", 0, 0, 170, 85);

      // ============================================
      // LEFT SECTION
      // ============================================

      const seatCount = booking?.seats?.length || 1;
      const admitLabel = `Admit ${ADMIT_WORDS[seatCount] || seatCount}`;

      pdf.setTextColor(245, 197, 24);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(admitLabel, 9, 72, {
        angle: 90,
      });

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(
        fitText(pdf, booking?.transactionId || "TXN", 48, 7),
        38,
        72,
        { angle: 90 }
      );

      pdf.setFillColor(255, 255, 255);

      let y = 18;

      for (let i = 0; i < 24; i++) {
        const height = i % 3 === 0 ? 1.7 : 0.9;
        pdf.rect(22, y, 9, height, "F");
        y += 2.1;
      }

      // ============================================
      // RIGHT SECTION
      // ============================================

      const showDate = new Date(booking?.show?.startTime);
      const cinema = booking?.show?.screen?.cinema;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text("CINE", 52, 18);

      pdf.setTextColor(245, 197, 24);
      pdf.text("BOOK", 52 + pdf.getTextWidth("CINE"), 18);

      pdf.setFontSize(18);
      pdf.text(
        fitText(pdf, booking?.show?.movie?.title || "Movie", 92, 18),
        52,
        31
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);

      pdf.text(
        `Date: ${showDate.toLocaleDateString("en-IN")}`,
        52,
        43
      );

      pdf.text(
        `Time: ${showDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        112,
        43
      );

      pdf.text(
        fitText(pdf, `Cinema: ${cinema?.name || "Cinema"}`, 105, 10),
        52,
        54
      );

      pdf.text(
        fitText(pdf, `Location: ${cinema?.address || "Chennai"}`, 105, 10),
        52,
        62
      );

      pdf.text(
        fitText(
          pdf,
          `Screen: ${booking?.show?.screen?.name || "Screen 1"}`,
          48,
          10
        ),
        52,
        70
      );

      pdf.text(
        fitText(pdf, `Seats: ${booking?.seats?.join(", ") || "-"}`, 58, 10),
        102,
        70
      );

      pdf.save(
        `CineBook-Ticket-${booking?.transactionId}.pdf`
      );

      toast.success("Ticket downloaded!");
    } catch (error) {
      console.error(error);

      toast.error("Failed to download ticket");
    }
  };

  // ============================================
  // SHARE
  // ============================================

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "CineBook Ticket",
          text: `I booked ${
            booking?.show?.movie?.title || "a movie"
          } on CineBook!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        toast.success("Link copied!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ============================================
  // NOT FOUND
  // ============================================

  if (!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4">
          Booking Not Found
        </h1>

        <Link
          to="/"
          className="text-yellow-500 hover:text-yellow-400"
        >
          Go Home
        </Link>
      </div>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

  const showDate = new Date(
    booking?.show?.startTime
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex flex-col items-center justify-center py-28 sm:py-24 px-4 sm:px-6">
        {/* Success Icon */}

        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2
              size={48}
              className="text-yellow-500"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-center mb-4">
            Booking Confirmed
          </h1>

          <p className="text-gray-400 text-center">
            Your movie ticket has been booked
            successfully.
          </p>
        </div>

        {/* Ticket Card */}

        <div className="w-full max-w-2xl bg-[#111111] border border-yellow-500/20 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}

          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-5 sm:px-8 py-6 text-black">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase">
                  CINEBOOK Ticket
                </p>

                <h2 className="text-2xl sm:text-3xl font-black mt-1 break-words">
                  {booking?.show?.movie?.title}
                </h2>
              </div>

              <div className="min-w-0 sm:text-right">
                <p className="text-xs font-semibold">
                  Transaction ID
                </p>

                <p className="font-black break-all">
                  {booking?.transactionId}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}

          <div className="p-5 sm:p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-400">
                  Cinema
                </p>

                <p className="font-bold text-lg break-words">
                  {
                    booking?.show?.screen?.cinema
                      ?.name
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Address
                </p>

                <p className="break-words">
                  {
                    booking?.show?.screen?.cinema
                      ?.address
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Seats
                </p>

                <p className="font-bold text-yellow-500">
                  {booking?.seats?.join(", ")}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-400">
                  Date
                </p>

                <p className="font-bold">
                  {showDate.toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Time
                </p>

                <p className="font-bold">
                  {showDate.toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Amount Paid
                </p>

                <p className="font-bold text-yellow-500 text-xl">
                  ₹ {booking?.totalPrice}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Status
                </p>

                <p className="text-green-500 font-bold">
                  Confirmed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}

        <div className="mt-10 flex w-full flex-wrap justify-center gap-5">
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition sm:w-auto"
          >
            <Download size={18} />
            Download Ticket
          </button>

          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition sm:w-auto"
          >
            <Share2 size={18} />
            Share
          </button>

          <Link
            to="/bookings"
            className="flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition sm:w-auto"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
