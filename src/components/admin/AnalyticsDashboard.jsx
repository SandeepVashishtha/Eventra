import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Play, 
  Zap, 
  Database,
  BarChart2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Server,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Users, Clock, TrendingUp, Activity, CheckCircle2, Play, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { toast } from "react-toastify";
import { useAnalyticsStream, SSE_STATUS } from "../../context/RealTimeContext";
import BudgetPlanner from "./BudgetPlanner";

// =========================================================================
// CONSTANTS & CORE MOCK DATASOURCES
// =========================================================================
const MOCK_CHECKINS = [
  {
    id: "c1",
    name: "Ananya Iyer",
    event: "Web Dev Workshop",
    time: "2 mins ago",
    status: "Verified",
  },
  {
    id: "c2",
    name: "Kunal Sen",
    event: "AI & ML Bootcamp",
    time: "5 mins ago",
    status: "Verified",
  },
  {
    id: "c3",
    name: "Sara Khan",
    event: "React Conference 2025",
    time: "12 mins ago",
    status: "Verified",
  },
  {
    id: "c4",
    name: "Neil Verma",
    event: "Hack for Sustainability",
    time: "18 mins ago",
    status: "Flagged",
  },
  {
    id: "c5",
    name: "Diya Roy",
    event: "Global AI Hackathon",
    time: "24 mins ago",
    status: "Verified",
  },
];

const INITIAL_HOURLY_DATA = [
  { hour: "09:00", checkins: 12 },
  { hour: "10:00", checkins: 28 },
  { hour: "11:00", checkins: 45 },
  { hour: "12:00", checkins: 30 },
  { hour: "13:00", checkins: 58 },
  { hour: "14:00", checkins: 72 },
  { hour: "15:00", checkins: 65 },
  { hour: "16:00", checkins: 88 },
];

const MOCK_CATEGORY_DATA = [
  { name: "Coding", value: 340, color: "#6366f1" },
  { name: "Design", value: 180, color: "#ec4899" },
  { name: "AI/ML", value: 290, color: "#10b981" },
  { name: "Web3", value: 110, color: "#f59e0b" },
];

const LOCAL_STORAGE_KEY = "eventra_checkins";

// =========================================================================
// HIGH-DENSITY DECOUPLED MOCK DATA ADAPTER (SIMULATION ENGINE)
// =========================================================================
/**
 * Isolated payload generator ensuring visual graphs are decoupled
 * from the local state generation mechanisms.
 */
const generateMockCheckinPayload = (isManual = false) => {
  const checkinNames = [
    "Aditya Rao", "Ishaan Roy", "Meera Nair", "Rohan Das", "Zoya Ali",
    "Aryan Joshi", "Tanya Sen", "Kabir Dutt", "Riya Pillai", "Aravind Swami"
  ];
  const simulatorNames = ["Gaurav Kumar", "Shruti Shah", "Manish Pandey", "Pooja Hegde"];
  
  const checkinEvents = [
    "Web Dev Workshop", "Global AI Hackathon", "AI & ML Bootcamp",
    "React Conference 2025", "Hack for Sustainability"
  ];

  const pool = isManual ? simulatorNames : checkinNames;
  const randomName = pool[Math.floor(Math.random() * pool.length)] || "Anonymous Attendee";
  const randomEvent = isManual ? "Global AI Hackathon" : (checkinEvents[Math.floor(Math.random() * checkinEvents.length)] || "Tech Summit");
  const randomStatus = isManual ? "Verified" : (Math.random() > 0.08 ? "Verified" : "Flagged");
  const hourlyIncrement = isManual ? 3 : 1;

  return {
    id: isManual ? `c-manual-${Date.now()}` : `c-${Date.now()}`,
    name: randomName,
    event: randomEvent,
    time: "Just now",
    status: randomStatus,
    meta: {
      hourlyIncrement,
      velocityDelta: parseFloat((Math.random() * 0.4 - 0.2).toFixed(1))
    }
  };
};

// =========================================================================
// DECOUPLED SUB-COMPONENTS FOR ENHANCED MODULAR QUALITY
// =========================================================================
const AnalyticsStreamBadge = memo(({ status }) => {
  if (status === SSE_STATUS.CONNECTED) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/40 dark:border-emerald-800/30">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        SSE Live Connected
      </span>
    );
  }
  if (status === SSE_STATUS.RECONNECTING) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/40 dark:border-amber-800/30">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        Reconnecting Stream
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-800/40">
      <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
      Local Simulation
    </span>
  );
});

AnalyticsStreamBadge.displayName = "AnalyticsStreamBadge";

