import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import {
  Globe,
  Users,
  Code,
  Activity,
  MapPin,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  X,
  Clock,
  TrendingUp,
  GitBranch,
  ExternalLink,
} from "lucide-react";

// ============ DATA ============
const HUBS = [
  {
    id: "sf",
    name: "San Francisco Hub",
    lat: "37.7749° N",
    lng: "122.4194° W",
    x: 180,
    y: 190,
    devs: 1420,
    projects: 12,
    activity: "High",
    timezone: "PST",
    region: "North America",
    categories: ["AI/ML", "Web3", "DevTools"],
  },
  {
    id: "ny",
    name: "New York Hub",
    lat: "40.7128° N",
    lng: "74.0060° W",
    x: 320,
    y: 175,
    devs: 980,
    projects: 8,
    activity: "Medium",
    timezone: "EST",
    region: "North America",
    categories: ["FinTech", "Media", "Enterprise"],
  },
  {
    id: "london",
    name: "London Hub",
    lat: "51.5074° N",
    lng: "0.1278° W",
    x: 480,
    y: 140,
    devs: 1150,
    projects: 14,
    activity: "High",
    timezone: "GMT",
    region: "Europe",
    categories: ["FinTech", "AI/ML", "HealthTech"],
  },
  {
    id: "frankfurt",
    name: "Frankfurt Hub",
    lat: "50.1109° N",
    lng: "8.6821° E",
    x: 520,
    y: 155,
    devs: 740,
    projects: 6,
    activity: "Medium",
    timezone: "CET",
    region: "Europe",
    categories: ["Enterprise", "IoT", "Security"],
  },
  {
    id: "bengaluru",
    name: "Bengaluru Hub",
    lat: "12.9716° N",
    lng: "77.5946° E",
    x: 720,
    y: 310,
    devs: 2450,
    projects: 28,
    activity: "Critical",
    timezone: "IST",
    region: "Asia",
    categories: ["Mobile", "AI/ML", "SaaS"],
  },
  {
    id: "singapore",
    name: "Singapore Hub",
    lat: "1.3521° N",
    lng: "103.8198° E",
    x: 790,
    y: 360,
    devs: 1100,
    projects: 11,
    activity: "High",
    timezone: "SGT",
    region: "Asia",
    categories: ["FinTech", "Logistics", "Web3"],
  },
  {
    id: "tokyo",
    name: "Tokyo Hub",
    lat: "35.6762° N",
    lng: "139.6503° E",
    x: 880,
    y: 200,
    devs: 850,
    projects: 9,
    activity: "High",
    timezone: "JST",
    region: "Asia",
    categories: ["Gaming", "Robotics", "IoT"],
  },
  {
    id: "sydney",
    name: "Sydney Hub",
    lat: "33.8688° S",
    lng: "151.2093° E",
    x: 900,
    y: 460,
    devs: 620,
    projects: 5,
    activity: "Medium",
    timezone: "AEST",
    region: "Oceania",
    categories: ["EdTech", "AgriTech", "HealthTech"],
  },
];

const CONNECTIONS = [
  { from: "sf", to: "ny", intensity: 0.8 },
  { from: "sf", to: "london", intensity: 0.9 },
  { from: "ny", to: "london", intensity: 0.7 },
  { from: "london", to: "frankfurt", intensity: 0.6 },
  { from: "frankfurt", to: "bengaluru", intensity: 0.75 },
  { from: "bengaluru", to: "singapore", intensity: 0.95 },
  { from: "singapore", to: "tokyo", intensity: 0.7 },
  { from: "tokyo", to: "sydney", intensity: 0.5 },
  { from: "singapore", to: "sydney", intensity: 0.6 },
  { from: "sf", to: "tokyo", intensity: 0.85 },
];

const ACTIVITY_LEVELS = {
  Critical: { color: "#8B5CF6", pulse: "rgba(139, 92, 246, 0.4)", label: "Critical" },
  High: { color: "#A78BFA", pulse: "rgba(167, 139, 250, 0.3)", label: "High" },
  Medium: { color: "#38BDF8", pulse: "rgba(56, 189, 248, 0.25)", label: "Medium" },
  Low: { color: "#34D399", pulse: "rgba(52, 211, 153, 0.2)", label: "Low" },
};

const REGIONS = ["All", "North America", "Europe", "Asia", "Oceania"];

