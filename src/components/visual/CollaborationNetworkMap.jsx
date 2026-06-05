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
  Critical: { color: "#E0E9F2", pulse: "rgba(224,233,242,0.36)", label: "Critical" },
  High: { color: "#E0E9F2", pulse: "rgba(224,233,242,0.32)", label: "High" },
  Medium: { color: "#E0E9F2", pulse: "rgba(224,233,242,0.28)", label: "Medium" },
  Low: { color: "#E0E9F2", pulse: "rgba(224,233,242,0.18)", label: "Low" },
};

const REGIONS = ["All", "North America", "Europe", "Asia", "Oceania"];

// ============ UTILITY FUNCTIONS ============
const getHubSize = (devs) => Math.max(4, Math.min(12, devs / 200));
const getConnectionWidth = (intensity) => 1.5 + intensity * 2;
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
    r="2"
    fill={color}
    initial={{ offsetDistance: "0%", opacity: 0.7 }}
    animate={{ offsetDistance: "100%", opacity: 0.45 }}
    transition={{
      duration: 5 + Math.random() * 3,
      repeat: Infinity,
      ease: "linear",
      delay,
    }}
    style={{ offsetPath: `path("${path}")` }}
    opacity="0.65"
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
    let leftPercent = 0;
    let topPercent = 0;
    return { left: `${leftPercent}%`, top: `${topPercent}%`, transform: "translate(-50%, -100%)" };
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
    <section className="bg-white dark:bg-slate-950 py-12 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        {/* ── Glassmorphic outer card — wraps the entire module ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-950/70 dark:border-white/5">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
                <Globe className="h-4 w-4" />
                <span>Global Connectivity</span>
              </div>
              {/* Zoom controls — positioned relative to the card, not the page */}
              <div className="flex items-center gap-3">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:scale-105 hover:bg-violet-500"
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:scale-105 hover:bg-violet-500"
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white">
              Real-Time Global Collaboration Network
            </h2>
            <p className="max-w-2xl text-slate-400">
              Connecting {stats.totalDevs.toLocaleString()} developers across{" "}
              {stats.regions} regions in a unified ecosystem.
            </p>
          </div>

          {/* ── Filters row — glass pill container so inputs stand clear of the map ── */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 backdrop-blur-md">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search hubs or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-slate-600 bg-slate-900/70 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                aria-label="Search hubs"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-xl border border-slate-600 bg-slate-900/70 py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                aria-label="Filter by region"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region === "All" ? "All" : region}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Activity
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="rounded-xl border border-slate-600 bg-slate-900/70 py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                aria-label="Filter by activity"
              >
                {["All", "Critical", "High", "Medium", "Low"].map((a) => (
                  <option key={a} value={a}>
                    {a} Activity
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showConnections}
                onChange={(e) => setShowConnections(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-violet-500 focus:ring-2 focus:ring-violet-500 cursor-pointer"
              />
              <span>Connections</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={particlesEnabled}
                onChange={(e) => setParticlesEnabled(e.target.checked)}
                disabled={prefersReducedMotion}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-violet-500 focus:ring-2 focus:ring-violet-500 cursor-pointer disabled:opacity-40"
              />
              <span>Particles</span>
            </label>
          </div>

          {/* ── Stats Summary ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 shadow-inner backdrop-blur-sm">
              <Users size={18} className="text-violet-400 shrink-0" />
              <div>
                <span className="block text-2xl font-bold text-emerald-400">
                  {stats.totalDevs.toLocaleString()}
                </span>
                <span className="mt-0.5 block text-xs uppercase tracking-wider text-slate-400">Developers</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 shadow-inner backdrop-blur-sm">
              <Code size={18} className="text-violet-400 shrink-0" />
              <div>
                <span className="block text-2xl font-bold text-emerald-400">
                  {stats.totalProjects}
                </span>
                <span className="mt-0.5 block text-xs uppercase tracking-wider text-slate-400">Projects</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 shadow-inner backdrop-blur-sm">
              <GitBranch size={18} className="text-violet-400 shrink-0" />
              <div>
                <span className="block text-2xl font-bold text-emerald-400">
                  {CONNECTIONS.length}
                </span>
                <span className="mt-0.5 block text-xs uppercase tracking-wider text-slate-400">Connections</span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5 shadow-inner backdrop-blur-sm">
              <TrendingUp size={18} className="text-violet-400 shrink-0" />
              <div>
                <span className="block text-2xl font-bold text-emerald-400">
                  {stats.activeHubs}/{HUBS.length}
                </span>
                <span className="mt-0.5 block text-xs uppercase tracking-wider text-slate-400">Active Hubs</span>
              </div>
            </div>
          </div>

          {/* ── Map Frame — z-0 keeps the SVG canvas below the filter/popup layer ── */}
          <div
            className="relative z-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          >
            <svg
              className="h-[420px] w-full"
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Global collaboration network map"
            >
              <defs>
                <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id="cnm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="rgba(224,233,242,0.06)" />
                </pattern>
                <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(224,233,242,0.6)" />
                  <stop offset="100%" stopColor="rgba(224,233,242,0.9)" />
                </linearGradient>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(224,233,242,0.5)" />
                </marker>
              </defs>

              {/* Background */}
              <rect width="100%" height="100%" fill="url(#cnm-grid)" rx="16" />

              {/* Connection Paths */}
              {visibleConnections.map((conn, idx) => {
                const start = getCoordinates(conn.from);
                const end = getCoordinates(conn.to);
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const dr = distance * 0.8;
                const pathD = `M ${start.x} ${start.y} A ${dr} ${dr} 0 0,1 ${end.x} ${end.y}`;
                const color =
                  ACTIVITY_LEVELS[HUBS.find((h) => h.id === conn.from)?.activity || "Medium"].color;

                return (
                  <g key={`connection-${idx}`} className="connection-group">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(224,233,242,0.5)"
                      strokeWidth={Math.max(0.8, getConnectionWidth(conn.intensity))}
                      strokeLinecap="round"
                    />
                    {particlesEnabled && !prefersReducedMotion && (
                      <ConnectionParticle path={pathD} color={color} delay={idx * 0.4} />
                    )}
                  </g>
                );
              })}

              {/* Hub Nodes */}
              {filteredHubs.map((hub) => {
                const isActive = activeHub?.id === hub.id || pinnedHub?.id === hub.id;
                const isPinned = pinnedHub?.id === hub.id;
                const config = ACTIVITY_LEVELS[hub.activity];
                const hubSize = getHubSize(hub.devs);

                return (
                  <g
                    key={hub.id}
                    className={`cnm-node-group ${isActive ? "active" : ""} ${isPinned ? "pinned" : ""}`}
                    onMouseEnter={() => handleHubHover(hub)}
                    onMouseLeave={() => !pinnedHub && setActiveHub(null)}
                    onClick={() => handleHubClick(hub)}
                    role="button"
                    aria-label={`${hub.name}, ${hub.devs} developers, ${hub.activity} activity`}
                    style={{ outline: "none", cursor: "pointer" }}
                  >
                    {/* Pulse ring */}
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r={isActive ? 32 : 22}
                      fill="none"
                      stroke={config.pulse}
                      strokeWidth="1.5"
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="node-pulse"
                    />
                    {/* Glow effect */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hubSize + 4}
                      fill={config.color}
                      filter="url(#hub-glow)"
                      opacity={isActive ? 0.8 : 0.4}
                      className="node-glow"
                    />
                    {/* Core node */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={hubSize}
                      fill="#1e293b"
                      stroke={config.color}
                      strokeWidth="2.5"
                      className="node-core"
                    />
                    {/* Pin indicator */}
                    {isPinned && (
                      <motion.path
                        d="M 0 -18 L 4 -10 L 2 -10 L 2 0 L -2 0 L -2 -10 L -4 -10 Z"
                        fill={config.color}
                        transform={`translate(${hub.x}, ${hub.y})`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                    {/* Label */}
                    <text
                      x={hub.x}
                      y={hub.y + hubSize + 18}
                      textAnchor="middle"
                      className="node-label"
                      fill="#cbd5e1"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {hub.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* ── Popup Card — z-50 ensures it renders above the SVG canvas ── */}
            <AnimatePresence>
              {(activeHub || pinnedHub) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 1 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`absolute left-4 top-4 z-50 w-72 rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl ${pinnedHub ? "pinned" : ""}`}
                >
                  {pinnedHub && (
                    <button
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPinnedHub(null);
                        setActiveHub(null);
                      }}
                      aria-label="Close popup"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-blue-400" size={18} />
                      <h4 className="text-base font-bold text-white">
                        {(activeHub || pinnedHub).name}
                      </h4>
                    </div>
                    <div className="mt-2 ml-7 text-xs text-slate-400 space-y-1">
                      <div>
                        {(activeHub || pinnedHub).lat} • {(activeHub || pinnedHub).lng}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} />
                        {formatTimeInZone((activeHub || pinnedHub).timezone)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-slate-800/70 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-xs text-slate-400">Developers</span>
                      </div>
                      <span className="block text-xl font-bold text-emerald-400">
                        {(activeHub || pinnedHub).devs.toLocaleString()}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-800/70 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-xs text-slate-400">Projects</span>
                      </div>
                      <span className="block text-xl font-bold text-emerald-400">
                        {(activeHub || pinnedHub).projects}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(activeHub || pinnedHub).categories.map((cat) => (
                      <span key={cat} className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-700/80 text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Activity</span>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-200">
                      <Activity size={12} />
                      {ACTIVITY_LEVELS[(activeHub || pinnedHub).activity].label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm font-medium text-slate-300">
                      {(activeHub || pinnedHub).region}
                    </span>
                    <button className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium">
                      <ExternalLink size={14} />
                      View Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer row: legend left, zoom indicator right ── */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {/* Activity legend — bottom-left */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="font-medium text-slate-300">Activity Levels</span>
              {Object.entries(ACTIVITY_LEVELS).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.pulse}` }}
                  />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>

            {/* Zoom indicator — bottom-right */}
            <div className="rounded-full border border-white/10 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm">
              Zoom: {Math.round(zoom * 100)}%
            </div>
          </div>

        </div>{/* end glass card */}
      </div>
    </section>
  );
}