const MetricStatCard = memo(({ label, value, sub, icon, color }) => {
  return (
    <div className="p-5 transition bg-white border shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 rounded-2xl hover:shadow-md transform hover:-translate-y-0.5 duration-200">
      <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3 shadow-inner`}>{icon}</div>
      <p className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-850 dark:text-slate-100">
        {value !== undefined && value !== null ? value : 0}
      </h4>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-450 dark:text-slate-400 font-medium">
        <span>{sub}</span>
      </div>
    </div>
  );
});

MetricStatCard.displayName = "MetricStatCard";

const DashboardEmptyState = memo(({ title = "No Metrics Available", message = "No data elements detected in current pipeline registry bounds." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 py-14 text-center bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 my-2">
      <Database className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3 animate-bounce" />
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
});

DashboardEmptyState.displayName = "DashboardEmptyState";

// =========================================================================
// MAIN ADMINISTRATIVE ANALYTICS ENGINE
// =========================================================================
const AnalyticsDashboard = () => {
  // Failsafe configuration parsing to extract local cache elements safely
  const getInitialCheckins = () => {
    try {
      const savedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      
      if (Array.isArray(saved) && saved.length > 0) {
        const validatedArray = saved.filter(item => item && typeof item === "object");
        const combined = [...validatedArray.slice(0, 5), ...MOCK_CHECKINS].slice(0, 5);
        return combined;
      }
    } catch (e) {
      console.error("Failsafe system: Core localStorage metrics data is corrupted or unreachable.", e);
    }
    return MOCK_CHECKINS;
  };

  const getInitialLiveCount = () => {
    try {
      const savedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      
      if (Array.isArray(saved)) {
        const verifiedScansCount = saved.filter((c) => c && c.status === "Verified").length;
        return 342 + verifiedScansCount;
      }
    } catch (e) {
      return 342;
    }
    return 342;
  };

  // State Declarations with explicit fallbacks to prevent empty rendering exceptions
  const [checkins, setCheckins] = useState(getInitialCheckins);
  const [hourlyData, setHourlyData] = useState(INITIAL_HOURLY_DATA || []);
  const [liveCount, setLiveCount] = useState(getInitialLiveCount);
  const [activeCheckinsPerMinute, setActiveCheckinsPerMinute] = useState(5.4);
  const [isRefreshing, setIsRefreshing] = useState(false);
const [activeTab, setActiveTab] = useState('analytics');

  // Real-time Context Hooks with high security checks to catch undefined structures
  const streamContext = useAnalyticsStream();
  const streamCheckins = streamContext?.recentCheckins ?? [];
  const streamStatus = streamContext?.status ?? SSE_STATUS.DISCONNECTED;
  
  const isStreamActive = streamStatus === SSE_STATUS.CONNECTED;
  const lastStreamCheckinRef = useRef(null);

  /**
   * 🛠️ CORE STATE PROCESSOR PIPELINE
   * Encapsulates data modification updates securely while handling potential empty array crashes.
   */
  const processIncomingCheckin = useCallback((checkinPayload) => {
    if (!checkinPayload || typeof checkinPayload !== "object") {
      console.warn("Pipeline Rejector: Received an invalid or undefined data entry payload framework.");
      return;
    }

    // Explicit fallback definition bounds
    const cleanCheckinData = {
      id: checkinPayload?.id ?? `c-generated-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: checkinPayload?.name ?? "Anonymous Attendee",
      event: checkinPayload?.event ?? "Eventra Platform Portal",
      time: checkinPayload?.time ?? "Just now",
      status: checkinPayload?.status === "Flagged" ? "Flagged" : "Verified"
    };

    const hourlyIncrement = Number(checkinPayload?.meta?.hourlyIncrement) || 1;
    const velocityDelta = Number(checkinPayload?.meta?.velocityDelta) ?? parseFloat((Math.random() * 0.4 - 0.2).toFixed(1));

    // 1. Safe state modifier appending records onto local checkin grids
    setCheckins((prev) => {
      const sanitizedPrev = Array.isArray(prev) ? prev : [];
      return [cleanCheckinData, ...sanitizedPrev.slice(0, 4)];
    });

    // 2. Safely modulate overall attendee counting states
    setLiveCount((prev) => {
      const currentCount = Number(prev) || 0;
      return currentCount + hourlyIncrement;
    });

    // 3. Compute real-time stream velocity adjustments safely
    setActiveCheckinsPerMinute((prev) => {
      const currentVelocity = Number(prev) || 5.0;
      const targetVelocity = parseFloat((currentVelocity + velocityDelta).toFixed(1));
      return targetVelocity > 0 ? targetVelocity : 1.2;
    });

    // 4. Update Area Chart points without breaking indexing array constraints
    setHourlyData((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) {
        return INITIAL_HOURLY_DATA;
      }
      const updatedGraph = [...prev];
      const targetIndex = updatedGraph.length - 1;
      
      if (targetIndex >= 0 && updatedGraph[targetIndex]) {
        updatedGraph[targetIndex] = {
          ...updatedGraph[targetIndex],
          checkins: (Number(updatedGraph[targetIndex].checkins) || 0) + hourlyIncrement
        };
      }
      return updatedGraph;
    });

    // 5. Fire toast notifications safely based on user entry statuses
    if (cleanCheckinData.status === "Flagged") {
      toast.warning(`⚠️ Security Alert: Flagged entry attempt from ${cleanCheckinData.name}`);
    } else if (cleanCheckinData.id?.toString().includes("manual")) {
      toast.success(`🚀 Simulator: Successfully injected real-time check-in record for ${cleanCheckinData.name}!`);
    } else {
      toast.info(`🔔 Check-in Verified: ${cleanCheckinData.name} matched safely.`);
    }
  }, []);

  // Sync real-time stream check-ins with safe optional chaining limits
  useEffect(() => {
    if (!Array.isArray(streamCheckins) || streamCheckins.length === 0) return;
    
    // Explicit index array-bound validation to circumvent white screen crash
    const latestRecord = streamCheckins?.[0];
    if (!latestRecord || latestRecord === lastStreamCheckinRef.current) return;
    
    lastStreamCheckinRef.current = latestRecord;
    processIncomingCheckin(latestRecord);
  }, [streamCheckins, processIncomingCheckin]);

  // Automated fallback intervals simulating high traffic counts when backend stream is down
  useEffect(() => {
    if (isStreamActive) return;

    const autoInterval = setInterval(() => {
      try {
        const payload = generateMockCheckinPayload(false);
        processIncomingCheckin(payload);
      } catch (err) {
        console.error("Critical Interception: Simulation processing loop failed safely.", err);
      }
    }, 12000);

    return () => clearInterval(autoInterval);
  }, [isStreamActive, processIncomingCheckin]);

  // Handle manual dashboard triggers
  const triggerManualCheckin = useCallback(() => {
    try {
      const simulatedPayload = generateMockCheckinPayload(true);
      processIncomingCheckin(simulatedPayload);
    } catch (e) {
      toast.error("Failed to execute manual telemetry entry simulator injection.");
    }
  }, [processIncomingCheckin]);

  // Soft refresh simulation for administration actions
  const refreshMetricsDashboard = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("All operational metric pipelines flushed and verified successfully.");
    }, 600);
  }, []);

  // Safely compute statistics checks to handle potential empty configurations
  const structuralCheckinsList = useMemo(() => Array.isArray(checkins) ? checkins : [], [checkins]);
  const structuralHourlyData = useMemo(() => Array.isArray(hourlyData) ? hourlyData : [], [hourlyData]);
  const structuralCategoryData = useMemo(() => Array.isArray(MOCK_CATEGORY_DATA) ? MOCK_CATEGORY_DATA : [], []);

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 master-analytics-dashboard-view">
      
      {/* ADMINISTRATIVE TOP TITLE BAR */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">

    <div className="space-y-8 text-slate-800 dark:text-slate-100">
  {/* Tab Navigation */}
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => setActiveTab('analytics')}
      className={`px-4 py-2 rounded ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
    >
      Analytics
    </button>
    <button
      onClick={() => setActiveTab('budget')}
      className={`px-4 py-2 rounded ${activeTab === 'budget' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
    >
      Budget
    </button>
  </div>
  {activeTab === 'budget' ? (
    <BudgetPlanner />
  ) : (
    // Original analytics UI starts here
    <>
      {/* CONTROL BANNER */}
      <div className="flex flex-col gap-4 p-5 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            Live Event Control Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time monitoring panel tracing active digital tokens, entrance gate velocity, and infrastructure stability vectors.
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <button
            onClick={refreshMetricsDashboard}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 transition disabled:opacity-50"
            aria-label="Refresh Data Pipeline Link"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          
          <div className="bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/30 flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Node Cluster: Auth-01</span>
          </div>
        </div>
      </div>

      {/* CORE SIMULATOR TELEMETRY BANNER CONTAINER */}
      <div className="flex flex-col gap-4 p-5 bg-white border shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <h3 className="text-sm font-extrabold tracking-widest uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            Simulate Attendee Traffic Channels
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Trigger simulated QR validation passes, credential parsing sweeps, and data pipeline load tests to evaluate component re-rendering capacities under heavy stress.
          </p>
        </div>
        <button
          onClick={triggerManualCheckin}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md transition self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 transform active:scale-95 duration-100"
          aria-label="Trigger Injected Flow Record Button"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Trigger Check-in Scan
        </button>
      </div>

      {/* RENDER CRASH SAFE METRICS GRIDS OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 dashboard-metrics-stat-grid">
        <MetricStatCard 
          label="Total Checked-In Scans"
          value={liveCount}
          sub="Aggregated platform database entries"
          icon={<Users className="w-5 h-5" />}
          color="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
        />
        <MetricStatCard 
          label="Ingestion Velocity"
          value={`${activeCheckinsPerMinute}/min`}
          sub="Active network token evaluations"
          icon={<Activity className="w-5 h-5" />}
          color="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
        />
        <MetricStatCard 
          label="Uptime Monitor"
          value="08h 24m"
          sub="Continuous node validation log runtime"
          icon={<Clock className="w-5 h-5" />}
          color="text-amber-500 bg-amber-50 dark:bg-amber-950/40"
        />
        <MetricStatCard 
          label="System Health Grade"
          value={structuralCheckinsList.length === 0 ? "85.0%" : "99.8%"}
          sub="Failsafe pipeline error rate zero"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="text-rose-500 bg-rose-50 dark:bg-rose-950/40"
        />
      </div>

      {/* ANALYTICS VISUALIZATION RECHARTS LAYOUT FRAMEWORK */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 visual-charts-layer-row">
        
        {/* AREA GRAPH: VELOCITY STREAM */}
        <div className="p-6 bg-white border shadow-sm lg:col-span-2 dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Check-In Velocity Graph (Live)
            </h3>
            {structuralHourlyData.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3" /> Peak 88
              </span>
            )}
          </div>

          <div className="w-full h-64 internal-chart-render-bounds">
            {structuralHourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={structuralHourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCheckinsPipeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="checkins" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCheckinsPipeline)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState 
                title="Velocity Coordinates Unallocated" 
                message="Hourly metric tracking maps cannot be loaded because data points are empty." 
              />
            )}
          </div>
        </div>

        {/* PIE CHART: CATEGORY MAPPING */}
        <div className="flex flex-col justify-between p-6 bg-white border shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 rounded-3xl">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              Category Registration Distribution
            </h3>

            <div className="flex items-center justify-center w-full h-44 system-pie-render-viewport">
              {structuralCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={structuralCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {structuralCategoryData.map((entry, index) => (
                        <Cell key={`cell-token-${index}`} fill={entry?.color ?? "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <DashboardEmptyState 
                  title="Distribution Vectors Empty" 
                  message="Proportional metrics are locked due to zero array tracking logs." 
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 category-legend-blocks">
            {structuralCategoryData.map((item, idx) => (
              <div
                key={`legend-item-${idx}`}
                className="flex items-center gap-2 p-2 border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 rounded-xl truncate"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ background: item?.color ?? "#414141" }} />
                <div className="truncate">
                  <div className="text-[10px] font-bold text-slate-400 truncate">{item?.name ?? "Segment"}</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {item?.value ?? 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FEED LEDGER: REAL-TIME SECURE ACTIVITY LOGGER LOG */}
      <div className="p-6 bg-white border shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 rounded-3xl event-activity-log-ledger-block">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Live Check-In Event Activity Log Ledger
          </span>
          <AnalyticsStreamBadge status={streamStatus} />
        </h3>

        <div className="mt-4 space-y-3 telemetry-feed-scroller-bounds">
          {structuralCheckinsList.length > 0 ? (
            structuralCheckinsList.map((checkin, index) => {
              if (!checkin) return null;
              
              const isEntryVerified = checkin?.status === "Verified";
              const firstLetterCharacter = checkin?.name ? checkin.name.charAt(0) : "A";
              
              return (
                <div
                  key={checkin?.id ?? `checkin-row-${index}`}
                  className="flex items-center justify-between p-3 transition border bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-950 dark:hover:bg-slate-850/45 rounded-2xl border-slate-150 dark:border-slate-850 transform hover:scale-[1.005] duration-150"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="flex items-center justify-center w-8 h-8 text-xs font-black text-indigo-600 rounded-full bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0 select-none shadow-sm">
                      {firstLetterCharacter}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">
                        {checkin?.name ?? "Unknown Attendee"}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-medium">
                        {checkin?.event ?? "General Platform Context"} &bull; Token Registry Verification
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 font-semibold">{checkin?.time ?? "Just now"}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                        isEntryVerified
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/30"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 border border-rose-200/30"
                      }`}
                    >
                      {checkin?.status ?? "Verified"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <DashboardEmptyState 
              title="Activity Stream Ledger Blank" 
              message="No verification instances have passed into the data logging boundaries." 
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default memo(AnalyticsDashboard);
      </>
  )}
</div>
  );
};

export default AnalyticsDashboard;
