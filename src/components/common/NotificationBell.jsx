import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="notification-wrapper">
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
      >
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

            <button onClick={markAllAsRead} aria-label="button">
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="empty-text">
              No notifications yet
            </p>
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