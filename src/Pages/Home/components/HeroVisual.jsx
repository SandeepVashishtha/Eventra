import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Trophy, Settings, Users, Activity } from "lucide-react";

export default function HeroVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg h-[360px] sm:h-[400px] lg:h-[430px]"
      aria-hidden="true"
    >
      {/* Background soft mesh glow */}
      <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-tr from-indigo-500/5 via-transparent to-pink-500/5 blur-xl" />

      {/* Main Glass Mockup Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full h-full rounded-2xl border border-border bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-premium-lg flex flex-col overflow-hidden"
      >
        {/* Window Chrome/Header */}
        <div className="flex h-11 items-center justify-between border-b border-border bg-white/40 dark:bg-slate-950/20">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/20 dark:bg-red-500/10 border border-red-500/30" />
            <span className="h-3 w-3 rounded-full bg-amber-500/20 dark:bg-amber-500/10 border border-amber-500/30" />
            <span className="h-3 w-3 rounded-full bg-green-500/20 dark:bg-green-500/10 border border-green-500/30" />
          </div>
          <div className="text-[11px] font-medium text-text-light/60 font-mono select-none">
            eventra.dev/dashboard
          </div>
          <div className="w-12" />
        </div>

        {/* Inner Dashboard Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mock Sidebar */}
          <div className="w-[140px] border-r border-border bg-white/20 dark:bg-slate-950/10 p-3 hidden sm:flex flex-col gap-2">
            <div className="text-[9px] font-bold text-text-light/40 uppercase tracking-wider mb-2 px-2">
              Console
            </div>
            {[
              { icon: LayoutDashboard, label: "Overview", active: true },
              { icon: Calendar, label: "Events", active: false },
              { icon: Trophy, label: "Hackathons", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors ${
                  item.active
                    ? "bg-slate-950/5 dark:bg-white/5 text-text"
                    : "text-text-light/60 hover:text-text hover:bg-slate-950/5 dark:hover:bg-white/5"
                }`}
              >
                <item.icon size={13} className="text-text-light" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Mock Content Board */}
          <div className="flex-1 p-4 flex flex-col gap-3.5 overflow-hidden">
            {/* Stats strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-white/40 dark:bg-white/[0.01]">
                <div className="flex items-center gap-1.5 text-text-light/50 text-[10px] font-semibold uppercase tracking-wider">
                  <Users size={11} />
                  Registry
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-text">1,540</span>
                  <span className="text-[9px] font-bold text-emerald-500 font-mono">+12%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-white/40 dark:bg-white/[0.01]">
                <div className="flex items-center gap-1.5 text-text-light/50 text-[10px] font-semibold uppercase tracking-wider">
                  <Activity size={11} />
                  Engagement
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-text">94.8%</span>
                  <span className="text-[9px] font-bold text-indigo-500 font-mono">Max</span>
                </div>
              </div>
            </div>

            {/* List Board */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <div className="text-[10px] font-bold text-text-light/40 uppercase tracking-wider px-1">
                Upcoming Schedule
              </div>
              {[
                { title: "AI Hackathon Finals", meta: "Mar 15 · 240 registered", status: "Live" },
                { title: "React Workshop", meta: "Mar 18 · Online", status: "Upcoming" },
                { title: "Open Source Sprint", meta: "Mar 22 · Hybrid", status: "Upcoming" },
              ].map((ev, index) => (
                <motion.div
                  key={ev.title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-white/40 dark:bg-white/[0.01] hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors min-w-0"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-[11px] font-bold text-text truncate">{ev.title}</div>
                    <div className="text-[9px] text-text-light/60 truncate mt-0.5">{ev.meta}</div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      ev.status === "Live"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                    }`}
                  >
                    {ev.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
