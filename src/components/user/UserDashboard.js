import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { getSmartDateLabel } from "../../utils/relativeTime";
import {
  Calendar,
  Trophy,
  FolderOpen,
  Users,
  Settings,
  Clock,
  Zap,
  Activity,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../common/StatusBadge";
import {
  requestNotificationPermission,
  disableNotifications,
} from "../../utils/NotificationManager";
import { readNotificationPreferences } from "../../utils/notificationPreferences";
import EventsTab from "./EventsTab";
import HackathonsTab from "./HackathonsTab";
import ProjectsTab from "./ProjectsTab";
import RegistrationsTab from "./RegistrationsTab";
import AnalyticsTab from "./AnalyticsTab";
import {
  DashboardListCardSkeleton,
  DashboardProfileSkeleton,
  DashboardQuickActionSkeleton,
  DashboardSectionTitleSkeleton,
  DashboardStatCardSkeleton,
} from "../common/SkeletonLoaders";
import "./UserDashboard.css";
import EventTicket from "./EventTicket";
import EmptyState from "../common/EmptyState";
import DashboardEmptyState from "./DashboardEmptyState";
import OfflineIndicator from "../common/OfflineIndicator";

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: prefersReducedMotion ? 0 : i * 0.07,
      duration: prefersReducedMotion ? 0 : 0.45,
      ease: "easeOut",
    },
  }),
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 } },
});

const MOCK_DATA = [
  {
    id: 1,
    type: "Event",
    title: "Tech Talk: AI in 2025",
    date: "2025-06-15",
    location: "Mumbai",
    status: "Completed",
    projectStatus: "Done",
    lastUpdate: "-",
    participationType: "Registered",
  },
  {
    id: 2,
    type: "Event",
    title: "Web Dev Workshop",
    date: "2025-09-10",
    location: "Online",
    status: "Upcoming",
    projectStatus: "Upcoming",
    lastUpdate: "-",
    participationType: "Registered",
  },
  {
    id: 3,
    type: "Hackathon",
    title: "Hack for Sustainability",
    date: "2025-07-20",
    location: "Bangalore",
    status: "Completed",
    projectStatus: "Done",
    lastUpdate: "-",
    participationType: "Hosted",
  },
  {
    id: 4,
    type: "Hackathon",
    title: "AI Hackathon",
    date: "2025-09-05",
    location: "Online",
    status: "Completed",
    projectStatus: "Done",
    lastUpdate: "-",
    participationType: "Registered",
  },
  {
    id: 5,
    type: "Event",
    title: "React Conference 2025",
    date: "2025-12-15",
    location: "San Francisco, CA",
    status: "Upcoming",
    projectStatus: "Upcoming",
    lastUpdate: "-",
    participationType: "Hosted",
  },
  {
    id: 6,
    type: "Hackathon",
    title: "Global AI Hackathon",
    date: "2025-10-10",
    location: "Online",
    status: "Upcoming",
    projectStatus: "Upcoming",
    lastUpdate: "-",
    participationType: "Registered",
  },
  {
    id: 7,
    type: "Hackathon",
    title: "Blockchain Builders Hack",
    date: "2025-11-05",
    location: "New York, USA",
    status: "Upcoming",
    projectStatus: "Upcoming",
    lastUpdate: "-",
    participationType: "Hosted",
  },
  {
    id: 8,
    type: "Project",
    title: "Online Pizza Shop",
    date: null,
    location: null,
    status: "-",
    projectStatus: "Done",
    lastUpdate: "2025-08-30",
    participationType: "Submitted",
  },
  {
    id: 9,
    type: "Project",
    title: "Student Gradesheet App",
    date: null,
    location: null,
    status: "-",
    projectStatus: "In Progress",
    lastUpdate: "2025-09-08",
    participationType: "Contributed",
  },
];

