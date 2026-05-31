import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import Navbar from "../../Components/Navbar";
import API from "../../config/api";

const formatTimer = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
};

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const statusClass = (status) => {
  if (status === "paid") {
    return "border-[#f5c518]/60 bg-[#f5c518] text-black";
  }

  if (status === "pending") {
    return "border-[#f5c518]/40 bg-[#f5c518]/15 text-[#f5c518]";
  }

  return "border-white/10 bg-white/5 text-gray-400";
};

const GroupRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const releaseCalledRef = useRef(false);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paying, setPaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fetchRoom = useCallback(
    async (quiet = false) => {
      try {
        const { data } = await API.get(`/group/${roomCode}`);
        setRoom(data.room);
        setSecondsLeft(data.room?.secondsLeft || 0);
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("Room expired or not found");
          navigate("/");
          return;
        }

        if (!quiet) {
          toast.error("Failed to load group room");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate, roomCode]
  );

  useEffect(() => {
    fetchRoom();

    const interval = setInterval(() => {
      fetchRoom(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRoom]);

  useEffect(() => {
    if (!room?.expiresAt) return undefined;

    const interval = setInterval(() => {
      const nextSeconds = Math.max(
        0,
        Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000)
      );

      setSecondsLeft(nextSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.expiresAt]);

  useEffect(() => {
    if (secondsLeft !== 0 || !room || releaseCalledRef.current) return;

    releaseCalledRef.current = true;

    API.post(`/group/${roomCode}/release`).catch(() => {});
  }, [room, roomCode, secondsLeft]);

  const mySeats = useMemo(
    () =>
      room?.seatMap
        ?.filter((seat) => seat.isYours)
        .map((seat) => seat.seat) || [],
    [room]
  );

  const myPaymentStatus = useMemo(() => {
    const mySeat = room?.seatMap?.find((seat) => seat.isYours);
    return mySeat?.paymentStatus || "unclaimed";
  }, [room]);

  const hasClaimed = mySeats.length > 0;
  const isExpired = secondsLeft === 0;
  const shareUrl = `${window.location.origin}/group/${roomCode}`;

  const showDate = room?.showId?.startTime
    ? new Date(room.showId.startTime)
    : null;

  const toggleSeat = (seat) => {
    if (hasClaimed || isExpired) return;

    setSelectedSeats((currentSeats) =>
      currentSeats.includes(seat)
        ? currentSeats.filter((item) => item !== seat)
        : [...currentSeats, seat]
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Room link copied");
    } catch (error) {
      toast.error("Could not copy link");
    }
  };

  const claimSeats = async () => {
    if (!selectedSeats.length) {
      toast.error("Select seats to claim");
      return;
    }

    const toastId = toast.loading("Claiming seats...");

    try {
      await API.post(`/group/${roomCode}/claim`, {
        seats: selectedSeats,
      });

      toast.success("Seats claimed", { id: toastId });
      setSelectedSeats([]);
      await fetchRoom(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to claim seats",
        { id: toastId }
      );
    }
  };

  const payForSeats = async () => {
    if (paying || !hasClaimed) return;

    setPaying(true);
    const toastId = toast.loading("Creating group payment...");

    try {
      const { data } = await API.post(`/group/${roomCode}/pay`);
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error("Failed to load Razorpay");
      }

      toast.dismiss(toastId);

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "CineBook Group Booking",
        description: `Seats ${data.seats?.join(", ")}`,
        theme: {
          color: "#f5c518",
        },
        handler: async (response) => {
          try {
            const verifyRes = await API.post(
              `/group/${roomCode}/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: data.transactionId,
              }
            );

            toast.success("Payment successful");
            navigate(`/booking/success/${verifyRes.data.bookingId}`);
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.error("Payment cancelled");
          },
        },
      });

      rzp.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to start payment",
        { id: toastId }
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#f5c518] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto max-w-screen-2xl px-5 pb-24 pt-36 sm:px-8 lg:px-12">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#121212] p-5 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#f5c518]">
                  Group Room
                </p>
                <h1 className="mt-3 break-words text-3xl font-black uppercase tracking-tighter sm:text-5xl">
                  {room.showId?.movie?.title || "CineBook Show"}
                </h1>
                <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-2">
                    <Ticket size={16} className="text-[#f5c518]" />
                    Room {room.roomCode}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#f5c518]" />
                    {room.showId?.screen?.cinema?.name || "Cinema"}
                  </span>
                  {showDate && (
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#f5c518]" />
                      {showDate.toLocaleDateString("en-IN")}{" "}
                      {showDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`rounded-3xl border px-6 py-5 text-center ${
                  isExpired
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                    : secondsLeft < 120
                    ? "animate-pulse border-[#f5c518]/60 bg-[#f5c518]/15 text-[#f5c518]"
                    : "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518]"
                }`}
              >
                <Clock size={20} className="mx-auto mb-2" />
                <p className="text-3xl font-black tabular-nums">
                  {formatTimer(secondsLeft)}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest">
                  Time Left
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-3 sm:flex sm:items-center sm:gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-gray-400">
                {shareUrl}
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5c518] px-4 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-[#ffe066] sm:mt-0 sm:w-auto"
              >
                <Copy size={15} />
                Copy Link
              </button>
            </div>

            {isExpired && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm font-bold">
                  This group room has expired. Please start a fresh seat selection.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#121212] p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#f5c518]/10 p-3 text-[#f5c518]">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  Your Seats
                </h2>
                <p className="text-sm font-bold text-gray-500">
                  Rs.{room.pricePerSeat} per seat
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(hasClaimed ? mySeats : selectedSeats).map((seat) => (
                <span
                  key={seat}
                  className="rounded-xl bg-[#f5c518] px-3 py-1 text-sm font-black text-black"
                >
                  {seat}
                </span>
              ))}
              {!hasClaimed && !selectedSeats.length && (
                <p className="text-sm font-bold text-gray-500">
                  Select your seats from the room map.
                </p>
              )}
            </div>

            {!hasClaimed && (
              <button
                type="button"
                onClick={claimSeats}
                disabled={isExpired || !selectedSeats.length}
                className="mt-6 w-full rounded-2xl bg-[#f5c518] px-5 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-[#ffe066] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Claim Selected Seats
              </button>
            )}

            {hasClaimed && myPaymentStatus !== "paid" && (
              <button
                type="button"
                onClick={payForSeats}
                disabled={isExpired || paying}
                className="mt-6 w-full rounded-2xl bg-[#f5c518] px-5 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-[#ffe066] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying ? "Processing..." : "Pay For My Seats"}
              </button>
            )}

            {hasClaimed && myPaymentStatus === "paid" && (
              <div className="mt-6 rounded-2xl border border-[#f5c518]/30 bg-[#f5c518]/10 p-4 text-[#f5c518]">
                <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                  <CheckCircle2 size={18} />
                  Payment Confirmed
                </div>
                <Link
                  to="/bookings"
                  className="mt-3 inline-block text-sm font-bold underline"
                >
                  View dashboard
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#121212] p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Seat Map
              </h2>
              <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border border-white/20 bg-white/5" />
                  Available
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f5c518]/40" />
                  Claimed
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f5c518]" />
                  Paid
                </span>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto pb-4">
              <div className="grid min-w-[520px] grid-cols-6 gap-3 sm:min-w-0 sm:grid-cols-8 lg:grid-cols-10">
                {room.seatMap?.map((item) => {
                  const selected = selectedSeats.includes(item.seat);
                  const disabled =
                    isExpired ||
                    hasClaimed ||
                    (item.paymentStatus !== "unclaimed" && !item.isYours);

                  return (
                    <button
                      key={item.seat}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleSeat(item.seat)}
                      className={`relative h-14 rounded-t-2xl rounded-b-lg border text-xs font-black transition active:scale-95 disabled:cursor-not-allowed ${statusClass(
                        item.paymentStatus
                      )} ${
                        selected
                          ? "ring-2 ring-[#f5c518] ring-offset-2 ring-offset-black"
                          : ""
                      }`}
                    >
                      {item.claimedBy && !item.isYours && (
                        <span className="absolute -top-5 left-1/2 max-w-[72px] -translate-x-1/2 truncate text-[9px] text-[#f5c518]">
                          {item.claimedBy}
                        </span>
                      )}
                      {item.seat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#121212] p-5 sm:p-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Members
            </h2>

            <div className="mt-6 space-y-4">
              {room.members?.length ? (
                room.members.map((member, index) => (
                  <div
                    key={`${member.userName}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-black">
                        {member.userName || "Friend"}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          member.paymentStatus === "paid"
                            ? "bg-[#f5c518] text-black"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {member.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-gray-500">
                      Seats: {member.claimedSeats?.join(", ") || "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm font-bold text-gray-600">
                  No seats claimed yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GroupRoom;
