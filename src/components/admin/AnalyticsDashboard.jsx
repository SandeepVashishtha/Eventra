import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  Award,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { toast } from "react-toastify";

const MOCK_CHECKINS = [
  { id: "c1", name: "Ananya Iyer", event: "Web Dev Workshop", time: "2 mins ago", status: "Verified" },
  { id: "c2", name: "Kunal Sen", event: "AI & ML Bootcamp", time: "5 mins ago", status: "Verified" },
  { id: "c3", name: "Sara Khan", event: "React Conference 2025", time: "12 mins ago", status: "Verified" },
  { id: "c4", name: "Neil Verma", event: "Hack for Sustainability", time: "18 mins ago", status: "Flagged" },
  { id: "c5", name: "Diya Roy", event: "Global AI Hackathon", time: "24 mins ago", status: "Verified" }
];

const INITIAL_HOURLY_DATA = [
  { hour: "09:00", checkins: 12 },
  { hour: "10:00", checkins: 28 },
  { hour: "11:00", checkins: 45 },
  { hour: "12:00", checkins: 30 },
  { hour: "13:00", checkins: 58 },
  { hour: "14:00", checkins: 72 },
  { hour: "15:00", checkins: 65 },
  { hour: "16:00", checkins: 88 }
];

const MOCK_CATEGORY_DATA = [
  { name: "Coding", value: 340, color: "#6366f1" },
  { name: "Design", value: 180, color: "#ec4899" },
  { name: "AI/ML", value: 290, color: "#10b981" },
  { name: "Web3", value: 110, color: "#f59e0b" }
];

const AnalyticsDashboard = () => {
  const [checkins, setCheckins] = useState(MOCK_CHECKINS);
  const [hourlyData, setHourlyData] = useState(INITIAL_HOURLY_DATA);
  const [liveCount, setLiveCount] = useState(342);
  const [activeCheckinsPerMinute, setActiveCheckinsPerMinute] = useState(5.4);

  // Emulate real-time WebSocket check-ins
  useEffect(() => {
    const checkinNames = [
      "Aditya Rao", "Ishaan Roy", "Meera Nair", "Rohan Das", "Zoya Ali",
      "Aryan Joshi", "Tanya Sen", "Kabir Dutt", "Riya Pillai", "Aravind Swami"
    ];
    
    const checkinEvents = [
      "Web Dev Workshop", "Global AI Hackathon", "AI & ML Bootcamp",
      "React Conference 2025", "Hack for Sustainability"
    ];

    const interval = setInterval(() => {
      // 1. Generate dynamic checkin entry
      const randomName = checkinNames[Math.floor(Math.random() * checkinNames.length)];
      const randomEvent = checkinEvents[Math.floor(Math.random() * checkinEvents.length)];
      const randomStatus = Math.random() > 0.08 ? "Verified" : "Flagged";
      
      const newCheckin = {
        id: `c-${Date.now()}`,
        name: randomName,
        event: randomEvent,
        time: "Just now",
        status: randomStatus
      };

      // 2. Prepend and keep top 5
      setCheckins((prev) => [newCheckin, ...prev.slice(0, 4)]);
      
      // 3. Update count and charts
      setLiveCount((prev) => prev + 1);
      setActiveCheckinsPerMinute((prev) => parseFloat((prev + (Math.random() * 0.4 - 0.2)).toFixed(1)));

      // 4. Update the latest hour chart entry
      setHourlyData((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          checkins: updated[lastIndex].checkins + 1
        };
        return updated;
      });

      if (randomStatus === "Flagged") {
        toast.warning(`⚠️ Security Alert: Flagged entry attempt from ${randomName}`);
      } else {
        toast.info(`🔔 Check-in Verified: ${randomName} matched to ${randomEvent}`);
      }

    }, 12000); // Trigger every 12 seconds emulating active hackathon flow

    return () => clearInterval(interval);
  }, []);

  // Simulator helper: Trigger manual synthetic check-in instantly
  const triggerManualCheckin = () => {
    const simulatorNames = ["Gaurav Kumar", "Shruti Shah", "Manish Pandey", "Pooja Hegde"];
    const randomName = simulatorNames[Math.floor(Math.random() * simulatorNames.length)];
    
    const newCheckin = {
      id: `c-manual-${Date.now()}`,
      name: randomName,
      event: "Global AI Hackathon",
      time: "Just now",
      status: "Verified"
    };

    setCheckins((prev) => [newCheckin, ...prev.slice(0, 4)]);
    setLiveCount((prev) => prev + 1);
    
    setHourlyData((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        checkins: updated[lastIndex].checkins + 3
      };
      return updated;
    });

    toast.success(`🚀 Simulator: Successfully injected real-time check-in record for ${randomName}!`);
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      
      {/* CONTROL BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Simulate Attendee Traffic
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trigger simulated QR scans, face-matching credentials, and checked-in attendee counts instantly.
          </p>
        </div>
        <button
          onClick={triggerManualCheckin}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md transition self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Trigger Check-in Scan
        </button>
      </div>

      {/* LIVE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Live Checked-in Attendees", value: liveCount, sub: "Real-time updates", icon: <Users className="w-5 h-5" />, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" },
          { label: "Scan Velocity", value: `${activeCheckinsPerMinute}/min`, sub: "Scans per minute avg", icon: <Activity className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Hours Active", value: "08h 24m", sub: "Since event start", icon: <Clock className="w-5 h-5" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
          { label: "Security Health", value: "99.8%", sub: "Zero active alerts", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" }
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h4 className="text-2xl font-black mt-1 text-slate-850 dark:text-slate-100">{stat.value}</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* REAL-TIME CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HOURLY REGISTRATION GRAPH */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Check-in Velocity Graph (Live)
          </h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                <Area type="monotone" dataKey="checkins" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCheckins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORIES DISTRIBUTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              Category Registration Distribution
            </h3>
            
            <div className="h-44 w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {MOCK_CATEGORY_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <div>
                  <div className="text-[10px] font-bold text-slate-400">{item.name}</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LIVE EVENT CHECK-IN FEED LOG */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          Live Check-In Event Activity Log
        </h3>
        
        <div className="mt-4 space-y-3">
          {checkins.map((checkin) => (
            <div
              key={checkin.id}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-950 dark:hover:bg-slate-850/45 rounded-2xl border border-slate-150 dark:border-slate-850 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                  {checkin.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-850 dark:text-slate-100">{checkin.name}</div>
                  <div className="text-[10px] text-slate-400">{checkin.event} &bull; Check-in attempt</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">{checkin.time}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    checkin.status === "Verified"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455"
                  }`}
                >
                  {checkin.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
