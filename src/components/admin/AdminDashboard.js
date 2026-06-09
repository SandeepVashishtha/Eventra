import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Navigate, useLocation, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Activity,
  Shield,
  LogOut,
  Plus,
  Search,
  ChevronRight,
  BarChart2,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingUp,
  Download,
  ChevronDown,
  QrCode,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import {
  AdminListCardSkeleton,
  AdminStatCardSkeleton,
  AdminTableSkeleton,
} from "../common/SkeletonLoaders";
import StatusBadge from "../common/StatusBadge";
import "./AdminDashboard.css";
import AnalyticsDashboard from "./AnalyticsDashboard";
import TicketScanner from "./TicketScanner";
import ErrorBoundary from "../common/ErrorBoundary";
import { toast } from "react-toastify";

import { ROLES, PERMISSIONS } from "../../config/roles";
import {
  fetchAdminUsers,
  deleteAdminUser,
  fetchAdminEvents,
  deleteAdminEvent,
  fetchAdminStats,
} from "../../services/adminService";
import { safeJsonParse } from "../../utils/safeJsonParse";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="ad-modal-overlay" onClick={onCancel} onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }} tabIndex={0}>
      <motion.div
        className="ad-modal" tabIndex={0}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-icon"><AlertCircle size={28} color="#ef4444" /></div>
        <h3 className="ad-modal-title">{title}</h3>
        <p className="ad-modal-msg">{message}</p>
        <div className="ad-modal-actions">
          <button className="ad-btn-ghost" onClick={onCancel} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onCancel(); }}>Cancel</button>
          <button className="ad-btn-danger" onClick={onConfirm} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onConfirm(); }}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}

const normalizePaginatedData = (response) => {
  if (response.content) return { items: response.content, totalPages: response.totalPages ?? 1, totalElements: response.totalElements ?? 0 };
  if (response.data) return { items: response.data, totalPages: response.totalPages ?? 1, totalElements: response.totalElements ?? 0 };
  if (Array.isArray(response)) return { items: response, totalPages: 1, totalElements: response.length };
  return { items: [], totalPages: 1, totalElements: 0 };
};

const AdminDashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const userRoles = user?.roles || [];
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  const [activeTab, setActiveTab] = useState("overview");

  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [searchUser, setSearchUser] = useState("");
  const [debouncedSearchUser, setDebouncedSearchUser] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(0);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [searchEvent, setSearchEvent] = useState("");
  const [debouncedSearchEvent, setDebouncedSearchEvent] = useState("");
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ open: false, type: "", id: null });
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [selectedWaitlistEvent, setSelectedWaitlistEvent] = useState(null);
  const [waitlistUsers, setWaitlistUsers] = useState([]);

  const loadWaitlist = useCallback((eventId) => {
    import("../../utils/waitlistUtils.js").then(({ getEventWaitlist }) => {
      setWaitlistUsers(getEventWaitlist(eventId));
    }).catch(() => setWaitlistUsers([]));
  }, []);

  const openWaitlistModal = (event) => {
    setSelectedWaitlistEvent(event);
    loadWaitlist(event.id);
  };

  const handleRemoveFromWaitlist = async (userId) => {
    if (!selectedWaitlistEvent) return;
    if (window.confirm("Are you sure you want to remove this user from the waitlist?")) {
      try {
        const { organizerRemoveUser } = await import("../../utils/waitlistUtils.js");
        await organizerRemoveUser(selectedWaitlistEvent.id, userId);
        toast.success("User removed from waitlist.");
        loadWaitlist(selectedWaitlistEvent.id);
      } catch (err) {
        toast.error(err.message || "Failed to remove user.");
      }
    }
  };

  const handleIncreaseCapacity = async () => {
    if (!selectedWaitlistEvent) return;
    const newCapStr = window.prompt("Enter new capacity for this event:", (Number(selectedWaitlistEvent.maxAttendees) || 0) + 10);
    if (!newCapStr) return;
    const newCap = parseInt(newCapStr, 10);
    if (isNaN(newCap) || newCap <= (selectedWaitlistEvent.maxAttendees || 0)) {
      toast.error("Please enter a valid capacity greater than current capacity.");
      return;
    }

    try {
      const { handleCapacityIncrease } = await import("../../utils/waitlistUtils.js");
      
      const updatedEvent = {
        ...selectedWaitlistEvent,
        maxAttendees: newCap,
        attendees: selectedWaitlistEvent.attendees
      };
      
      const promotedCount = await handleCapacityIncrease(updatedEvent, newCap);
      
      const cacheKey = `event_detail_${selectedWaitlistEvent.id}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = safeJsonParse(raw, null);
        if (parsed?.event) {
          parsed.event.maxAttendees = newCap;
          parsed.event.attendees = (Number(parsed.event.attendees) || 0) + promotedCount;
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        }
      }
      
      setSelectedWaitlistEvent(prev => ({
        ...prev,
        maxAttendees: newCap,
        attendees: (Number(prev.attendees) || 0) + promotedCount
      }));

      loadEvents(eventsPage, searchEvent);

      if (promotedCount > 0) {
        toast.success(`Capacity increased to ${newCap}. Promoted ${promotedCount} user(s) from waitlist!`);
      } else {
        toast.success(`Capacity increased to ${newCap}. No users to promote.`);
      }
      loadWaitlist(selectedWaitlistEvent.id);
    } catch (err) {
      toast.error(err.message || "Failed to update capacity.");
    }
  };

  const firstName = user?.firstName || user?.username || "Admin";

  useEffect(() => {
    setActiveTab("overview");
  }, [location.pathname]);

  const loadUsers = useCallback(async (page, search) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetchAdminUsers({ page, size: 10, search });
      const normalized = normalizePaginatedData(response);
      setUsers(normalized.items);
      setUsersTotalPages(normalized.totalPages);
    } catch (error) {
      setUsersError(error.message);
      toast.error(error.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async (page, search) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await fetchAdminEvents({ page, size: 10, search });
      const normalized = normalizePaginatedData(response);
      setEvents(normalized.items);
      setEventsTotalPages(normalized.totalPages);
    } catch (error) {
      setEventsError(error.message);
      toast.error(error.message);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (error) {
      setStatsError(error.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
  }, [loadStats, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "users") {
      loadUsers(usersPage, debouncedSearchUser);
    }
  }, [activeTab, usersPage, debouncedSearchUser, loadUsers]);
  }, [activeTab, usersPage, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "events") {
      loadEvents(eventsPage, debouncedSearchEvent);
    }
  }, [activeTab, eventsPage, debouncedSearchEvent, loadEvents]);
  }, [activeTab, eventsPage, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchUser = (value) => {
    setSearchUser(value);
    setUsersPage(0);
  };

  const handleSearchEvent = (value) => {
    setSearchEvent(value);
    setEventsPage(0);
  };

  useEffect(() => {
    if (activeTab !== "users") return;
    const timer = setTimeout(() => {
      setDebouncedSearchUser(searchUser);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchUser]);

  useEffect(() => {
    if (activeTab !== "events") return;
    const timer = setTimeout(() => {
      setDebouncedSearchEvent(searchEvent);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchEvent]);

  if (!isAdmin) {
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  const handleConfirmDelete = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ open: false, type: "", id: null });

    if (type === "logout") {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    try {
      if (type === "user") {
        await deleteAdminUser(id);
        toast.success("User deleted successfully.");
        loadUsers(usersPage, searchUser);
        loadStats();
      }
      if (type === "event") {
        await deleteAdminEvent(id);
        toast.success("Event deleted successfully.");
        loadEvents(eventsPage, searchEvent);
        loadStats();
      }
    } catch (error) {
      toast.error(error.message || `Failed to delete ${type}.`);
    }
  };

  const confirmDelete = (type, id) => setConfirmModal({ open: true, type, id });

  const NAV_ITEMS = [
    { id: "overview", icon: <Activity size={17} />, label: "Overview" },
    { id: "users", icon: <Users size={17} />, label: "Users" },
    { id: "events", icon: <Calendar size={17} />, label: "Events" },
    { id: "analytics", icon: <BarChart2 size={17} />, label: "Analytics" },
    { id: "scanner", icon: <QrCode size={17} />, label: "Scan Tickets" },
  ];

  return (
    <div className="ad-root">
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <div className="ad-brand-dot" />
          <span>Eventra</span>
          <span className="ad-brand-role">Admin</span>
        </div>
        <nav className="ad-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeTab === item.id ? "ad-nav-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-admin-info">
            <div className="ad-admin-avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="ad-admin-name">{firstName} {user?.lastName || ""}</p>
              <p className="ad-admin-role">Administrator</p>
            </div>
          </div>
          <button className="ad-nav-item ad-nav-logout" onClick={() => setConfirmModal({ open: true, type: "logout", id: null })}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div>
            <p className="ad-greeting">Admin Panel</p>
            <h1 className="ad-page-heading">{NAV_ITEMS.find((n) => n.id === activeTab)?.label || "Dashboard"}</h1>
          </div>
          <div className="ad-topbar-right">
            {activeTab === "events" && hasPermission(PERMISSIONS.CREATE_EVENT) && (
              <button className="ad-btn-primary" onClick={() => navigate("/create-event")}>
                <Plus size={15} /> New Event
              </button>
            )}
            <div className="ad-admin-chip"><Shield size={13} /> Admin</div>
          </div>
        </header>

        <div className="ad-content">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="ad-section"
              >
                <motion.div variants={stagger} className="ad-stats-grid">
                  {statsLoading
                    ? [...Array(4)].map((_, i) => <AdminStatCardSkeleton key={i} />)
                    : statsError
                    ? <div className="ad-error-banner"><AlertCircle size={16} /> Failed to load stats. <button onClick={loadStats} className="ad-retry-btn">Retry</button></div>
                    : stats && [
                        { label: "Total Users", value: stats.totalUsers ?? 0, sub: `${stats.activeUsers ?? 0} active`, icon: <Users size={20} />, color: "#6366f1" },
                        { label: "Total Events", value: stats.totalEvents ?? 0, sub: `${stats.upcoming ?? 0} upcoming`, icon: <Calendar size={20} />, color: "#ec4899" },
                        { label: "Participants", value: stats.totalParticipants ?? 0, sub: "across all events", icon: <TrendingUp size={20} />, color: "#10b981" },
                        { label: "Inactive Users", value: (stats.totalUsers ?? 0) - (stats.activeUsers ?? 0), sub: "need attention", icon: <AlertCircle size={20} />, color: "#f59e0b" },
                      ].map((s, i) => (
                        <motion.div key={s.label} custom={i} variants={fadeUp} className="ad-stat-card">
                          <div className="ad-stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                          <div>
                            <p className="ad-stat-label">{s.label}</p>
                            <p className="ad-stat-value">{s.value}</p>
                            <p className="ad-stat-sub">{s.sub}</p>
                          </div>
                        </motion.div>
                      ))}
                </motion.div>

                <div className="ad-two-col">
                  {statsLoading ? (
                    <>
                      <AdminListCardSkeleton />
                      <AdminListCardSkeleton />
                    </>
                  ) : (
                    <>
                      <motion.section custom={1} variants={fadeUp} className="ad-card">
                        <div className="ad-card-head">
                          <span className="ad-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}><Users size={15} /></span>
                          <h3>Recent Users</h3>
                          <button className="ad-card-link" onClick={() => setActiveTab("users")}>See all <ChevronRight size={13} /></button>
                        </div>
                        {usersLoading
                          ? <AdminListCardSkeleton />
                          : usersError
                          ? <p className="ad-error-text">Failed to load users.</p>
                          : users.length === 0
                          ? <p className="ad-empty-text">No users found.</p>
                          : users.slice(0, 4).map((u) => (
                              <div key={u.id} className="ad-list-item">
                                <div className="ad-list-avatar">{(u.firstName || u.name || "U").charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                  <p className="ad-list-title">{u.firstName} {u.lastName}</p>
                                  <p className="ad-list-sub">{u.email}</p>
                                </div>
                                <StatusBadge status={u.status || "Active"} />
                              </div>
                            ))}
                      </motion.section>

                      <motion.section custom={2} variants={fadeUp} className="ad-card">
                        <div className="ad-card-head">
                          <span className="ad-card-icon" style={{ background: "#ec489918", color: "#ec4899" }}><Calendar size={15} /></span>
                          <h3>Recent Events</h3>
                          <button className="ad-card-link" onClick={() => setActiveTab("events")}>See all <ChevronRight size={13} /></button>
                        </div>
                        {eventsLoading
                          ? <AdminListCardSkeleton />
                          : eventsError
                          ? <p className="ad-error-text">Failed to load events.</p>
                          : events.length === 0
                          ? <p className="ad-empty-text">No events found.</p>
                          : events.slice(0, 4).map((ev) => (
                              <div key={ev.id} className="ad-list-item">
                                <div className="ad-list-dot" style={{ background: ev.status === "Upcoming" ? "#6366f1" : "#10b981" }} />
                                <div style={{ flex: 1 }}>
                                  <p className="ad-list-title">{ev.title}</p>
                                  <p className="ad-list-sub">{ev.date} · {ev.participantCount ?? 0} participants</p>
                                </div>
                                <StatusBadge status={ev.status || "Upcoming"} />
                              </div>
                            ))}
                      </motion.section>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <div className="ad-toolbar">
                  <div className="ad-search-wrap">
                    <Search size={14} className="ad-search-icon" />
                    <input className="ad-search" placeholder="Search users…" value={searchUser} onChange={(e) => handleSearchUser(e.target.value)} />
                  </div>
                  <div className="ad-toolbar-right flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Download size={13} /> Export
                        <ChevronDown size={12} className={`transition-transform duration-200 ${showExportDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showExportDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
                          <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1 z-20 animate-fadeIn">
                            <button onClick={() => { exportToCSV(users, "users_list"); setShowExportDropdown(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition">Export as CSV</button>
                            <button onClick={() => { exportToJSON(users, "users_list"); setShowExportDropdown(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition">Export as JSON</button>
                          </div>
                        </>
                      )}
                    </div>
                    <span className="ad-count">{users.length} user{users.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="ad-table-wrap">
                  {usersLoading ? (
                    <AdminTableSkeleton rows={5} />
                  ) : usersError ? (
                    <div className="ad-error-banner"><AlertCircle size={16} /> {usersError} <button onClick={() => loadUsers(usersPage, searchUser)} className="ad-retry-btn">Retry</button></div>
                  ) : (
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={6} className="ad-table-empty">No users found.</td></tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u.id} className="transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td>
                                <div className="ad-table-user">
                                  <div className="ad-table-avatar">{(u.firstName || u.name || "U").charAt(0)}</div>
                                  <span>{u.firstName} {u.lastName}</span>
                                </div>
                              </td>
                              <td className="ad-muted">{u.email}</td>
                              <td>
                                {(u.roles || []).map((r) => (
                                  <span key={r} style={{ marginRight: '4px' }}><StatusBadge status={r} /></span>
                                ))}
                              </td>
                              <td className="ad-muted">{u.createdAt || u.joinedAt || "—"}</td>
                              <td><StatusBadge status={u.status || "Active"} /></td>
                              <td>
                                <div className="ad-action-btns">
                                  {hasPermission(PERMISSIONS.EDIT_USER) && (
                                    <button className="ad-icon-action" title="Edit" onClick={() => toast.info('Edit coming soon')}><Edit2 size={14} /></button>
                                  )}
                                  {hasPermission(PERMISSIONS.DELETE_USER) && (
                                    <button className="ad-icon-action ad-icon-danger" title="Delete" onClick={() => confirmDelete('user', u.id)}><Trash2 size={14} /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="ad-pagination">
                  <button
                    className="ad-pagination-btn"
                    disabled={usersPage <= 0}
                    onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="ad-pagination-info">
                    Page {usersPage + 1} of {usersTotalPages}
                  </span>
                  <button
                    className="ad-pagination-btn"
                    disabled={usersPage >= usersTotalPages - 1}
                    onClick={() => setUsersPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "events" && (
              <motion.div key="events" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <div className="ad-toolbar">
                  <div className="ad-search-wrap">
                    <Search size={14} className="ad-search-icon" />
                    <input className="ad-search" placeholder="Search events…" value={searchEvent} onChange={(e) => handleSearchEvent(e.target.value)} />
                  </div>
                  <span className="ad-count">{events.length} event{events.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="ad-table-wrap">
                  {eventsLoading ? (
                    <AdminTableSkeleton rows={5} />
                  ) : eventsError ? (
                    <div className="ad-error-banner"><AlertCircle size={16} /> {eventsError} <button onClick={() => loadEvents(eventsPage, searchEvent)} className="ad-retry-btn">Retry</button></div>
                  ) : (
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Participants</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.length === 0 ? (
                          <tr><td colSpan={6} className="ad-table-empty">No events found.</td></tr>
                        ) : (
                          events.map((ev) => (
                            <tr key={ev.id} className="transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="ad-table-bold">{ev.title}</td>
                              <td><StatusBadge status={ev.type || "Event"} /></td>
                              <td className="ad-muted">{ev.date}</td>
                              <td className="ad-muted">{ev.participantCount ?? 0}</td>
                              <td><StatusBadge status={ev.status || "Upcoming"} /></td>
                              <td>
                                <div className="ad-action-btns">
                                  <button className="ad-icon-action" title="Waitlist" onClick={() => openWaitlistModal(ev)} style={{ color: "#f59e0b" }}>
                                    <Clock size={14} />
                                  </button>
                                  {hasPermission(PERMISSIONS.EDIT_EVENT) && (
                                    <button className="ad-icon-action" title="Edit" onClick={() => toast.info('Edit coming soon')}><Edit2 size={14} /></button>
                                  )}
                                  {hasPermission(PERMISSIONS.DELETE_EVENT) && (
                                    <button className="ad-icon-action ad-icon-danger" title="Delete" onClick={() => confirmDelete('event', ev.id)}><Trash2 size={14} /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="ad-pagination">
                  <button
                    className="ad-pagination-btn"
                    disabled={eventsPage <= 0}
                    onClick={() => setEventsPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="ad-pagination-info">
                    Page {eventsPage + 1} of {eventsTotalPages}
                  </span>
                  <button
                    className="ad-pagination-btn"
                    disabled={eventsPage >= eventsTotalPages - 1}
                    onClick={() => setEventsPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <motion.div variants={stagger} initial="hidden" animate="visible" className="ad-stats-grid">
                  {statsLoading
                    ? [...Array(4)].map((_, i) => <AdminStatCardSkeleton key={i} />)
                    : stats && [
                        { label: "Total Users", value: stats.totalUsers ?? 0, sub: `${stats.activeUsers ?? 0} active · ${(stats.totalUsers ?? 0) - (stats.activeUsers ?? 0)} inactive`, color: "#6366f1", icon: <Users size={20} /> },
                        { label: "Events Hosted", value: stats.totalEvents ?? 0, sub: `${stats.upcoming ?? 0} upcoming · ${(stats.totalEvents ?? 0) - (stats.upcoming ?? 0)} completed`, color: "#ec4899", icon: <Calendar size={20} /> },
                        { label: "Total Participants", value: stats.totalParticipants ?? 0, sub: "across all events", color: "#10b981", icon: <TrendingUp size={20} /> },
                        { label: "Avg Participants", value: Math.round((stats.totalParticipants ?? 0) / ((stats.totalEvents ?? 0) || 1)), sub: "per event", color: "#f59e0b", icon: <BarChart2 size={20} /> },
                      ].map((s, i) => (
                        <motion.div key={s.label} custom={i} variants={fadeUp} className="ad-stat-card">
                          <div className="ad-stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                          <div>
                            <p className="ad-stat-label">{s.label}</p>
                            <p className="ad-stat-value">{s.value}</p>
                            <p className="ad-stat-sub">{s.sub}</p>
                          </div>
                        </motion.div>
                      ))}
                </motion.div>
                <div style={{ marginTop: "1.5rem" }}>
                  <ErrorBoundary level="section" label="Analytics Dashboard">
                    <AnalyticsDashboard />
                  </ErrorBoundary>
                </div>
              </motion.div>
            )}

            {activeTab === "scanner" && (
              <motion.div key="scanner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ad-section">
                <ErrorBoundary level="section" label="Ticket Scanner">
                  <TicketScanner />
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="ad-footer">
          <div className="ad-footer-divider" />
          <div className="ad-footer-content">
            <p className="ad-footer-copyright">© {new Date().getFullYear()} Eventra. Admin Control Panel.</p>
            <div className="ad-footer-links">
              <Link to="/helpcenter" className="ad-footer-link">Help Center</Link>
              <a href={`https://github.com/${import.meta.env.VITE_GITHUB_REPO || import.meta.env.REACT_APP_GITHUB_REPO || 'sandeepvashishtha/Eventra'}`} target="_blank" rel="noopener noreferrer" className="ad-footer-link">GitHub</a>
              <Link to="/privacy" className="ad-footer-link">Privacy Policy</Link>
              <Link to="/terms" className="ad-footer-link">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {confirmModal.open && (
          <ConfirmModal
            open={confirmModal.open}
            title={confirmModal.type === "logout" ? "Logout?" : `Delete ${confirmModal.type}?`}
            message={confirmModal.type === "logout" ? "You will be logged out of the admin panel." : "This action cannot be undone. Are you sure?"}
            onConfirm={confirmModal.type === "logout" ? () => { setConfirmModal({ open: false, type: "", id: null }); logout(); navigate("/"); } : handleConfirmDelete}
            onCancel={() => setConfirmModal({ open: false, type: "", id: null })}
          />
        )}
      </AnimatePresence>

      {/* Waitlist Management Modal */}
      {selectedWaitlistEvent && (
        <div className="ad-modal-overlay" onClick={() => setSelectedWaitlistEvent(null)}>
          <motion.div
            className="ad-modal" style={{ maxWidth: "600px", width: "90%" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="ad-modal-title" style={{ margin: 0 }}>
                Waitlist for {selectedWaitlistEvent.title}
              </h3>
              <button onClick={() => setSelectedWaitlistEvent(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="mb-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <span className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                Capacity: {selectedWaitlistEvent.attendees} / {selectedWaitlistEvent.maxAttendees} registered
              </span>
              <button
                onClick={handleIncreaseCapacity}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Increase Capacity
              </button>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {waitlistUsers.length === 0 ? (
                <p className="text-center py-6 text-sm text-gray-500">No users on the waitlist for this event.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-2">Pos</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Joined At</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistUsers.map((w, index) => (
                      <tr key={w.userId} className="border-b dark:border-gray-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="py-2 font-bold text-amber-600 dark:text-amber-400">{index + 1}</td>
                        <td className="py-2">{w.userName}</td>
                        <td className="py-2 text-slate-500">{w.userEmail || "—"}</td>
                        <td className="py-2 text-slate-500">{new Date(w.joinedAt).toLocaleTimeString()}</td>
                        <td className="py-2">
                          <button
                            onClick={() => handleRemoveFromWaitlist(w.userId)}
                            className="text-red-500 hover:underline font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
