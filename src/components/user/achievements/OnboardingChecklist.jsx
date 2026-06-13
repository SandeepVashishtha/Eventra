import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const OnboardingChecklist = ({ onboardingQuests }) => {
  if (onboardingQuests.every(q => q.done)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/20 via-primary/10 to-card-bg/60 border border-primary/20 backdrop-blur-xl rounded-3xl p-6 shadow-premium-lg space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-450 animate-bounce" />
        <h2 className="text-md font-black tracking-tight text-white uppercase">Onboarding Quests</h2>
      </div>
      <p className="text-xs text-text-light max-w-xl leading-relaxed">
        Complete these quests to unlock your first milestone tokens and start your progression journey.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {onboardingQuests.map((quest) => (
          <div
            key={quest.id}
            className={`p-4 rounded-2xl border transition ${
              quest.done
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-350"
                : "bg-bg/40 border-border text-text-light"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-light">Quest</span>
              {quest.done ? (
                <span className="bg-emerald-500/20 text-emerald-450 px-2 py-0.5 rounded text-[8px] font-black uppercase">Done</span>
              ) : (
                <span className="bg-bg/80 text-text-light/60 px-2 py-0.5 rounded text-[8px] font-black uppercase">Pending</span>
              )}
            </div>
            <h4 className="text-xs font-extrabold text-white">{quest.title}</h4>
            <p className="text-[10px] text-text-light mt-1">{quest.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OnboardingChecklist;
