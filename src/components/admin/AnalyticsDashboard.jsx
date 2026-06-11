import { useState, useEffect, useRef, useCallback } from "react";
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
import { safeJsonParse } from "../../utils/safeJsonParse";
import useAnalytics from "../../hooks/useAnalytics";

// =========================================================================
// CONSTANTS & FALLBACK DATA
// =========================================================================
const MOCK_CHECKINS = [
  { id: "c1", name: "Ananya Iyer", event: "Web Dev Workshop", time: "2 mins ago", status: "Verified" },
  { id: "c2", name: "Kunal Sen", event: "AI & ML Bootcamp", time: "5 mins ago", status: "Verified" },
  { id: "c3", name: "Sara Khan", event: "React Conference 2025", time: "12 mins ago", status: "Verified" },
  { id: "c4", name: "Neil Verma", event: "Hack for Sustainability", time: "18 mins ago", status: "Flagged" },
  { id: "c5", name: "Diya Roy", event: "Global AI Hackathon", time: "24 mins ago", status: "Verified" },
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

const FALLBACK_CATEGORY_DATA = [
  { name: "Coding", value: 340, color: "#6366f1" },
  { name: "Design", value: 180, color: "#ec4899" },
  { name: "AI/ML", value: 290, color: "#10b981" },
  { name: "Web3", value: 110, color: "#f59e0b" },
];

// =========================================================================
// SUB-COMPONENTS
// =========================================================================
function AnalyticsStreamBadge({ status }) {
  if (status === SSE_STATUS.CONNECTED) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 normal-case dark:text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        SSE Live
      </span>
    );
  }
  if (status === SSE_STATUS.RECONNECTING) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 normal-case dark:text-amber-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Reconnecting
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 normal-case">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
      Simulated
    </span>
  );
}

const LOCAL_STORAGE_KEY = "eventra_checkins";

// Pure initializers — depend only on module-level constants, safe to define outside component
const getInitialCheckins = () => {
  const saved = safeJsonParse(localStorage.getItem(LOCAL_STORAGE_KEY), []);
  if (saved.length > 0) {
    const merged = [...saved.slice(0, 5), ...MOCK_CHECKINS].slice(0, 5);
    return merged;
  }
  return MOCK_CHECKINS;
};

const getInitialLiveCount = () => {
  const saved = safeJsonParse(localStorage.getItem(LOCAL_STORAGE_KEY), []);
  return 342 + saved.filter((c) => c.status === "Verified").length;
};

