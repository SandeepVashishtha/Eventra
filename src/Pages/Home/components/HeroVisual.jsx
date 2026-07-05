import { motion } from "framer-motion";
import { Calendar, Code2, MapPin, Trophy, Users } from "lucide-react";

const previewEvents = [
  { title: "AI Hackathon Finals", meta: "Mar 15 · 240 registered", accent: "bg-violet-500" },
  { title: "React Workshop", meta: "Mar 18 · Online", accent: "bg-pink-500" },
  { title: "Open Source Sprint", meta: "Mar 22 · Hybrid", accent: "bg-indigo-500" },
];

const floatingCards = [
  {
    icon: Trophy,
    title: "AI Hackathon 2026",
    subtitle: "48 teams competing",
    accent: "from-violet-500 to-purple-600",
    position: "top-0 left-0 sm:left-2",
    delay: 0,
  },
  {
    icon: Code2,
    title: "Open Source Sprint",
    subtitle: "Build with contributors",
    accent: "from-indigo-500 to-blue-600",
    position: "top-24 right-0 sm:right-2",
    delay: 0.15,
  },
  {
    icon: Users,
    title: "Dev Meetup",
    subtitle: "1,200+ attending",
    accent: "from-emerald-500 to-teal-600",
    position: "bottom-2 right-4 sm:right-8",
    delay: 0.3,
  },
];

export default function HeroVisual() {
  return (
    <div
      className="relative mx-auto h-[320px] w-full max-w-md sm:h-[380px] lg:max-w-none lg:h-[420px]"
      aria-hidden="true"
    >
      <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-br from-violet-100/80 via-indigo-50/60 to-pink-100/70 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-pink-950/30 border border-violet-200/50 dark:border-violet-800/40" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/30 to-pink-400/20 blur-2xl dark:from-violet-600/20 dark:to-pink-600/10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
        className="absolute left-1/2 top-1/2 z-20 w-[min(100%,260px)] -translate-x-1/2 -translate-y-1/2 sm:w-[280px]"
      >
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-2xl shadow-violet-300/30 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/95 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Eventra
            </span>
          </div>

          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Upcoming Events</p>
              <Calendar className="h-3.5 w-3.5 text-violet-500" />
            </div>

            {previewEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${event.accent}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {event.meta}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {floatingCards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay }}
            className={`absolute ${card.position} z-30`}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4 + card.delay * 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/90 px-3 py-2.5 shadow-lg shadow-violet-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-black/30 sm:px-3.5 sm:py-3"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                  {card.title}
                </p>
                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
