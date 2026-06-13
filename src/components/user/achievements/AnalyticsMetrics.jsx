import { motion } from 'framer-motion';
import { Calendar, Zap, Award, TrendingUp, CheckCircle } from 'lucide-react';

const AnalyticsMetrics = ({ totalEvents, currentStreak, unlockedCount, operationalBadges }) => {
  return (
    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-bg/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-premium-sm shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none">Registrations</p>
          <p className="text-3xl font-black text-text mt-2.5 tracking-tight">{totalEvents}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-card-bg/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-secondary/10 text-secondary shadow-premium-sm shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-secondary animate-pulse">Active</span>
        </div>
        <div>
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none">Streak Range</p>
          <p className="text-3xl font-black text-text mt-2.5 tracking-tight">
            {currentStreak} <span className="text-xs text-text-light font-bold uppercase tracking-widest">Events</span>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card-bg/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-premium-sm shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <CheckCircle className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none">Tokens Claimed</p>
          <p className="text-3xl font-black text-text mt-2.5 tracking-tight">
            {unlockedCount} <span className="text-xs text-text-light font-bold tracking-tight">/ {operationalBadges.length}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsMetrics;
