import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar, Trophy, FolderOpen, Settings,
  Clock, Zap, User, Plus, ChevronRight, CheckCircle2
} from "lucide-react";
import { getSmartDateLabel } from "../../utils/relativeTime";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";
import DashboardEmptyState from "./DashboardEmptyState";
import {
  DashboardListCardSkeleton,
  DashboardQuickActionSkeleton,
  DashboardSectionTitleSkeleton,
  DashboardStatCardSkeleton,
} from "../common/SkeletonLoaders";

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

const QUICK_ACTIONS = [
  { label: "Events", icon: <Calendar size={22} />, to: "/events", color: "#6366f1" },
  { label: "Hackathons", icon: <Trophy size={22} />, to: "/hackathons", color: "#ec4899" },
  { label: "Projects", icon: <FolderOpen size={22} />, to: "/projects", color: "#8b5cf6" },
  { label: "Profile", icon: <User size={22} />, to: "/dashboard/profile", color: "#10b981" },
  { label: "Settings", icon: <Settings size={22} />, to: "/settings", color: "#f59e0b" },
];

const processEvent = (d, counters, lists) => {
  counters.eventsTotal++;
  if (d.participationType === "Hosted") counters.eventsCreated++;
  if (d.participationType === "Registered") counters.eventsJoined++;
  if (d.status === "Upcoming") lists.upcomingEvents.push(d);
};

const processHackathon = (d, counters, lists) => {
  counters.hackathonsTotal++;
  if (d.participationType === "Hosted") counters.hackathonsHosted++;
  if (d.participationType === "Registered") counters.hackathonsJoined++;
  if (d.status === "Upcoming") lists.upcomingHackathons.push(d);
};

const processProject = (d, counters, lists) => {
  counters.projectsTotal++;
  if (d.projectStatus !== "Done") {
    counters.projectsActive++;
    lists.activeProjects.push(d);
  } else {
    counters.projectsDone++;
  }
};

export const getDerivedData = (data) => {
  const counters = {
    eventsTotal: 0, eventsCreated: 0, eventsJoined: 0,
    hackathonsTotal: 0, hackathonsHosted: 0, hackathonsJoined: 0,
    projectsTotal: 0, projectsDone: 0, projectsActive: 0,
  };
  const lists = { upcomingEvents: [], upcomingHackathons: [], activeProjects: [] };

  for (const d of data) {
    if (!d) continue;
    if (d.type === "Event") processEvent(d, counters, lists);
    else if (d.type === "Hackathon") processHackathon(d, counters, lists);
    else if (d.type === "Project") processProject(d, counters, lists);
  }

  return {
    stats: counters,
    upcomingEvents: lists.upcomingEvents,
    upcomingHackathons: lists.upcomingHackathons,
    activeProjects: lists.activeProjects,
  };
};

