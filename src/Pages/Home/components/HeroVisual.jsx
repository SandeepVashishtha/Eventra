import { motion } from "framer-motion";
import { Calendar, Code2, Trophy, Users } from "lucide-react";

const floatingCards = [
  {
    icon: Trophy,
    title: "AI Hackathon 2026",
    subtitle: "48 teams competing",
    accent: "from-violet-500 to-purple-600",
    position: "top-4 left-2 sm:left-6",
    delay: 0,
  },
  {
    icon: Code2,
    title: "Open Source Sprint",
    subtitle: "Build with contributors",
    accent: "from-indigo-500 to-blue-600",
    position: "top-28 right-0 sm:right-4",
    delay: 0.15,
  },
  {
    icon: Calendar,
    title: "React Workshop",
    subtitle: "Live this weekend",
    accent: "from-pink-500 to-rose-500",
    position: "bottom-20 left-4 sm:left-10",
    delay: 0.3,
  },
  {
    icon: Users,
    title: "Dev Meetup",
    subtitle: "1,200+ attending",
    accent: "from-emerald-500 to-teal-600",
    position: "bottom-4 right-6 sm:right-10",
    delay: 0.45,
  },
];

export default function HeroVisual() {
  return (
    <div
      className="relative mx-auto h-[280px] w-full max-w-md sm:h-[340px] lg:max-w-none lg:h-[380px]"
      aria-hidden="true"
    >
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-violet-100/80 via-indigo-50/60 to-pink-100/70 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-pink-950/30 border border-violet-200/50 dark:border-violet-800/40" />

      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/30 to-pink-400/20 blur-2xl dark:from-violet-600/20 dark:to-pink-600/10" />

      {floatingCards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay }}
            className={`absolute ${card.position} z-10`}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4 + card.delay * 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-3 shadow-lg shadow-violet-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-black/30 sm:px-4 sm:py-3.5"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {card.title}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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
