import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  CheckCircle,
  MessageSquare,
  Megaphone,
  Clock,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import eventsMockData from "../../Pages/Events/eventsMockData.json";
import {
  getTimelineEvents,
  getChartDataPoints,
  sliderToHours,
  getFormattedSimTime
} from "utils/eventTimelineUtils";

const EventTimelineReplay = ({ eventId }) => {
  // Find matching event from mock data or fallback
  const event = eventsMockData.find((e) => e.id === Number(eventId)) || {
    title: "React Conference",
    date: "2026-03-15",
    time: "10:00 AM"
  };

  const timelineEvents = getTimelineEvents(event.title);
  const chartPoints = getChartDataPoints();

  // Playback States
  const [sliderVal, setSliderVal] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x, 10x, 20x
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const timerRef = useRef(null);

  const currentHours = sliderToHours(sliderVal);

  // Tick calculation: speed maps to slider increment
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSliderVal((prev) => {
          const nextVal = prev + 0.5 * playbackSpeed;
          if (nextVal >= 100) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return 100;
          }
          return nextVal;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Reset function
  const handleReset = () => {
    setIsPlaying(false);
    setSliderVal(0);
  };

  // Toggle Play
  const handlePlayToggle = () => {
    if (sliderVal >= 100) {
      setSliderVal(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Filtered timeline data up to the current relative timestamp
  const visibleEvents = timelineEvents.filter((evt) => evt.t <= currentHours);

  // Stats calculation up to current relative timestamp
  const registrationsCount = visibleEvents.filter((e) => e.type === "registration").length;
  const checkinsCount = visibleEvents.filter((e) => e.type === "checkin").length;
  const announcementsCount = visibleEvents.filter((e) => e.type === "announcement").length;
  const feedbackEvents = visibleEvents.filter((e) => e.type === "feedback");
  const averageRating =
    feedbackEvents.length > 0
      ? feedbackEvents.reduce((acc, curr) => acc + curr.rating, 0) / feedbackEvents.length
      : 0;

  // Active Sessions
  const activeSessions = [];
  const sessionStatusMap = {};

  // Track start/end of sessions up to currentHours
  visibleEvents.forEach((evt) => {
    if (evt.type === "session") {
      if (evt.action === "start") {
        sessionStatusMap[evt.sessionName] = {
          venue: evt.venue,
          attendees: evt.attendees || 30
        };
      } else if (evt.action === "end") {
        delete sessionStatusMap[evt.sessionName];
      }
    }
  });

  Object.entries(sessionStatusMap).forEach(([name, details]) => {
    activeSessions.push({ name, ...details });
  });

  // Dynamic Chart data up to current relative hours
  const currentChartData = chartPoints.filter((pt) => pt.t <= currentHours);

  // Replay activity feed filtering
  const filteredFeedEvents = visibleEvents
    .filter((evt) => {
      // Type Filter
      if (activeFilter !== "all" && evt.type !== activeFilter) return false;
      // Search Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(query) ||
          evt.desc.toLowerCase().includes(query) ||
          (evt.user && evt.user.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .reverse(); // Newest first in log display

  // Progress percentage format for timeline tracker
  const timelineProgressPercent = sliderVal.toFixed(0);

  return (
    <div className="space-y-6">
      {/* Player Dashboard Head Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" />
              Event Activity Replay Player
            </h2>
            <p className="text-sm text-slate-500">
              Scrub or press play to visualize how the event unfolded chronologically.
            </p>
          </div>

          {/* Simulated Time Indicator */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
            <Clock className="text-indigo-500" size={18} />
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Simulated Time</div>
              <div className="text-sm font-black font-mono tracking-tight text-slate-800 dark:text-slate-200">
                {getFormattedSimTime(currentHours, event.date, event.time)}
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />
            <div className="text-center px-1">
              <span className="text-xs font-mono font-bold px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                {sliderVal === 100 ? "Finished" : sliderVal < 75 ? "Pre-Event" : "Live"}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Range Scrubber */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>🎟️ Pre-Event Registration</span>
            <span>🎪 Event Start</span>
            <span>🏁 Event End</span>
          </div>
          <div className="relative group flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={sliderVal}
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
              aria-label="Event Timeline Scrubber"
            />
            {/* Custom slider track markers */}
            <div className="absolute left-[0%] w-2 h-2 rounded-full bg-indigo-500 pointer-events-none transform -translate-x-1/2" />
            <div className="absolute left-[75%] w-2.5 h-2.5 rounded-full bg-emerald-500 pointer-events-none transform -translate-x-1/2" />
            <div className="absolute left-[100%] w-2.5 h-2.5 rounded-full bg-orange-500 pointer-events-none transform -translate-x-1/2" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
            <span>T - 24 hours</span>
            <span className="text-indigo-500 font-bold">{timelineProgressPercent}% Played</span>
            <span>T + 8 hours</span>
          </div>
        </div>

        {/* Playback Controls & Speed Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition-all active:scale-95 text-white shadow-md ${
                isPlaying
                  ? "bg-slate-800 dark:bg-slate-700 hover:bg-slate-900"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              aria-label={isPlaying ? "Pause Timeline Replay" : "Play Timeline Replay"}
            >
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              title="Reset Replay"
              aria-label="Reset Replay"
            >
              <RotateCcw size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Speed settings */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-slate-400 px-2.5">Speed</span>
            {[1, 2, 5, 10, 20].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  playbackSpeed === speed
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/50 dark:border-white/5"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Registrations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registrations</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {registrationsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Growth up to selected time</div>
        </div>

        {/* Check-ins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked In</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {checkinsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {registrationsCount > 0
              ? `${Math.round((checkinsCount / registrationsCount) * 100)}% check-in rate`
              : "0% check-in rate"}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Sessions</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {activeSessions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sessions ongoing at current time</div>
        </div>

        {/* Announcements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Announcements</span>
            <div className="p-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-lg">
              <Megaphone size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {announcementsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Broadcasts sent to attendees</div>
        </div>

        {/* Feedback submissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Feedback</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {averageRating > 0 ? `${averageRating.toFixed(1)} ★` : "—"}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            From {feedbackEvents.length} review{feedbackEvents.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Main Grid: Visuals & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Growth Chart & Active Sessions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dynamic Replays Trend AreaChart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={18} />
              Replay Trend Graph (Registrations vs Check-ins)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegReplay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCheckReplay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    itemStyle={{ fontStyle: 'normal' }}
                  />
                  <Area type="monotone" name="Registrations" dataKey="registrations" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRegReplay)" />
                  <Area type="monotone" name="Check-ins" dataKey="checkins" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCheckReplay)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ongoing Session Activity list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <Clock className="text-purple-500" size={18} />
              Session Room Activity
            </h3>
            {activeSessions.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                <span>No sessions active at this timestamp.</span>
                <span className="text-xs text-slate-400 mt-1">Play the timeline past event start (75%+) to see sessions.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSessions.map((session) => (
                  <motion.div
                    key={session.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                          {session.venue}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          Live Now
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{session.name}</h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-indigo-100/50 dark:border-indigo-950/20 flex items-center justify-between text-xs text-slate-500">
                      <span>Room Occupancy:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{session.attendees} attendees</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Replay Feed / Activity Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col h-[528px]">
          <div className="space-y-3 mb-4">
            <h3 className="text-md font-bold flex items-center gap-2">
              <Filter className="text-pink-500" size={18} />
              Replay Activity Feed
            </h3>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                aria-label="Search logs"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "registration", label: "Regs" },
                { id: "checkin", label: "Check-ins" },
                { id: "session", label: "Sessions" },
                { id: "announcement", label: "Announcements" },
                { id: "feedback", label: "Feedback" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    activeFilter === btn.id
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
                      : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed Scrolling Container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 relative scrollbar-thin">
            {filteredFeedEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No activities recorded yet.</span>
                <span className="text-[10px] text-slate-400/80 mt-1">Play or scrub the timeline to generate events.</span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredFeedEvents.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {evt.t <= 0 ? `T ${evt.t.toFixed(1)}h` : `T +${evt.t.toFixed(1)}h`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          evt.type === "registration"
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : evt.type === "checkin"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : evt.type === "session"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : evt.type === "announcement"
                            ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {evt.type}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {evt.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {evt.desc}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTimelineReplay;
