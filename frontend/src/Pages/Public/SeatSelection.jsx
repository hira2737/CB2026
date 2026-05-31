import React, { useState, useEffect, useRef } from "react";

import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import API from "../../config/api";

import {
  MapPin,
  Monitor,
  Sofa,
  Ticket,
} from "lucide-react";

import Navbar from "../../Components/Navbar";

const SEAT_LAYOUT = [
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

const getRequestedSeatCount = (locationStateCount, queryCount) => {
  const parsedCount = Number(locationStateCount ?? queryCount);

  if (!Number.isFinite(parsedCount)) return 1;

  return Math.min(Math.max(Math.floor(parsedCount), 1), 10);
};

const SeatSelection = () => {
  const { showId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams] = useSearchParams();

  const requestedSeats = getRequestedSeatCount(
    location.state?.requestedSeats,
    searchParams.get("count")
  );

  const [show, setShow] = useState(null);

  const [selectedSeats, setSelectedSeats] =
    useState([]);

  const [bookedSeats, setBookedSeats] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const lockIdRef = useRef(null);

  // FETCH SHOW
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showRes, bookedRes] =
          await Promise.all([
            API.get(`/shows/${showId}`),

            API.get(
              `/bookings/booked-seats/${showId}`
            ),
          ]);

        setShow(showRes.data);

        setBookedSeats(bookedRes.data || []);
      } catch (err) {
        console.error(err);

        toast.error("Failed to load show");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // LIVE REFRESH
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await API.get(
          `/bookings/booked-seats/${showId}`
        );

        setBookedSeats(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [showId]);

  useEffect(() => {
    setSelectedSeats((currentSeats) => {
      const availableSelection = currentSeats.filter(
        (seat) => !bookedSeats.includes(seat)
      );

      if (availableSelection.length !== currentSeats.length) {
        toast.error("Some selected seats are no longer available");
        return availableSelection;
      }

      return currentSeats;
    });
  }, [bookedSeats]);

  // AUTO SELECT SEATS TO THE RIGHT ONLY
  const handleSeatClick = (clickedSeat, rowSeats) => {
    if (bookedSeats.includes(clickedSeat)) {
      return;
    }

    const startIndex = rowSeats.indexOf(clickedSeat);
    const autoSelected = [];

    for (let i = startIndex; i < rowSeats.length; i++) {
      const currentSeat = rowSeats[i];

      if (bookedSeats.includes(currentSeat)) {
        continue;
      }

      autoSelected.push(currentSeat);

      if (autoSelected.length === requestedSeats) {
        break;
      }
    }

    if (autoSelected.length !== requestedSeats) {
      toast.error(`Unable to find ${requestedSeats} available seats to the right`);
      return;
    }

    setSelectedSeats(autoSelected);
  };

  // LOAD RAZORPAY
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay)
        return resolve(true);

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);
    });

  // GET SEAT PRICE
  const getSeatPrice = (seat) => {
    const row = seat[0];

    for (const section of SEAT_LAYOUT) {
      if (section.rows.includes(row)) {
        return section.price;
      }
    }

    return 0;
  };

  // TOTAL PRICE
  const calculateTotal = () => {
    return selectedSeats.reduce(
      (total, seat) =>
        total + getSeatPrice(seat),
      0
    );
  };

  // PAYMENT FLOW
  const handleProceed = async () => {
    if (isProcessing) return;

    if (!selectedSeats.length) {
      return toast.error(
        "Select seats"
      );
    }

    const totalAmount =
      calculateTotal();

    if (
      !totalAmount ||
      Number.isNaN(totalAmount)
    ) {
      return toast.error(
        "Invalid ticket amount"
      );
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error("Please login");

      return navigate("/login");
    }

    setIsProcessing(true);

    const toastId = toast.loading(
      "Creating payment..."
    );

    try {
      // LOCK SEATS
      const lockRes = await API.post(
        "/bookings/lock",
        {
          showId,
          seats: selectedSeats,
        }
      );

      lockIdRef.current =
        lockRes.data?.lockId;

      // CREATE ORDER
      const { data } = await API.post(
        "/bookings/create-order",
        {
          showId,

          seats: selectedSeats,

          totalPrice: totalAmount,

          movieTitle:
            show?.movie?.title,
        }
      );

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Failed to load Razorpay"
        );
      }

      toast.dismiss(toastId);

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency: data.currency,

        order_id: data.orderId,

        name: "CineBook",

        description:
          "Movie Ticket Booking",

        method: {
          netbanking: true,
          card: false,
          wallet: false,
          upi: false,
          paylater: false,
          emi: false,
        },

        config: {
          display: {
            blocks: {
              netbanking: {
                name: "Net Banking",
                instruments: [
                  {
                    method: "netbanking",
                  },
                ],
              },
            },
            sequence: ["block.netbanking"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        theme: {
          color: "#f5c518",
        },

        handler: async function (
          response
        ) {
          try {
            const verifyRes =
              await API.post(
                "/bookings/verify-payment",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  transactionId:
                    data.transactionId,
                }
              );

            toast.success(
              "Payment Successful"
            );

            navigate(
              verifyRes.data.bookingId
                ? `/booking/success/${verifyRes.data.bookingId}`
                : `/booking/success?tran_id=${verifyRes.data.transactionId}`
            );
          } catch (err) {
            console.error(err);

            toast.error(
              "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp =
        new window.Razorpay(options);

      rzp.open();
    } catch (err) {
      console.error(err);

      toast.dismiss(toastId);

      toast.error(
        err.response?.data?.message ||
          "Booking failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitBill = async () => {
    if (isProcessing) return;

    if (selectedSeats.length < 2) {
      return toast.error("Select at least 2 seats.");
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first.");
      return navigate("/login");
    }

    setIsProcessing(true);

    const toastId = toast.loading(
      "Creating group room..."
    );

    try {
      await API.post("/bookings/lock", {
        showId,
        seats: selectedSeats,
      });

      const { data } = await API.post(
        "/group/create",
        {
          showId,
          seats: selectedSeats,
        }
      );

      toast.success("Group room created!", {
        id: toastId,
      });

      navigate(`/group/${data.roomCode}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create room.",
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading seats...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 md:pt-32 pb-20">

        {/* TOP */}
        <div className="mb-10">

          <h1 className="text-3xl sm:text-4xl font-black mb-2 break-words">
            {show?.movie?.title}
          </h1>

          <div className="flex min-w-0 items-center gap-2 text-gray-400">
            <MapPin size={16} className="shrink-0" />

            <span className="min-w-0 break-words">{
              show?.screen?.cinema
                ?.name
            }</span>
          </div>

          <p className="mt-4 text-[#f5c518] font-bold tracking-widest uppercase text-sm">
            {requestedSeats} Seats
            Selected
          </p>
        </div>

        {/* SCREEN */}
        <div className="mb-16">

          <div className="w-full h-24 bg-gradient-to-b from-[#f5c518]/40 to-transparent rounded-t-full flex items-start justify-center pt-3">

            <div className="flex items-center gap-2 text-[#f5c518] font-bold tracking-[0.3em] text-xs uppercase">

              <Monitor size={16} />

              Screen This Way
            </div>
          </div>
        </div>

        {/* SEATS */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[860px] space-y-12 lg:min-w-0">

          {SEAT_LAYOUT.map(
            (section) => (
              <div
                key={
                  section.category
                }
              >
                {/* CATEGORY */}
                <div className="flex items-center justify-between mb-5">

                  <h2 className="text-xl font-black tracking-wider text-[#f5c518]">
                    {
                      section.category
                    }
                  </h2>

                  <p className="text-sm text-gray-400">
                    ₹{section.price}
                  </p>
                </div>

                {/* ROWS */}
                <div className="space-y-4">

                  {section.rows.map(
                    (row) => {
                      const seats =
                        Array.from(
                          {
                            length:
                              section.seatsPerRow,
                          },
                          (_, i) =>
                            `${row}${i + 1}`
                        );

                      return (
                        <div
                          key={row}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="w-6 text-gray-500 font-bold">
                            {row}
                          </span>

                          <div className="flex gap-2 justify-center">

                            {seats.map(
                              (
                                seat,
                                index
                              ) => {
                                const isBooked =
                                  bookedSeats.includes(
                                    seat
                                  );

                                const isSelected =
                                  selectedSeats.includes(
                                    seat
                                  );

                                return (
                                  <React.Fragment
                                    key={
                                      seat
                                    }
                                  >
                                    {index ===
                                      Math.floor(
                                        section.seatsPerRow /
                                          2
                                      ) && (
                                      <div className="w-8" />
                                    )}

                                    <button
                                      disabled={
                                        isBooked
                                      }
                                      onClick={() =>
                                        handleSeatClick(
                                          seat,
                                          seats
                                        )
                                      }
                                      className={`
                                      w-9 h-9 rounded-t-xl rounded-b-md flex items-center justify-center transition-all duration-200 border

                                      ${
                                        isBooked
                                          ? "bg-gray-700 border-gray-700 opacity-40 cursor-not-allowed"
                                          : isSelected
                                          ? "bg-[#f5c518] border-[#f5c518] text-black scale-110 shadow-[0_0_20px_rgba(245,197,24,0.5)]"
                                          : "bg-[#1a1a1a] border-[#f5c518]/20 text-[#f5c518] hover:bg-[#f5c518]/20 hover:border-[#f5c518]"
                                      }
                                    `}
                                    >
                                      <Sofa size={14} />
                                    </button>
                                  </React.Fragment>
                                );
                              }
                            )}
                          </div>

                          <span className="w-6 text-gray-500 font-bold">
                            {row}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm">

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1a1a1a] border border-[#f5c518]/20" />
            Available
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#f5c518]" />
            Selected
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-700" />
            Sold
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-14 max-w-xl mx-auto bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-8">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl sm:text-2xl font-black">
              Booking Summary
            </h2>

            <Ticket className="text-[#f5c518]" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">

            {selectedSeats.map(
              (seat) => (
                <span
                  key={seat}
                  className="px-3 py-1 rounded-lg bg-[#f5c518] text-black font-bold text-sm"
                >
                  {seat}
                </span>
              )
            )}
          </div>

          <div className="flex items-center justify-between mb-6">

            <span className="text-gray-400">
              Total
            </span>

            <span className="text-2xl sm:text-3xl font-black text-[#f5c518]">
              ₹{calculateTotal()}
            </span>
          </div>

          <button
            onClick={handleProceed}
            disabled={
              !selectedSeats.length ||
              isProcessing
            }
            className="w-full bg-[#f5c518] text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {isProcessing
              ? "Processing..."
              : "Proceed To Payment"}
          </button>

          {selectedSeats.length >= 2 && (
            <button
              type="button"
              onClick={handleSplitBill}
              disabled={isProcessing}
              className="w-full mt-3 py-4 flex items-center justify-center gap-3 rounded-2xl border border-[#f5c518]/40 text-[#f5c518] hover:bg-[#f5c518]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-black tracking-[0.3em]">
                SPLIT WITH FRIENDS
              </span>
            </button>
          )}

          <p className="text-center text-xs text-gray-500 mt-5 tracking-wider uppercase">
            Tickets once booked are
            non-cancellable
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