const DashboardOverviewSkeleton = () => (
  <>
    <div className="ud-stats-grid">
      {[...Array(5)].map((_, i) => (
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
);

const OverviewStatsGrid = ({ prefersReducedMotion, journeyStats }) => (
  <motion.div variants={stagger(prefersReducedMotion)} className="ud-stats-grid">
    {[
      { label: "Events Registered", value: journeyStats.eventsRegistered, sub: `${Math.max(journeyStats.eventsRegistered - journeyStats.eventsAttended, 0)} upcoming / registered`, icon: <Calendar size={20} />, accent: "#6366f1" },
      { label: "Events Attended", value: journeyStats.eventsAttended, sub: "Completed event participation", icon: <CheckCircle2 size={20} />, accent: "#10b981" },
      { label: "Hackathons Joined", value: journeyStats.hackathonsJoined, sub: "Hackathon registrations", icon: <Trophy size={20} />, accent: "#ec4899" },
      { label: "Saved Events", value: journeyStats.savedEvents, sub: "Events bookmarked to review", icon: <FolderOpen size={20} />, accent: "#f59e0b" },
      { label: "Upcoming Events", value: journeyStats.upcomingEvents, sub: "Next events on your schedule", icon: <Clock size={20} />, accent: "#0ea5e9" },
    ].map((s, i) => (
      <motion.div key={s.label} custom={i} variants={fadeUp(prefersReducedMotion)} className="ud-stat-card">
        <div className="ud-stat-icon" style={{ background: s.accent + "18", color: s.accent }}>{s.icon}</div>
        <div className="ud-stat-info">
          <p className="ud-stat-label">{s.label}</p>
          <p className="ud-stat-value">{s.value}</p>
          <p className="ud-stat-sub">{s.sub}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const OverviewQuickActions = ({ prefersReducedMotion }) => (
  <motion.section custom={1} variants={fadeUp(prefersReducedMotion)}>
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
);

const OverviewThreeCol = ({ prefersReducedMotion, upcomingEvents, upcomingHackathons, activeProjects, navigate }) => (
  <div className="ud-three-col">
    {/* Upcoming Events */}
    <motion.section custom={2} variants={fadeUp(prefersReducedMotion)} className="ud-card">
      <div className="ud-card-head">
        <span className="ud-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}><Clock size={16} /></span>
        <h3>Upcoming Events</h3>
        <Link to="/events" className="ud-card-link">See all <ChevronRight size={13} /></Link>
      </div>
      {upcomingEvents.length === 0 ? (
        <EmptyState compact={true} icon={<Calendar size={32} className="text-indigo-500" />} title="No Upcoming Events" message="You haven't registered or joined any events yet. Check out the Events tab to find one!" onBrowseAll={() => navigate("/events")} />
      ) : (
        upcomingEvents.map(ev => (
          <div key={ev.id} className="ud-list-item">
            <div className="min-w-0 flex-1">
              <p className="ud-list-title" title={ev.title}>{ev.title}</p>
              <p className="ud-list-meta"><Calendar size={12} /> {getSmartDateLabel(ev.date)}</p>
            </div>
            <StatusBadge status={ev.participationType} />
          </div>
        ))
      )}
    </motion.section>

    {/* Upcoming Hackathons */}
    <motion.section custom={3} variants={fadeUp(prefersReducedMotion)} className="ud-card">
      <div className="ud-card-head">
        <span className="ud-card-icon" style={{ background: "#ec489918", color: "#ec4899" }} />
        <h3>Upcoming Hackathons</h3>
        <Link to="/hackathons" className="ud-card-link">See all <ChevronRight size={14} /></Link>
      </div>
      {upcomingHackathons.length === 0 ? (
        <EmptyState compact={true} icon={<Trophy size={32} className="text-pink-500" />} title="No Active Hackathons" message="There are currently no upcoming hackathons in your schedule." onBrowseAll={() => navigate("/hackathons")} />
      ) : (
        upcomingHackathons.map(h => (
          <div key={h.id} className="ud-list-item">
            <div className="min-w-0 flex-1">
              <p className="ud-list-title" title={h.title}>{h.title}</p>
              <p className="ud-list-meta"><Calendar size={12} /> {getSmartDateLabel(h.date)}</p>
            </div>
            <StatusBadge status={h.participationType} />
          </div>
        ))
      )}
    </motion.section>

    {/* Active Projects */}
    <motion.section custom={4} variants={fadeUp(prefersReducedMotion)} className="ud-card">
      <div className="ud-card-head">
        <span className="ud-card-icon" style={{ background: "#8b5cf618", color: "#8b5cf6" }} />
        <h3>Active Projects</h3>
        <Link to="/projects" className="ud-card-link">See all <ChevronRight size={14} /></Link>
      </div>
      {activeProjects.length === 0 ? (
        <EmptyState compact={true} icon={<FolderOpen size={32} className="text-purple-500" />} title="No Active Projects" message="All your tracked development projects are currently completed or inactive." onBrowseAll={() => navigate("/projects")} />
      ) : (
        activeProjects.map(p => (
          <div key={p.id} className="ud-list-item">
            <div className="min-w-0 flex-1">
              <p className="ud-list-title" title={p.title}>{p.title}</p>
              <p className="ud-list-meta">Updated: {p.lastUpdate}</p>
            </div>
            <StatusBadge status={p.projectStatus} />
          </div>
        ))
      )}
    </motion.section>
  </div>
);

const DashboardOverview = ({ prefersReducedMotion, loading, journeyStats, upcomingEvents, upcomingHackathons, activeProjects, navigate }) => {
  return (
    <motion.div key="overview" variants={stagger(prefersReducedMotion)} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="ud-content">
      {loading ? (
        <DashboardOverviewSkeleton />
      ) : (
        <>
          {journeyStats.totalRegistrations === 0 && journeyStats.savedEvents === 0 ? (
            <DashboardEmptyState />
          ) : (
            <>
              <motion.section className="ud-journey-header" custom={0} variants={fadeUp(prefersReducedMotion)}>
                <div>
                  <p className="ud-journey-label">My Event Journey</p>
                  <p className="ud-journey-description">A centralized view of your event participation, attendance, saved events, hackathons joined, and upcoming schedule.</p>
                </div>
              </motion.section>

              <OverviewStatsGrid prefersReducedMotion={prefersReducedMotion} journeyStats={journeyStats} />
              
              <OverviewQuickActions prefersReducedMotion={prefersReducedMotion} />

              <OverviewThreeCol 
                prefersReducedMotion={prefersReducedMotion}
                upcomingEvents={upcomingEvents}
                upcomingHackathons={upcomingHackathons}
                activeProjects={activeProjects}
                navigate={navigate}
              />
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DashboardOverview;