// ============ UTILITY FUNCTIONS ============
const getHubSize = (devs) => Math.max(5, Math.min(13, devs / 220));
const getConnectionWidth = (intensity) => 1.2 + intensity * 2;
const formatTimeInZone = (timezone) => {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone:
        timezone === "PST"
          ? "America/Los_Angeles"
          : timezone === "EST"
            ? "America/New_York"
            : timezone === "GMT"
              ? "Europe/London"
              : timezone === "CET"
                ? "Europe/Berlin"
                : timezone === "IST"
                  ? "Asia/Kolkata"
                  : timezone === "SGT"
                    ? "Asia/Singapore"
                    : timezone === "JST"
                      ? "Asia/Tokyo"
                      : timezone === "AEST"
                        ? "Australia/Sydney"
                        : "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "--:--";
  }
};

// ============ PARTICLE ANIMATION COMPONENT ============
const ConnectionParticle = ({ path, color, delay }) => (
  <motion.circle
    r="2.5"
    fill={color}
    initial={{ offsetDistance: "0%", opacity: 0.9 }}
    animate={{ offsetDistance: "100%", opacity: 0.2 }}
    transition={{
      duration: 4 + Math.random() * 3,
      repeat: Infinity,
      ease: "linear",
      delay,
    }}
    style={{ offsetPath: `path("${path}")` }}
  />
);