const QUICK_ACTIONS = [
  { label: "Events", icon: <Calendar size={22} />, to: "/events", color: "#6366f1" },
  { label: "Hackathons", icon: <Trophy size={22} />, to: "/hackathons", color: "#ec4899" },
  { label: "Projects", icon: <FolderOpen size={22} />, to: "/projects", color: "#8b5cf6" },
  { label: "Profile", icon: <User size={22} />, to: "/dashboard/profile", color: "#10b981" },
  { label: "Settings", icon: <Settings size={22} />, to: "/settings", color: "#f59e0b" },
];

export default function UserDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [greeting, setGreeting] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(() => readNotificationPreferences().push);

  const togglePushNotifications = async () => {
    if (pushEnabled) {
      disableNotifications();
      setPushEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      setPushEnabled(granted);
    }
  };

  const firstName = user?.firstName || user?.username || "there";

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const derivedData = useMemo(() => {
    let eventsTotal = 0;
    let eventsCreated = 0;
    let eventsJoined = 0;
    let hackathonsTotal = 0;
    let hackathonsHosted = 0;
    let hackathonsJoined = 0;
    let projectsTotal = 0;
    let projectsDone = 0;
    let projectsActive = 0;
    const upcomingEvents = [];
    const upcomingHackathons = [];
    const activeProjects = [];

    for (const d of MOCK_DATA) {
      if (d && d.type === "Event") {
        eventsTotal++;
        if (d.participationType === "Hosted") eventsCreated++;
        if (d.participationType === "Registered") eventsJoined++;
        if (d.status === "Upcoming") upcomingEvents.push(d);
      } else if (d && d.type === "Hackathon") {
        hackathonsTotal++;
        if (d.participationType === "Hosted") hackathonsHosted++;
        if (d.participationType === "Registered") hackathonsJoined++;
        if (d.status === "Upcoming") upcomingHackathons.push(d);
      } else if (d && d.type === "Project") {
        projectsTotal++;
        if (d.projectStatus !== "Done") {
          projectsActive++;
          activeProjects.push(d);
        } else {
          projectsDone++;
        }
      }
    }

    return {
      stats: {
        eventsTotal,
        eventsCreated,
        eventsJoined,
        hackathonsTotal,
        hackathonsHosted,
        hackathonsJoined,
        projectsTotal,
        projectsDone,
        projectsActive,
      },
      upcomingEvents,
      upcomingHackathons,
      activeProjects,
    };
  }, []);

  const { stats, upcomingEvents, upcomingHackathons, activeProjects } = derivedData;

  const filteredData = useMemo(
    () =>
      MOCK_DATA.filter((item) => {
        const matchSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === "All" || item.type === filterType;
        const matchStatus =
          filterStatus === "All" ||
          item.status === filterStatus ||
          item.projectStatus === filterStatus;
        return matchSearch && matchType && matchStatus;
      }).sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      }),
    [searchQuery, filterType, filterStatus]
  );

  const notifications = [
    { id: 1, text: "React Conference 2025 registration opens soon", time: "2h ago", unread: true },
    { id: 2, text: "Global AI Hackathon team registration open", time: "1d ago", unread: true },
    {
      id: 3,
      text: "Student Gradesheet App updated by collaborator",
      time: "2d ago",
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="ud-root">
      <OfflineIndicator />
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-brand">
          <div className="ud-brand-dot" />
          <span>Eventra</span>
        </div>

        <nav className="ud-nav">
          {[
            { id: "overview", icon: <Activity size={18} />, label: "Overview" },
            { id: "events", icon: <Calendar size={18} />, label: "Events" },
            { id: "hackathons", icon: <Trophy size={18} />, label: "Hackathons" },
            { id: "projects", icon: <FolderOpen size={18} />, label: "Projects" },
            { id: "registrations", icon: <Users size={18} />, label: "Registrations" },
            { id: "analytics", icon: <Activity size={18} />, label: "Analytics" },
          ].map((item) => (
            <button
              key={item.id}
              className={`ud-nav-item ${activeTab === item.id ? "ud-nav-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="ud-nav-badge">{item.badge}</span>}
            </button>
          ))}
          <Link to="/dashboard/achievements" className="ud-nav-item">
            <Trophy size={18} />
            <span>Achievements</span>
          </Link>
          <Link to="/dashboard/quests" className="ud-nav-item">
            <Zap size={18} />
            <span>Quest Center</span>
          </Link>
        </nav>

        <div className="ud-sidebar-bottom">
          <Link to="/dashboard/profile" className="ud-nav-item" id="sidebar-profile-link">
            <User size={18} />
            <span>Profile</span>
          </Link>
          <button
            className="ud-nav-item ud-nav-logout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ud-main">
        <header className="ud-topbar">
          {loading ? (
            <DashboardProfileSkeleton />
          ) : (
            <div>
              <p className="ud-greeting">{greeting},</p>
              <h1 className="ud-username">{firstName} 👋</h1>
            </div>
          )}

          <div className="ud-topbar-right">
            <div className="ud-search-wrap">
              <Search size={15} className="ud-search-icon" />
              <input
                className="ud-search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="ud-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="ud-icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="ud-notif-dot">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="ud-notif-panel"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                  >
                    <div className="ud-notif-header flex items-center justify-between">
                      <span>Notifications</span>
                      <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-xs">
                          <span className="text-gray-500">Push</span>
                          <input
                            type="checkbox"
                            checked={pushEnabled}
                            onChange={togglePushNotifications}
                            className="h-3 w-3 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                        <button
                          onClick={() => setNotifOpen(false)}
                          aria-label="Close notification panel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`ud-notif-item ${n.unread ? "ud-notif-unread" : ""}`}
                      >
                        <p className="ud-notif-text">{n.text}</p>
                        <p className="ud-notif-time">{n.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ✅ FIX 2: Single AnimatePresence wrapping all tab content correctly */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={stagger(prefersReducedMotion)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="ud-content"
            >
              {loading ? (
                <>
                  <div className="ud-stats-grid">
                    {[...Array(4)].map((_, i) => (
                      <DashboardStatCardSkeleton key={i} />
                    ))}
                  </div>

                  <section>
                    <DashboardSectionTitleSkeleton />
                    <div className="ud-quick-grid">
                      {[...Array(6)].map((_, i) => (
                        <DashboardQuickActionSkeleton key={i} />
                      ))}
                    </div>
                  </section>

                  <div className="ud-three-col">
                    {[...Array(3)].map((_, i) => (
                      <DashboardListCardSkeleton key={i} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Full-page premium empty state (#7453):
                      shown when the user has no events, hackathons, or projects at all.
                      Provides a direct CTA to browse events or create one. */}
                  {stats.eventsTotal === 0 &&
                  stats.hackathonsTotal === 0 &&
                  stats.projectsTotal === 0 ? (
                    <DashboardEmptyState />
                  ) : (
                    <>
                      <motion.div
                        variants={stagger(prefersReducedMotion)}
                        className="ud-stats-grid"
                      >
                        {[
                          {
                            label: "Events",
                            value: stats.eventsTotal,
                            sub: `${stats.eventsCreated} hosted · ${stats.eventsJoined} joined`,
                            icon: <Calendar size={20} />,
                            accent: "#6366f1",
                          },
                          {
                            label: "Hackathons",
                            value: stats.hackathonsTotal,
                            sub: `${stats.hackathonsHosted} hosted · ${stats.hackathonsJoined} joined`,
                            icon: <Trophy size={20} />,
                            accent: "#ec4899",
                          },
                          {
                            label: "Projects",
                            value: stats.projectsTotal,
                            sub: `${stats.projectsDone} done · ${stats.projectsActive} active`,
                            icon: <FolderOpen size={20} />,
                            accent: "#8b5cf6",
                          },
                          {
                            label: "Upcoming",
                            value: upcomingEvents.length + upcomingHackathons.length,
                            sub: `${upcomingEvents.length} events · ${upcomingHackathons.length} hackathons`,
                            icon: <Clock size={20} />,
                            accent: "#10b981",
                          },
                        ].map((s, i) => (
                          <motion.div
                            key={s.label}
                            custom={i}
                            variants={fadeUp(prefersReducedMotion)}
                            className="ud-stat-card"
                          >
                            <div
                              className="ud-stat-icon"
                              style={{ background: s.accent + "18", color: s.accent }}
                            >
                              {s.icon}
                            </div>
                            <div className="ud-stat-info">
                              <p className="ud-stat-label">{s.label}</p>
                              <p className="ud-stat-value">{s.value}</p>
                              <p className="ud-stat-sub">{s.sub}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.section custom={1} variants={fadeUp(prefersReducedMotion)}>
                        <h2 className="ud-section-title">
                          <Zap size={17} /> Quick Actions
                        </h2>
                        <div className="ud-quick-grid">
                          {QUICK_ACTIONS.map((a) => (
                            <Link
                              key={a.label}
                              to={a.to}
                              className="ud-quick-card"
                              style={{ "--qa-color": a.color }}
                            >
                              <span
                                className="ud-quick-icon"
                                style={{ color: a.color, background: a.color + "18" }}
                              >
                                {a.icon}
                              </span>
                              <span className="ud-quick-label">{a.label}</span>
                              <ChevronRight size={14} className="ud-quick-arrow" />
                            </Link>
                          ))}
                          <Link
                            to="/create-event"
                            className="ud-quick-card ud-quick-new"
                            style={{ "--qa-color": "#6366f1" }}
                          >
                            <span
                              className="ud-quick-icon"
                              style={{ color: "#6366f1", background: "#6366f118" }}
                            >
                              <Plus size={22} />
                            </span>
                            <span className="ud-quick-label">New Event</span>
                            <ChevronRight size={14} className="ud-quick-arrow" />
                          </Link>
                        </div>
                      </motion.section>

                      <div className="ud-three-col">
                        {/* Upcoming Events */}
                        <motion.section
                          custom={2}
                          variants={fadeUp(prefersReducedMotion)}
                          className="ud-card"
                        >
                          <div className="ud-card-head">
                            <span
                              className="ud-card-icon"
                              style={{ background: "#6366f118", color: "#6366f1" }}
                            >
                              <Clock size={16} />
                            </span>
                            <h3>Upcoming Events</h3>
                            <Link to="/events" className="ud-card-link">
                              See all <ChevronRight size={13} />
                            </Link>
                          </div>
                          {upcomingEvents.length === 0 ? (
                            <EmptyState
                              compact={true}
                              icon={<Calendar size={32} className="text-indigo-500" />}
                              title="No Upcoming Events"
                              message="You haven't registered or joined any events yet. Check out the Events tab to find one!"
                              onBrowseAll={() => navigate("/events")}
                            />
                          ) : (
                            upcomingEvents.map((ev) => (
                              <div key={ev.id} className="ud-list-item">
                                <div className="min-w-0 flex-1">
                                  <p className="ud-list-title" title={ev.title}>
                                    {ev.title}
                                  </p>
                                  <p className="ud-list-meta">
                                    <Calendar size={12} /> {getSmartDateLabel(ev.date)}
                                  </p>
                                </div>
                                <StatusBadge status={ev.participationType} />
                              </div>
                            ))
                          )}
                        </motion.section>

                        {/* Upcoming Hackathons */}
                        <motion.section
                          custom={3}
                          variants={fadeUp(prefersReducedMotion)}
                          className="ud-card"
                        >
                          <div className="ud-card-head">
                            <span
                              className="ud-card-icon"
                              style={{ background: "#ec489918", color: "#ec4899" }}
                            />
                            <h3>Upcoming Hackathons</h3>
                            <Link to="/hackathons" className="ud-card-link">
                              See all <ChevronRight size={14} />
                            </Link>
                          </div>
                          {upcomingHackathons.length === 0 ? (
                            <EmptyState
                              compact={true}
                              icon={<Trophy size={32} className="text-pink-500" />}
                              title="No Active Hackathons"
                              message="There are currently no upcoming hackathons in your schedule."
                              onBrowseAll={() => navigate("/hackathons")}
                            />
                          ) : (
                            upcomingHackathons.map((h) => (
                              <div key={h.id} className="ud-list-item">
                                <div className="min-w-0 flex-1">
                                  <p className="ud-list-title" title={h.title}>
                                    {h.title}
                                  </p>
                                  <p className="ud-list-meta">
                                    <Calendar size={12} /> {getSmartDateLabel(h.date)}
                                  </p>
                                </div>
                                <StatusBadge status={h.participationType} />
                              </div>
                            ))
                          )}
                        </motion.section>

                        {/* Active Projects */}
                        <motion.section
                          custom={4}
                          variants={fadeUp(prefersReducedMotion)}
                          className="ud-card"
                        >
                          <div className="ud-card-head">
                            <span
                              className="ud-card-icon"
                              style={{ background: "#8b5cf618", color: "#8b5cf6" }}
                            />
                            <h3>Active Projects</h3>
                            <Link to="/projects" className="ud-card-link">
                              See all <ChevronRight size={14} />
                            </Link>
                          </div>
                          {activeProjects.length === 0 ? (
                            <EmptyState
                              compact={true}
                              icon={<FolderOpen size={32} className="text-purple-500" />}
                              title="No Active Projects"
                              message="All your tracked development projects are currently completed or inactive."
                              onBrowseAll={() => navigate("/projects")}
                            />
                          ) : (
                            activeProjects.map((p) => (
                              <div key={p.id} className="ud-list-item">
                                <div className="min-w-0 flex-1">
                                  <p className="ud-list-title" title={p.title}>
                                    {p.title}
                                  </p>
                                  <p className="ud-list-meta">Updated: {p.lastUpdate}</p>
                                </div>
                                <StatusBadge status={p.projectStatus} />
                              </div>
                            ))
                          )}
                        </motion.section>
                      </div>
                    </>
                  )}{" "}
                  {/* end hasData ternary */}
                </>
              )}
            </motion.div>
          )}

          {/* Events tab */}
          {activeTab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBoundary level="feature">
                <EventsTab
                  hostedEvents={MOCK_DATA.filter((d) => d.type === "Event" && d.participationType)}
                  onViewTicket={setSelectedTicketEvent}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Hackathons tab */}
          {activeTab === "hackathons" && (
            <motion.div
              key="hackathons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBoundary level="feature">
                <HackathonsTab
                  hackathons={MOCK_DATA.filter((d) => d.type === "Hackathon")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Projects tab */}
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBoundary level="feature">
                <ProjectsTab
                  projects={MOCK_DATA.filter((d) => d.type === "Project")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Registrations tab */}
          {activeTab === "registrations" && (
            <motion.div
              key="registrations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBoundary level="feature">
                <RegistrationsTab
                  filteredData={filteredData}
                  loading={loading}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  setSelectedTicketEvent={setSelectedTicketEvent}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Analytics tab */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBoundary level="feature">
                <AnalyticsTab loading={loading} />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="ud-footer">
          <div className="ud-footer-divider" />
          <div className="ud-footer-content">
            <p className="ud-footer-copyright">
              © {new Date().getFullYear()} Eventra. All rights reserved.
            </p>
            <div className="ud-footer-links">
              <Link to="/helpcenter" className="ud-footer-link">
                Help Center
              </Link>
              <Link to="/feedback" className="ud-footer-link">
                Feedback
              </Link>
              <Link to="/privacy" className="ud-footer-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="ud-footer-link">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>

        {/* Ticket Preview Modal */}
        {selectedTicketEvent && (
          <EventTicket
            event={selectedTicketEvent}
            user={user}
            onClose={() => setSelectedTicketEvent(null)}
          />
        )}
      </main>
    </div>
  );
}
