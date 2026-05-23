import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Trophy, FolderOpen, Users, Settings,
  Clock, MapPin, Zap, Activity, Bell, ChevronRight,
  LogOut, User, Plus, Search, X, Ticket
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import StatusBadge from "../common/StatusBadge";
import MyEventsTab from "./MyEventsTab";
import {
  DashboardItemCardSkeleton,
  DashboardListCardSkeleton,
  DashboardProfileSkeleton,
  DashboardQuickActionSkeleton,
  DashboardSectionTitleSkeleton,
  DashboardStatCardSkeleton,
  DashboardTableSkeleton,
} from "../common/SkeletonLoaders";
import "./UserDashboard.css";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

// ✅ Removed STATUS_COLORS — no longer needed, StatusBadge handles all styling

const TYPE_ICON = {
  Event: <Calendar className="ud-type-icon" style={{ color: "#6366f1" }} />,
  Hackathon: <Trophy className="ud-type-icon" style={{ color: "#ec4899" }} />,
  Project: <FolderOpen className="ud-type-icon" style={{ color: "#8b5cf6" }} />,
};

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

const QUICK_ACTIONS = [
  { label: "Events", icon: <Calendar size={22} />, to: "/events", color: "#6366f1" },
  { label: "Hackathons", icon: <Trophy size={22} />, to: "/hackathons", color: "#ec4899" },
  { label: "Projects", icon: <FolderOpen size={22} />, to: "/projects", color: "#8b5cf6" },
  { label: "Profile", icon: <User size={22} />, to: "/profile", color: "#10b981" },
  { label: "Settings", icon: <Settings size={22} />, to: "/settings", color: "#f59e0b" },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { myEvents } = useMyEvents();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [greeting, setGreeting] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const stats = {
    eventsTotal: MOCK_DATA.filter(d => d.type === "Event").length,
    eventsCreated: MOCK_DATA.filter(d => d.type === "Event" && d.participationType === "Hosted").length,
    eventsJoined: MOCK_DATA.filter(d => d.type === "Event" && d.participationType === "Registered").length,
    hackathonsTotal: MOCK_DATA.filter(d => d.type === "Hackathon").length,
    hackathonsHosted: MOCK_DATA.filter(d => d.type === "Hackathon" && d.participationType === "Hosted").length,
    hackathonsJoined: MOCK_DATA.filter(d => d.type === "Hackathon" && d.participationType === "Registered").length,
    projectsTotal: MOCK_DATA.filter(d => d.type === "Project").length,
    projectsDone: MOCK_DATA.filter(d => d.type === "Project" && d.projectStatus === "Done").length,
    projectsActive: MOCK_DATA.filter(d => d.type === "Project" && d.projectStatus !== "Done").length,
  };

  const upcomingEvents = MOCK_DATA.filter(d => d.type === "Event" && d.status === "Upcoming");
  const upcomingHackathons = MOCK_DATA.filter(d => d.type === "Hackathon" && d.status === "Upcoming");
  const activeProjects = MOCK_DATA.filter(d => d.type === "Project" && d.projectStatus !== "Done");

  const filteredData = MOCK_DATA.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
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
  });

  const notifications = [
    { id: 1, text: "React Conference 2025 registration opens soon", time: "2h ago", unread: true },
    { id: 2, text: "Global AI Hackathon team registration open", time: "1d ago", unread: true },
    { id: 3, text: "Student Gradesheet App updated by collaborator", time: "2d ago", unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="ud-root">
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-brand">
          <div className="ud-brand-dot" />
          <span>Eventra</span>
        </div>

        <nav className="ud-nav">
          {[
            { id: "overview", icon: <Activity size={18} />, label: "Overview" },
            { id: "my-events", icon: <Ticket size={18} />, label: "My Events", badge: myEvents.length || null },
            { id: "events", icon: <Calendar size={18} />, label: "Events" },
            { id: "hackathons", icon: <Trophy size={18} />, label: "Hackathons" },
            { id: "projects", icon: <FolderOpen size={18} />, label: "Projects" },
            { id: "registrations", icon: <Users size={18} />, label: "Registrations" },
          ].map(item => (
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
        </nav>

        <div className="ud-sidebar-bottom">
          <Link to="/profile" className="ud-nav-item">
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
                    transition={{ duration: 0.18 }}
                  >
                    <div className="ud-notif-header">
                      <span>Notifications</span>
                      <button onClick={() => setNotifOpen(false)} aria-label="Close notification panel"><X size={14} /></button>
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

        <AnimatePresence mode="wait">
          {/* Overview */}
          {activeTab === "overview" && (
            <motion.div key="overview" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="ud-content">
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
              <motion.div variants={stagger} className="ud-stats-grid">
                {[
                  { label: "Events", value: stats.eventsTotal, sub: `${stats.eventsCreated} hosted · ${stats.eventsJoined} joined`, icon: <Calendar size={20} />, accent: "#6366f1" },
                  { label: "Hackathons", value: stats.hackathonsTotal, sub: `${stats.hackathonsHosted} hosted · ${stats.hackathonsJoined} joined`, icon: <Trophy size={20} />, accent: "#ec4899" },
                  { label: "Projects", value: stats.projectsTotal, sub: `${stats.projectsDone} done · ${stats.projectsActive} active`, icon: <FolderOpen size={20} />, accent: "#8b5cf6" },
                  { label: "Upcoming", value: upcomingEvents.length + upcomingHackathons.length, sub: `${upcomingEvents.length} events · ${upcomingHackathons.length} hackathons`, icon: <Clock size={20} />, accent: "#10b981" },
                ].map((s, i) => (
                  <motion.div key={s.label} custom={i} variants={fadeUp} className="ud-stat-card">
                    <div className="ud-stat-icon" style={{ background: s.accent + "18", color: s.accent }}>{s.icon}</div>
                    <div className="ud-stat-info">
                      <p className="ud-stat-label">{s.label}</p>
                      <p className="ud-stat-value">{s.value}</p>
                      <p className="ud-stat-sub">{s.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.section custom={1} variants={fadeUp}>
                <h2 className="ud-section-title"><Zap size={17} /> Quick Actions</h2>
                <div className="ud-quick-grid">
                  {QUICK_ACTIONS.map(a => (
                    <Link key={a.label} to={a.to} className="ud-quick-card" style={{ "--qa-color": a.color }}>
                      <span className="ud-quick-icon" style={{ color: a.color, background: a.color + "18" }}>{a.icon}</span>
                      <span className="ud-quick-label">{a.label}</span>
                      <ChevronRight size={14} className="ud-quick-arrow" />
                    </Link>
                  ))}
                  <Link to="/create-event" className="ud-quick-card ud-quick-new" style={{ "--qa-color": "#6366f1" }}>
                    <span className="ud-quick-icon" style={{ color: "#6366f1", background: "#6366f118" }}><Plus size={22} /></span>
                    <span className="ud-quick-label">New Event</span>
                    <ChevronRight size={14} className="ud-quick-arrow" />
                  </Link>
                </div>
              </motion.section>

              <div className="ud-three-col">
                {/* Upcoming Events */}
                <motion.section custom={2} variants={fadeUp} className="ud-card">
                  <div className="ud-card-head">
                    <span className="ud-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}><Clock size={16} /></span>
                    <h3>Upcoming Events</h3>
                    <Link to="/events" className="ud-card-link">See all <ChevronRight size={13} /></Link>
                  </div>
                  {upcomingEvents.length === 0
                    ? <p className="ud-empty">No upcoming events.</p>
                    : upcomingEvents.map(ev => (
                      <div key={ev.id} className="ud-list-item">
                        <div>
                          <p className="ud-list-title">{ev.title}</p>
                          <p className="ud-list-meta"><Calendar size={12} /> {ev.date} · <MapPin size={12} /> {ev.location}</p>
                        </div>
                        {/* ✅ StatusBadge replaces ud-badge span */}
                        <StatusBadge status={ev.participationType} />
                      </div>
                    ))
                  }
                </motion.section>

                {/* Upcoming Hackathons */}
                <motion.section custom={3} variants={fadeUp} className="ud-card">
                  <div className="ud-card-head">
                    <span className="ud-card-icon" style={{ background: "#ec489918", color: "#ec4899" }}><Trophy size={16} /></span>
                    <h3>Upcoming Hackathons</h3>
                    <Link to="/hackathons" className="ud-card-link">See all <ChevronRight size={13} /></Link>
                  </div>
                  {upcomingHackathons.length === 0
                    ? <p className="ud-empty">No upcoming hackathons.</p>
                    : upcomingHackathons.map(h => (
                      <div key={h.id} className="ud-list-item">
                        <div>
                          <p className="ud-list-title">{h.title}</p>
                          <p className="ud-list-meta"><Calendar size={12} /> {h.date} · <MapPin size={12} /> {h.location}</p>
                        </div>
                        <StatusBadge status={h.participationType} />
                      </div>
                    ))
                  }
                </motion.section>

                {/* Active Projects */}
                <motion.section custom={4} variants={fadeUp} className="ud-card">
                  <div className="ud-card-head">
                    <span className="ud-card-icon" style={{ background: "#8b5cf618", color: "#8b5cf6" }}><FolderOpen size={16} /></span>
                    <h3>Active Projects</h3>
                    <Link to="/projects" className="ud-card-link">See all <ChevronRight size={13} /></Link>
                  </div>
                  {activeProjects.length === 0
                    ? <p className="ud-empty">No active projects.</p>
                    : activeProjects.map(p => (
                      <div key={p.id} className="ud-list-item">
                        <div>
                          <p className="ud-list-title">{p.title}</p>
                          <p className="ud-list-meta">Updated: {p.lastUpdate}</p>
                        </div>
                        <StatusBadge status={p.projectStatus} />
                      </div>
                    ))
                  }
                </motion.section>
              </div>
                </>
              )}
            </motion.div>
          )}

          {/* My Events tab */}
          {activeTab === "my-events" && <MyEventsTab />}

          {/* Events tab */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
              <div className="ud-tab-header">
                <h2 className="ud-page-title"><Calendar size={20} /> My Events</h2>
                <Link to="/events" className="ud-btn-primary"><Plus size={15} /> Explore Events</Link>
              </div>
              <div className="ud-items-grid">
                {loading
                  ? [...Array(3)].map((_, i) => <DashboardItemCardSkeleton key={i} />)
                  : MOCK_DATA.filter(d => d.type === "Event").map((ev, i) => (
                  <motion.div key={ev.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="ud-item-card">
                    <div className="ud-item-top">
                      <span className="ud-item-type" style={{ background: "#6366f118", color: "#6366f1" }}><Calendar size={13} /> Event</span>
                      <StatusBadge status={ev.status} />
                    </div>
                    <h3 className="ud-item-title">{ev.title}</h3>
                    <div className="ud-item-meta">
                      <span><Calendar size={13} /> {ev.date}</span>
                      <span><MapPin size={13} /> {ev.location}</span>
                    </div>
                    <div className="ud-item-footer">
                      <StatusBadge status={ev.participationType} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Hackathons tab */}
          {activeTab === "hackathons" && (
            <motion.div key="hackathons" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
              <div className="ud-tab-header">
                <h2 className="ud-page-title"><Trophy size={20} /> My Hackathons</h2>
                <Link to="/hackathons" className="ud-btn-primary"><Plus size={15} /> Explore Hackathons</Link>
              </div>
              <div className="ud-items-grid">
                {loading
                  ? [...Array(3)].map((_, i) => <DashboardItemCardSkeleton key={i} />)
                  : MOCK_DATA.filter(d => d.type === "Hackathon").map((h, i) => (
                  <motion.div key={h.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="ud-item-card">
                    <div className="ud-item-top">
                      <span className="ud-item-type" style={{ background: "#ec489918", color: "#ec4899" }}><Trophy size={13} /> Hackathon</span>
                      <StatusBadge status={h.status} />
                    </div>
                    <h3 className="ud-item-title">{h.title}</h3>
                    <div className="ud-item-meta">
                      <span><Calendar size={13} /> {h.date}</span>
                      <span><MapPin size={13} /> {h.location}</span>
                    </div>
                    <div className="ud-item-footer">
                      <StatusBadge status={h.participationType} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Projects tab */}
          {activeTab === "projects" && (
            <motion.div key="projects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
              <div className="ud-tab-header">
                <h2 className="ud-page-title"><FolderOpen size={20} /> My Projects</h2>
                <Link to="/submit-project" className="ud-btn-primary"><Plus size={15} /> Submit Project</Link>
              </div>
              <div className="ud-items-grid">
                {loading
                  ? [...Array(2)].map((_, i) => <DashboardItemCardSkeleton key={i} />)
                  : MOCK_DATA.filter(d => d.type === "Project").map((p, i) => (
                  <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="ud-item-card">
                    <div className="ud-item-top">
                      <span className="ud-item-type" style={{ background: "#8b5cf618", color: "#8b5cf6" }}><FolderOpen size={13} /> Project</span>
                      <StatusBadge status={p.projectStatus} />
                    </div>
                    <h3 className="ud-item-title">{p.title}</h3>
                    <div className="ud-item-meta">
                      <span>Updated: {p.lastUpdate}</span>
                    </div>
                    <div className="ud-item-footer">
                      <StatusBadge status={p.participationType} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Registrations tab */}
          {activeTab === "registrations" && (
            <motion.div key="registrations" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-content">
              <div className="ud-tab-header">
                <h2 className="ud-page-title"><Users size={20} /> All Registrations</h2>
                <div className="ud-filter-row">
                  <select className="ud-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {["All", "Event", "Hackathon", "Project"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select className="ud-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    {["All", "Upcoming", "Completed", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <DashboardTableSkeleton rows={6} />
              ) : (
              <div className="ud-table-wrap">
                <table className="ud-table">
                  <thead>
                    <tr>
                      <th>Type</th><th>Title</th><th>Date</th><th>Location / Info</th><th>Status</th><th>Participation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0
                      ? <tr><td colSpan={6} className="ud-table-empty">No records match your filters.</td></tr>
                      : filteredData.map(item => (
                        <tr key={item.id}>
                          <td><span className="ud-table-type">{TYPE_ICON[item.type]}{item.type}</span></td>
                          <td className="ud-table-title" title={item.title}>{item.title}</td>
                          <td>{item.date || "—"}</td>
                          <td title={item.location || item.lastUpdate || "—"}>{item.location || item.lastUpdate || "—"}</td>
                          <td>
                            <StatusBadge status={item.projectStatus !== "-" ? item.projectStatus : item.status} />
                          </td>
                          <td>
                            <StatusBadge status={item.participationType} />
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}