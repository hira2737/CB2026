import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

// ── Time ago helper ────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Notification type icon map ────────────────────────────────────────────────
const typeLabel = (type) => {
  const map = {
    login:   "👤",
    booking: "🎟",
    payment: "💳",
    system:  "🔔",
  };
  return map[type] || "🔔";
};

// ─────────────────────────────────────────────────────────────────────────────
const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await API.get("/notifications");
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent — never break UI if notifications fail
    }
  }, []);

  // Fetch on mount + poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Mark all read ────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  // ── Mark one read ────────────────────────────────────────────────────────
  const handleMarkOne = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkOne(notification._id);
    }

    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center p-2 text-gray-400 hover:text-[#f5c518] transition-colors rounded-full"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f5c518] px-1 text-[9px] font-black text-black leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-[9990] w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/70">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold uppercase tracking-widest text-[#f5c518] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Bell size={28} className="mb-3 text-gray-700" />
                <p className="text-xs text-gray-600">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                    !n.isRead ? "bg-[#f5c518]/5" : ""
                  }`}
                >
                  <span className="mt-0.5 shrink-0 rounded-full border border-[#f5c518]/20 px-2 py-1 text-[8px] font-black tracking-widest text-[#f5c518]">
                    {typeLabel(n.type)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-white break-words">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-600">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f5c518]" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/10 px-4 py-2.5 text-center">
              <p className="text-[10px] text-gray-700">
                Showing latest {Math.min(notifications.length, 20)} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
