import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getSmartDateLabel } from "../../utils/relativeTime";
import {
  Calendar, Trophy, FolderOpen, Users, Settings,
  Clock, Zap, Activity, Bell, ChevronRight,
  LogOut, User, Plus, Search, X, Bookmark, CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import useBookmarks from "../../hooks/useBookmarks";
import { getEventStatus } from "../../utils/eventUtils";
import StatusBadge from "../common/StatusBadge";
import { requestNotificationPermission, disableNotifications } from "../../utils/NotificationManager";
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
import MyItinerary from "./MyItinerary";
import DashboardOverview, { getDerivedData } from "./DashboardOverview";

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: prefersReducedMotion ? 0 : i * 0.07, duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }
  })
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 } }
});

const MOCK_DATA = [
  { id: 1, type: "Event", title: "Tech Talk: AI in 2025", date: "2025-06-15", location: "Mumbai", status: "Completed", projectStatus: "Done", lastUpdate: "-", participationType: "Registered" },
  { id: 2, type: "Event", title: "Web Dev Workshop", date: "2025-09-10", location: "Online", status: "Upcoming", projectStatus: "Upcoming", lastUpdate: "-", participationType: "Registered" },
  { id: 3, type: "Hackathon", title: "Hack for Sustainability", date: "2025-07-20", location: "Bangalore", status: "Completed", projectStatus: "Done", lastUpdate: "-", participationType: "Hosted" },
  { id: 4, type: "Hackathon", title: "AI Hackathon", date: "2025-09-05", location: "Online", status: "Completed", projectStatus: "Done", lastUpdate: "-", participationType: "Registered" },
  { id: 5, type: "Event", title: "React Conference 2025", date: "2025-12-15", location: "San Francisco, CA", status: "Upcoming", projectStatus: "Upcoming", lastUpdate: "-", participationType: "Hosted" },
  { id: 6, type: "Hackathon", title: "Global AI Hackathon", date: "2025-10-10", location: "Online", status: "Upcoming", projectStatus: "Upcoming", lastUpdate: "-", participationType: "Registered" },
  { id: 7, type: "Hackathon", title: "Blockchain Builders Hack", date: "2025-11-05", location: "New York, USA", status: "Upcoming", projectStatus: "Upcoming", lastUpdate: "-", participationType: "Hosted" },
  { id: 8, type: "Project", title: "Online Pizza Shop", date: null, location: null, status: "-", projectStatus: "Done", lastUpdate: "2025-08-30", participationType: "Submitted" },
  { id: 9, type: "Project", title: "Student Gradesheet App", date: null, location: null, status: "-", projectStatus: "In Progress", lastUpdate: "2025-09-08", participationType: "Contributed" },
];