const AnalyticsDashboard = () => {
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const [checkins, setCheckins] = useState(getInitialCheckins);
  const [hourlyData, setHourlyData] = useState(INITIAL_HOURLY_DATA);
  const [liveCount, setLiveCount] = useState(getInitialLiveCount);
  const [activeCheckinsPerMinute, setActiveCheckinsPerMinute] = useState(5.4);
  const [activeTab, setActiveTab] = useState('analytics');

  const categoryData = analytics?.categoryBreakdown || FALLBACK_CATEGORY_DATA;

  // Real-time SSE stream — takes priority over local simulation when connected
  const { recentCheckins: streamCheckins, status: streamStatus } = useAnalyticsStream();
  const isStreamActive = streamStatus === SSE_STATUS.CONNECTED;
  const lastStreamCheckinRef = useRef(null);

  /**
   * Unified Analytical State Consumer pipeline.
   * Maps ingested data contract structure cleanly to the UI state.
   */
  const processIncomingCheckin = useCallback((checkinPayload) => {
    const { meta, ...cleanCheckinData } = checkinPayload;
    const hourlyIncrement = meta?.hourlyIncrement ?? 1;
    const velocityDelta = meta?.velocityDelta ?? parseFloat((Math.random() * 0.4 - 0.2).toFixed(1));

    setCheckins((prev) => [cleanCheckinData, ...prev.slice(0, 4)]);
    setLiveCount((prev) => prev + hourlyIncrement);
    setActiveCheckinsPerMinute((prev) => parseFloat((prev + velocityDelta).toFixed(1)));
    setHourlyData((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          checkins: updated[lastIndex].checkins + hourlyIncrement,
        };
      }
      return updated;
    });

    if (cleanCheckinData.status === "Flagged") {
      toast.warning(`⚠️ Security Alert: Flagged entry attempt from ${cleanCheckinData.name}`);
    } else if (String(cleanCheckinData.id).includes("manual")) {
      toast.success(`🚀 Simulator: Successfully injected real-time check-in record for ${cleanCheckinData.name}!`);
    } else {
      toast.info(`🔔 Check-in Verified: ${cleanCheckinData.name} matched to ${cleanCheckinData.event}`);
    }
  }, []);

  // Process real-time SSE stream
  useEffect(() => {
    const latest = streamCheckins[0];
    // Compare by event ID rather than object reference so that a reconnect
    // (which rebuilds the context array as new objects) does not re-trigger
    // processing for the same logical event.
    if (!latest || latest.id === lastStreamCheckinRef.current) return;
    lastStreamCheckinRef.current = latest.id;

    processIncomingCheckin(latest);
  }, [streamCheckins, processIncomingCheckin]);

  // Background simulation when SSE is not connected
  useEffect(() => {
    if (isStreamActive) return;
    const checkinNames = [
      "Aditya Rao", "Ishaan Roy", "Meera Nair", "Rohan Das", "Zoya Ali",
      "Aryan Joshi", "Tanya Sen", "Kabir Dutt", "Riya Pillai", "Aravind Swami",
    ];
    const checkinEvents = [
      "Web Dev Workshop", "Global AI Hackathon", "AI & ML Bootcamp",
      "React Conference 2025", "Hack for Sustainability",
    ];

    const interval = setInterval(() => {
      const randomName = checkinNames[Math.floor(Math.random() * checkinNames.length)];
      const randomEvent = checkinEvents[Math.floor(Math.random() * checkinEvents.length)];
      const randomStatus = Math.random() > 0.08 ? "Verified" : "Flagged";

      const newCheckin = {
        id: `c-${Date.now()}`,
        name: randomName,
        event: randomEvent,
        time: "Just now",
        status: randomStatus,
      };

      setCheckins((prev) => [newCheckin, ...prev.slice(0, 4)]);
      setLiveCount((prev) => prev + 1);
      setActiveCheckinsPerMinute((prev) =>
        parseFloat((prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
      );
      setHourlyData((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          checkins: updated[lastIndex].checkins + 1,
        };
        return updated;
      });

      if (randomStatus === "Flagged") {
        toast.warning(`⚠️ Security Alert: Flagged entry attempt from ${randomName}`);
      } else {
        toast.info(`🔔 Check-in Verified: ${randomName} matched to ${randomEvent}`);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isStreamActive]);

  // Manual check-in trigger
  const triggerManualCheckin = () => {
    const simulatorNames = ["Gaurav Kumar", "Shruti Shah", "Manish Pandey", "Pooja Hegde"];
    const randomName = simulatorNames[Math.floor(Math.random() * simulatorNames.length)];

    const newCheckin = {
      id: `c-manual-${Date.now()}`,
      name: randomName,
      event: "Global AI Hackathon",
      time: "Just now",
      status: "Verified",
    };

    setCheckins((prev) => [newCheckin, ...prev.slice(0, 4)]);
    setLiveCount((prev) => prev + 1);
    setHourlyData((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        checkins: updated[lastIndex].checkins + 3,
      };
      return updated;
    });

    toast.success(`🚀 Simulator: Successfully injected real-time check-in record for ${randomName}!`);
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={triggerManualCheckin}
          className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 sm:self-auto"
         aria-label="Trigger manual check-in scan">
          <Play className="h-3.5 w-3.5 fill-white" />
          Trigger Check-in Scan
        </button>
      </div>

      {activeTab === "budget" ? (
        <BudgetPlanner />
      ) : (
        <>
          {/* CONTROL BANNER */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-sm font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                Simulate Attendee Traffic
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Trigger simulated QR scans, face-matching credentials, and checked-in attendee counts instantly.
              </p>
            </div>
            <button
              onClick={triggerManualCheckin}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 sm:self-auto"
              aria-label="button"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              Trigger Check-in Scan
            </button>
          </div>

          {/* LIVE STATS GRID */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                label: "Live Checked-in Attendees",
                value: analyticsLoading ? "—" : liveCount,
                sub: analyticsLoading ? "Loading..." : "Real-time updates",
                icon: <Users className="h-5 w-5" />,
                color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40",
              },
              {
                label: "Scan Velocity",
                value: `${activeCheckinsPerMinute}/min`,
                sub: "Scans per minute avg",
                icon: <Activity className="h-5 w-5" />,
                color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
              },
              {
                label: "Hours Active",
                value: analytics?.hoursActive ?? "08h 24m",
                sub: "Since event start",
                icon: <Clock className="h-5 w-5" />,
                color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
              },
              {
                label: "Security Health",
                value: analytics?.securityHealth ?? "99.8%",
                sub: analytics?.activeAlerts === 0 ? "Zero active alerts" : `${analytics?.activeAlerts} active alert(s)`,
                icon: <CheckCircle2 className="h-5 w-5" />,
                color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="border-slate-205 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
              >
                <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>{stat.icon}</div>
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  {stat.label}
                </p>
                <h4 className="text-slate-850 mt-1 text-2xl font-black dark:text-slate-100">
                  {stat.value}
                </h4>
                <p className="text-slate-450 mt-1 text-[10px] dark:text-slate-400">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* REAL-TIME CHARTS GRID */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* HOURLY REGISTRATION GRAPH */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
              <h3 className="mb-4 flex items-center gap-1.5 text-sm font-black tracking-widest text-slate-400 uppercase">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Check-in Velocity Graph (Live)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="checkins"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCheckins)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CATEGORIES DISTRIBUTION */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800/80 dark:bg-slate-900">
              <div>
                <h3 className="mb-4 flex items-center gap-1.5 text-sm font-black tracking-widest text-slate-400 uppercase">
                  <Zap className="h-4 w-4 fill-amber-500/20 text-amber-500" />
                  Category Registration Distribution
                  {!analyticsLoading && analytics?.categoryBreakdown && (
                    <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Live
                    </span>
                  )}
                </h3>

                {analyticsLoading ? (
                  <div className="flex h-44 w-full items-center justify-center">
                    <span className="animate-pulse text-xs text-slate-400">Loading data...</span>
                  </div>
                ) : (
                  <div className="flex h-44 w-full items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#1e293b",
                            border: "none",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((item, idx) => (
                  <div
                    key={idx}
                    className="dark:border-slate-850 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2 dark:bg-slate-950"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400">{item.name}</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
