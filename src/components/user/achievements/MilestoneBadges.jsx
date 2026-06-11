import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, ShieldAlert, Share2 } from 'lucide-react';

const MilestoneBadges = ({ operationalBadges, onShareBadge, getBadgeProgress, t }) => {
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);

  const toggleExpand = (badgeId) => {
    setExpandedBadgeId(expandedBadgeId === badgeId ? null : badgeId);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <h2 className="text-lg font-black tracking-tight text-text">
          {t ? t("userAchievements.badgesSectionHeading") : "Milestone Badges"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {operationalBadges.map((badge) => {
          const isOpen = expandedBadgeId === badge.id;

          return (
            <motion.div
              key={badge.id}
              layout
              className={`p-5 rounded-3xl border flex flex-col transition-all cursor-pointer ${
                badge.earned
                  ? 'bg-card-bg/60 backdrop-blur-xl border-border shadow-premium-sm hover:shadow-premium-md hover:shadow-glow-sm'
                  : 'bg-card-bg/15 border-border/30 opacity-70 hover:opacity-100 shadow-none'
              }`}
              onClick={() => toggleExpand(badge.id)}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <div className="flex items-start justify-between">
                <span className={`text-3xl p-2.5 rounded-2xl shrink-0 shadow-premium-sm ${badge.earned ? 'bg-primary/10' : 'bg-bg filter grayscale'}`}>
                  {badge.icon}
                </span>
                {badge.earned ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350 px-2.5 py-0.5 rounded-full shadow-premium-sm border border-emerald-100/35">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-bg text-text-light px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-text mt-4 tracking-tight">{badge.name}</h3>
              <p className="text-xs text-text-light mt-1 leading-relaxed line-clamp-2">{badge.description}</p>

              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary mt-4 pt-3 border-t border-border">
                <span>Inspect Details</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden space-y-4 pt-4 mt-3 border-t border-dashed border-border"
                  >
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-text-light leading-none">Requirement</span>
                      <span className="block text-xs font-semibold text-text-light leading-relaxed mt-1">{badge.details}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wide text-text-light">
                        <span>Progress</span>
                        <span>{badge.currentProgress} / {badge.targetProgress}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-bg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (badge.currentProgress / badge.targetProgress) * 100)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${badge.earned ? 'from-emerald-500 to-teal-500' : 'from-primary/60 to-primary'}`}
                        />
                      </div>
                    </div>

                    {(badge.log || []).length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Completion Log</span>
                        <div className="space-y-1">
                          {badge.log.map((logItem, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-text-light">
                              <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                              <span>{logItem}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {badge.earned && (
                      <div className="pt-4 border-t border-dashed border-border space-y-2.5" onClick={(e) => e.stopPropagation()}>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-text-light leading-none">Share</span>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <button
                            onClick={() => onShareBadge(badge)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white transition-all cursor-pointer shadow-premium-sm hover:shadow-glow-sm hover:scale-[1.03]"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share Certificate</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {!badge.earned && (
                      <div className="flex items-center gap-1.5 p-2 px-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/20 dark:border-rose-900/10 text-[9px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Complete the requirements above to unlock this badge.</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default MilestoneBadges;
