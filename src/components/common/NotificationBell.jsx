import { useState, useEffect, useRef } from "react";  
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import EmptyState from "./EmptyState";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button className="notification-bell" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true" aria-label="Notifications">
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>

            <button onClick={markAllAsRead} aria-label="Mark all notifications as read">
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              compact={true}
              icon={Bell}
              title="No notifications yet"
              description="We'll let you know when we have updates for you."
            />
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${
                  item.read ? "" : "unread"
                }`}
              >
                <h5>{item.title}</h5>
                <p>{item.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;