// ============ MAIN COMPONENT ============
export default function CollaborationNetworkMap() {
  const prefersReducedMotion = useReducedMotion();
  const [activeHub, setActiveHub] = useState(null);
  const [pinnedHub, setPinnedHub] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState("All");
  const [zoom, setZoom] = useState(1);
  const [showConnections, setShowConnections] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(false);

  // Memoized computations
  const hubCoordinates = useMemo(() => {
    const map = {};
    HUBS.forEach((hub) => {
      map[hub.id] = { x: hub.x, y: hub.y };
    });
    return map;
  }, []);

  const filteredHubs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return HUBS.filter((hub) => {
      const matchesSearch =
        hub.name.toLowerCase().includes(q) ||
        hub.categories.some((c) => c.toLowerCase().includes(q));
      const matchesRegion = selectedRegion === "All" || hub.region === selectedRegion;
      const matchesActivity = selectedActivity === "All" || hub.activity === selectedActivity;
      return matchesSearch && matchesRegion && matchesActivity;
    });
  }, [searchQuery, selectedRegion, selectedActivity]);

  const visibleConnections = useMemo(() => {
    if (!showConnections) return [];
    return CONNECTIONS.filter(
      (conn) =>
        filteredHubs.some((h) => h.id === conn.from) && filteredHubs.some((h) => h.id === conn.to)
    );
  }, [showConnections, filteredHubs]);

  const stats = useMemo(
    () => ({
      totalDevs: HUBS.reduce((sum, h) => sum + h.devs, 0),
      totalProjects: HUBS.reduce((sum, h) => sum + h.projects, 0),
      activeHubs: HUBS.filter((h) => h.activity !== "Low").length,
      regions: [...new Set(HUBS.map((h) => h.region))].length,
    }),
    []
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setActiveHub(null);
        setPinnedHub(null);
      }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.2, 2));
      if (e.key === "-" || e.key === "_") setZoom((z) => Math.max(z - 0.2, 0.5));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const getCoordinates = useCallback(
    (id) => hubCoordinates[id] || { x: 0, y: 0 },
    [hubCoordinates]
  );

  const getPopupStyle = useCallback((hub) => {
    if (!hub) return {};
    const xPercent = (hub.x / 1000) * 100;
    const yPercent = (hub.y / 500) * 100;
    return { 
      left: `${xPercent}%`, 
      top: `${yPercent - 4}%`, 
      transform: "translate(-50%, -100%)" 
    };
  }, []);

  const handleHubClick = useCallback(
    (hub) => {
      if (pinnedHub?.id === hub.id) {
        setPinnedHub(null);
        setActiveHub(null);
      } else {
        setPinnedHub(hub);
        setActiveHub(hub);
      }
    },
    [pinnedHub]
  );

  const handleHubHover = useCallback(
    (hub) => {
      if (!pinnedHub) setActiveHub(hub);
    },
    [pinnedHub]
  );

  return (
    <section className="bg-white py-16 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative">
          {/* Header Controls */}
          <div className="relative mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
              <Globe className="h-4 w-4" />
              <span>Global Connectivity</span>
            </div>

            <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Global Collaboration Network
            </h2>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
              Real-time collaboration across {stats.totalDevs.toLocaleString()} developers in{" "}
              {stats.regions} active tech hubs.
            </p>

            {/* Filters Row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1 md:flex-none">
                <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hubs or technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none md:w-72 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="relative">
                <Filter size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-700 focus:border-violet-500/60 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  {["All", "Critical", "High", "Medium", "Low"].map((a) => (
                    <option key={a} value={a}>{a} Activity</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-sm text-slate-700 focus:border-violet-500/60 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region === "All" ? "All Regions" : region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-2 flex h-9 items-center gap-4 border-l border-slate-200 pl-4 dark:border-slate-800">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 select-none dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={showConnections}
                    onChange={(e) => setShowConnections(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-violet-600 focus:ring-violet-500/40 dark:border-slate-700"
                  />
                  <span>Connections</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 select-none dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={particlesEnabled}
                    onChange={(e) => setParticlesEnabled(e.target.checked)}
                    disabled={prefersReducedMotion}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-violet-600 focus:ring-violet-500/40 disabled:opacity-40 dark:border-slate-700"
                  />
                  <span>Particles</span>
                </label>
              </div>
            </div>
          </div>

          {/* Metrics Row Wrapper Panel */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-3xl border border-violet-100/60 bg-violet-50/50 p-4 md:grid-cols-4 dark:border-violet-900/30 dark:bg-violet-950/20">
            {[
              { label: "Developers", value: stats.totalDevs.toLocaleString(), icon: Users, color: "text-violet-600 dark:text-violet-400" },
              { label: "Projects", value: stats.totalProjects, icon: Code, color: "text-violet-600 dark:text-violet-400" },
              { label: "Connections", value: CONNECTIONS.length, icon: GitBranch, color: "text-violet-600 dark:text-violet-400" },
              { label: "Active Hubs", value: `${stats.activeHubs}/${HUBS.length}`, icon: TrendingUp, color: "text-violet-600 dark:text-violet-400" }
            ].map((stat, i) => (
              /* MODIFIED: Added premium uniform violet borders and soft shadows to ALL metric cards */
              <div 
                key={i} 
                className="flex items-center gap-4 rounded-2xl border-2 border-violet-500 bg-white p-5 shadow-[0_0_15px_rgba(124,58,237,0.12)] transition-all duration-300 dark:bg-slate-900 dark:shadow-[0_0_20px_rgba(139,92,246,0.12)]"
              >
                <div className="metric-icon rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                  <stat.icon size={20} />
                </div>
                <div>
                  <span className="block text-2xl font-black tracking-tight text-violet-600 dark:text-violet-400">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Map Canvas Window Frame */}
          {/* MODIFIED: Replaced standard slate border with a gorgeous thick 2px violet border & custom ambient glow to elevate the graph */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-violet-500/80 bg-slate-50 shadow-[0_0_25px_rgba(124,58,237,0.08)] backdrop-blur-sm dark:bg-slate-950/40">
            <div 
              className="transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              <svg
                className="h-[440px] w-full mix-blend-multiply dark:mix-blend-normal"
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Global network nodes map"
              >
                <defs>
                  <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <pattern id="cnm-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" className="fill-slate-200 dark:fill-slate-800" />
                  </pattern>
                </defs>

                {/* Grid Background Overlay */}
                <rect width="100%" height="100%" fill="url(#cnm-grid)" />

                {/* SVG Connection Paths Render */}
                {visibleConnections.map((conn, idx) => {
                  const start = getCoordinates(conn.from);
                  const end = getCoordinates(conn.to);
                  const dx = end.x - start.x;
                  const dy = end.y - start.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  const dr = distance * 1.1;
                  const pathD = `M ${start.x} ${start.y} A ${dr} ${dr} 0 0,1 ${end.x} ${end.y}`;
                  const fromHub = HUBS.find((h) => h.id === conn.from);
                  const color = ACTIVITY_LEVELS[fromHub?.activity || "Medium"].color;

                  return (
                    <g key={`connection-${idx}`} className="opacity-75 dark:opacity-60">
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={getConnectionWidth(conn.intensity)}
                        className="opacity-25 dark:opacity-30"
                        strokeLinecap="round"
                      />
                      {particlesEnabled && !prefersReducedMotion && (
                        <ConnectionParticle path={pathD} color={color} delay={idx * 0.35} />
                      )}
                    </g>
                  );
                })}

                {/* Interactive SVG City Nodes mapping */}
                {filteredHubs.map((hub) => {
                  const isActive = activeHub?.id === hub.id || pinnedHub?.id === hub.id;
                  const isPinned = pinnedHub?.id === hub.id;
                  const config = ACTIVITY_LEVELS[hub.activity];
                  const hubSize = getHubSize(hub.devs);

                  return (
                    <g
                      key={hub.id}
                      className="cursor-pointer outline-none select-none"
                      onMouseEnter={() => handleHubHover(hub)}
                      onMouseLeave={() => !pinnedHub && setActiveHub(null)}
                      onClick={() => handleHubClick(hub)}
                      role="button"
                    >
                      {/* Interactive Pulse Waves */}
                      <motion.circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isActive ? hubSize + 16 : hubSize + 8}
                        fill="none"
                        stroke={config.pulse}
                        strokeWidth="1.5"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Neon Soft Backdrop Glow filter node */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={hubSize + 6}
                        fill={config.color}
                        filter="url(#hub-glow)"
                        opacity={isActive ? 0.6 : 0.2}
                      />

                      {/* Solid Core Dot */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isActive ? hubSize + 1.5 : hubSize}
                        fill={isActive ? config.color : "#0F172A"}
                        stroke={isActive ? "#FFFFFF" : config.color}
                        strokeWidth={isActive ? 2 : 2.5}
                        className="transition-all duration-200"
                      />

                      {/* Hub Label Tag */}
                      <text
                        x={hub.x}
                        y={hub.y + hubSize + 16}
                        textAnchor="middle"
                        className="pointer-events-none fill-slate-600 tracking-wide select-none dark:fill-slate-400"
                        fontSize="11"
                        fontWeight={isActive ? "700" : "500"}
                      >
                        {hub.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Absolute Fixed Map Floating Overlay Popup Component Card */}
            <AnimatePresence>
              {(activeHub || pinnedHub) && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-30 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  style={getPopupStyle(activeHub || pinnedHub)}
                >
                  {pinnedHub && (
                    <button
                      className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPinnedHub(null);
                        setActiveHub(null);
                      }}
                      aria-label="Close panel"
                    >
                      <X size={15} />
                    </button>
                  )}

                  {/* Node Identity Details */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 pr-6">
                      <MapPin className="shrink-0 text-violet-500" size={16} />
                      <h4 className="truncate text-base font-bold text-slate-900 dark:text-white">
                        {(activeHub || pinnedHub).name}
                      </h4>
                    </div>
                    
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{(activeHub || pinnedHub).lat} • {(activeHub || pinnedHub).lng}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {formatTimeInZone((activeHub || pinnedHub).timezone)}
                      </span>
                    </div>
                  </div>

                  {/* Micro Metric Stat Badges */}
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-transparent dark:bg-slate-800/40">
                      <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Developers</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {(activeHub || pinnedHub).devs.toLocaleString()}
                      </span>
                    </div>
                    <div className="dark:transparent rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:bg-slate-800/40">
                      <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">Projects</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {(activeHub || pinnedHub).projects}
                      </span>
                    </div>
                  </div>

                  {/* Core Tags array */}
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {(activeHub || pinnedHub).categories.map((cat) => (
                      <span key={cat} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Activity Status and View Info Anchor action triggers */}
                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Activity size={13} style={{ color: ACTIVITY_LEVELS[(activeHub || pinnedHub).activity].color }} />
                      <span className="text-xs font-bold" style={{ color: ACTIVITY_LEVELS[(activeHub || pinnedHub).activity].color }}>
                        {ACTIVITY_LEVELS[(activeHub || pinnedHub).activity].label}
                      </span>
                    </div>

                    <button className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 transition-opacity hover:opacity-80 dark:text-violet-400">
                      <span>View Details</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Interactive Scale Legends Footer metadata block */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-100 p-4 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-900/60 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Activity Legend</span>
              {Object.entries(ACTIVITY_LEVELS).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-slate-700 dark:text-slate-300">{config.label}</span>
                </div>
              ))}
            </div>

            <div className="shrink-0 text-slate-400 dark:text-slate-500">
              Canvas Frame Zoom State: <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}