const NAV_ITEMS = [
  { id: "overview", icon: <Activity size={18} />, label: "Overview" },
  { id: "events", icon: <Calendar size={18} />, label: "Events" },
  { id: "itinerary", icon: <Bookmark size={18} />, label: "My Itinerary" },
  { id: "hackathons", icon: <Trophy size={18} />, label: "Hackathons" },
  { id: "projects", icon: <FolderOpen size={18} />, label: "Projects" },
  { id: "registrations", icon: <Users size={18} />, label: "Registrations" },
  { id: "analytics", icon: <Activity size={18} />, label: "Analytics" },
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
  const { myEvents, loading: myEventsLoading } = useMyEvents();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");

  const journeyStats = useMemo(() => {
    const records = Array.isArray(myEvents) ? myEvents : [];
    const registeredItems = records
      .map((registration) => registration?.event || registration?.eventSummary || null)
      .filter(Boolean);

    const isHackathon = (item) => {
      const type = String(item?.type || "").toLowerCase();
      const category = String(item?.category || "").toLowerCase();
      const title = String(item?.title || "").toLowerCase();
      return type === "hackathon" || category.includes("hackathon") || title.includes("hackathon");
    };

    const eventRegistrations = registeredItems.filter((item) => !isHackathon(item));
    const hackathonRegistrations = registeredItems.filter(isHackathon);

    const eventsAttended = eventRegistrations.filter((event) => {
      const status = getEventStatus(event);
      return status === "past" || status === "ended";
    }).length;

    const upcomingEvents = registeredItems.filter((event) => {
      const status = getEventStatus(event);
      return status === "upcoming" || status === "live";
    }).length;

    const savedEvents = Array.isArray(bookmarks) ? bookmarks.length : 0;

    return {
      eventsRegistered: eventRegistrations.length,
      eventsAttended,
      hackathonsJoined: hackathonRegistrations.length,
      upcomingEvents,
      savedEvents,
      totalRegistrations: registeredItems.length,
    };
  }, [myEvents, bookmarks]);

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
    if (myEventsLoading) {
      setLoading(true);
      return undefined;
    }

    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [myEventsLoading]);

  const derivedData = useMemo(() => getDerivedData(MOCK_DATA), []);

  const { upcomingEvents, upcomingHackathons, activeProjects } = derivedData;

  const filteredData = useMemo(() =>
    MOCK_DATA.filter(item => {
      const matchSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "All" || item.type === filterType;
      const matchStatus = filterStatus === "All"
        || item.status === filterStatus
        || item.projectStatus === filterStatus;
      return matchSearch && matchType && matchStatus;
    }).sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    }),
  [searchQuery, filterType, filterStatus]);

  const notifications = [
    { id: 1, text: "React Conference 2025 registration opens soon", time: "2h ago", unread: true },
    { id: 2, text: "Global AI Hackathon team registration open", time: "1d ago", unread: true },
    { id: 3, text: "Student Gradesheet App updated by collaborator", time: "2d ago", unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

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
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`ud-nav-item ${activeTab === item.id ? "ud-nav-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ud-nav-badge">{item.badge}</span>
              )}
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
            <User size={18} /><span>Profile</span>
          </Link>
          <button className="ud-nav-item ud-nav-logout" onClick={() => { logout(); navigate("/"); }}>
            <LogOut size={18} /><span>Logout</span>
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
              <input className="ud-search" placeholder="Search…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button className="ud-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search query"><X size={13} /></button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button className="ud-icon-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
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
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <span className="text-gray-500">Push</span>
                          <input 
                            type="checkbox" 
                            checked={pushEnabled} 
                            onChange={togglePushNotifications}
                            className="w-3 h-3 rounded text-indigo-600 focus:ring-indigo-500" 
                          />
                        </label>
                        <button onClick={() => setNotifOpen(false)} aria-label="Close notification panel"><X size={14} /></button>
                      </div>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} className={`ud-notif-item ${n.unread ? "ud-notif-unread" : ""}`}>
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
            <DashboardOverview 
              prefersReducedMotion={prefersReducedMotion} 
              loading={loading} 
              journeyStats={journeyStats} 
              upcomingEvents={upcomingEvents} 
              upcomingHackathons={upcomingHackathons} 
              activeProjects={activeProjects} 
              navigate={navigate} 
            />
          )}

          {/* Events tab */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <EventsTab
                  hostedEvents={MOCK_DATA.filter(d => d.type === "Event" && d.participationType)}
                  onViewTicket={setSelectedTicketEvent}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* My Itinerary tab */}
          {activeTab === "itinerary" && (
            <motion.div key="itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ud-content">
              <ErrorBoundary level="feature">
                <MyItinerary />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Hackathons tab */}
          {activeTab === "hackathons" && (
            <motion.div key="hackathons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <HackathonsTab
                  hackathons={MOCK_DATA.filter(d => d.type === "Hackathon")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Projects tab */}
          {activeTab === "projects" && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <ProjectsTab
                  projects={MOCK_DATA.filter(d => d.type === "Project")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Registrations tab */}
          {activeTab === "registrations" && (
            <motion.div key="registrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              <Link to="/helpcenter" className="ud-footer-link">Help Center</Link>
              <Link to="/feedback" className="ud-footer-link">Feedback</Link>
              <Link to="/privacy" className="ud-footer-link">Privacy Policy</Link>
              <Link to="/terms" className="ud-footer-link">Terms of Service</Link>
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
