import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useReducedMotion from "../../hooks/useReducedMotion";
import { 
  CheckCircle2, 
  Sparkles, 
  Award,
  ChevronDown,
  User as UserIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  X as XIcon,
  Trophy,
  ChevronUp
} from "lucide-react";
import { syncSecureStorage } from "../../utils/secureStorage";

const OnboardingConfetti = () => {
  const colors = ["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];
  const pieces = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-top overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            top: -20,
          }}
          initial={{ y: -20, rotate: p.rotation, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            x: `calc(${p.x}% + ${Math.sin(p.id) * 60}px)`,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
            repeat: 0,
          }}
        />
      ))}
    </div>
  );
};

export default function OnboardingChecklist() {
  const { user, setUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("eventra_onboarding_dismissed") === "true";
  });
  const [showCelebration, setShowCelebration] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    skillsInput: "",
    skills: [],
    github: "",
    linkedin: "",
    portfolio: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        skills: user.skills || [],
        github: user.github || "",
        linkedin: user.linkedin || "",
        portfolio: user.portfolio || ""
      }));
    }
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem("eventra_onboarding_dismissed", "true");
    setIsDismissed(true);
    setIsOpen(false);
  };

  const handleNext = () => setCurrentStep(p => Math.min(p + 1, 3));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = formData.skillsInput.trim();
      if (val && !formData.skills.includes(val)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, val],
          skillsInput: ""
        }));
      }
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = async () => {
    const updatedUser = { ...user, ...formData };
    delete updatedUser.skillsInput;
    
    setUser(updatedUser);
    try {
      await syncSecureStorage.setItem("user", JSON.stringify(updatedUser));
    } catch(e) {}
    
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      handleDismiss();
    }, 4000);
  };

  if (!user || isDismissed) return null;

  return (
    <>
      <AnimatePresence>
        {showCelebration && <OnboardingConfetti />}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="onboarding-badge"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={() => setIsOpen(true)}
            data-onboarding-checklist="badge"
            className="fixed bottom-24 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-2xl border border-slate-800 dark:border-slate-200 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <Trophy className="absolute w-4 h-4 text-indigo-500 animate-pulse" />
            </div>
            <span className="text-xs tracking-wide">
              Complete Profile
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="onboarding-panel"
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
            data-onboarding-checklist="panel"
            className="fixed bottom-6 left-6 z-fixed w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    Profile Setup
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-[10px] text-slate-500">Step {currentStep} of 3</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Minimize panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
              <motion.div
                className="h-full bg-indigo-600 dark:bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              />
            </div>

            <div className="p-5 h-[280px] overflow-y-auto">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-white"><UserIcon className="w-4 h-4" /> Basic Info</h4>
                  <div>
                    <label className="text-xs text-slate-500">Full Name</label>
                    <input type="text" className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Username</label>
                    <input type="text" className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Bio</label>
                    <textarea className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" rows="2" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-white"><CodeIcon className="w-4 h-4" /> Interests & Skills</h4>
                  <div>
                    <label className="text-xs text-slate-500">Add Skills (Press Enter)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" 
                      value={formData.skillsInput} 
                      onChange={e => setFormData({...formData, skillsInput: e.target.value})} 
                      onKeyDown={handleAddSkill}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map(s => (
                      <span key={s} className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center gap-1">
                        {s} <XIcon className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveSkill(s)} />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-white"><LinkIcon className="w-4 h-4" /> Social Links</h4>
                  <div>
                    <label className="text-xs text-slate-500">GitHub URL</label>
                    <input type="text" className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">LinkedIn URL</label>
                    <input type="text" className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Portfolio URL</label>
                    <input type="text" className="w-full p-2 mt-1 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button 
                onClick={handleDismiss}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip For Now
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-3 py-1.5 flex items-center gap-1 text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50"
                >
                  <ArrowLeft className="w-3 h-3" /> Prev
                </button>
                {currentStep < 3 ? (
                  <button 
                    onClick={handleNext}
                    className="px-3 py-1.5 flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Next <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    className="px-3 py-1.5 flex items-center gap-1 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Finish
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
