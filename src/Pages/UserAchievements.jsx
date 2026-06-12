import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../context/NotificationContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import QuestCenter from "../components/gamification/QuestCenter";
import EventBadgeGenerator from "../components/user/EventBadgeGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Award,
  Zap,
  Calendar,
  Lock,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Trophy,
  Linkedin,
  Twitter,
  Share2,
  X,
} from "lucide-react";

export default function UserAchievements() {
  const { t } = useTranslation();
  useDocumentTitle(t("userAchievements.pageTitle"));
  const { achievements, fetchAchievements } = useNotification();
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);
  const [activeShareBadge, setActiveShareBadge] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [shareStory, setShareStory] = useState("");
  const [sharePlatform, setSharePlatform] = useState("twitter");

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    if (activeShareBadge) {
      setShareStory(
        `I just unlocked the '${activeShareBadge.name}' milestone badge on Eventra! 🏆 ${activeShareBadge.description} Check it out: https://eventra.dev #GSSoC2026 #OpenSource #Developer`
      );
    } else {
      setShareStory("");
    }
  }, [activeShareBadge]);

  // Fallback / Normalized list of milestone achievements with progress metrics
  const fallbackBadges = useMemo(
    () => [
      {
        id: "first-step",
        name: "First Step",
        description: "Registered for your first event on Eventra!",
        icon: "🚀",
        currentProgress: Math.min(1, achievements.totalEvents || 0),
        targetProgress: 1,
        earned: (achievements.totalEvents || 0) >= 1,
        rewardXP: 100,
        details:
          "Kickstart your open-source registration journey. Join any workshop or hackathon to claim this token.",
        log: ["+100 XP awarded", "Profile Starter badge enabled"],
      },
      {
        id: "event-enthusiast",
        name: "Event Enthusiast",
        description: "Registered for 5 separate platform events and meetups.",
        icon: "🔥",
        currentProgress: achievements.totalEvents || 0,
        targetProgress: 5,
        earned: (achievements.totalEvents || 0) >= 5,
        rewardXP: 250,
        details:
          "Attend workshops, webinars, and hackathons. Build consistency across local communities.",
        log: ["+250 XP awarded", "Community Enthusiast badge enabled"],
      },
      {
        id: "streak-master",
        name: "Streak Master",
        description: "Maintained a multi-event active registration streak.",
        icon: "👑",
        currentProgress: achievements.currentStreak || 0,
        targetProgress: 3,
        earned: (achievements.currentStreak || 0) >= 3,
        rewardXP: 300,
        details:
          "Register for events on consecutive schedules. Streaks scale your multiplier benefits.",
        log: ["+300 XP awarded", "Elite Streaker badge enabled"],
      },
      {
        id: "gssoc-contributor",
        name: "GSSoC Contributor",
        description: "Register for GSSoC specialized repository hackathons.",
        icon: "💻",
        currentProgress: Math.min(achievements.gssocEvents || 0, 2),
        targetProgress: 2,
        earned: (achievements.gssocEvents || 0) >= 2,
        rewardXP: 200,
        details:
          "Collaborate with global open-source developers and sync your GSSoC progress boards.",
        log: ["+200 XP awarded", "GSSoC Specialist badge enabled"],
      },
      {
        id: "ai-pioneer",
        name: "AI Pioneer",
        description: "Complete highly technical AI/Web3 workshops.",
        icon: "🔮",
        currentProgress: Math.min(achievements.totalEvents || 0, 4),
        targetProgress: 4,
        earned: (achievements.totalEvents || 0) >= 4,
        rewardXP: 400,
        details: "Dive deep into AI integrations, blockchain, and next-generation Web3 protocols.",
        log: ["+400 XP awarded", "AI Specialist badge enabled"],
      },
    ],
    [achievements.totalEvents, achievements.currentStreak, achievements.gssocEvents]
  );

  const operationalBadges =
    achievements.badges && achievements.badges.length > 0
      ? achievements.badges.map((b, idx) => ({
          id: b.id || `badge-${idx}`,
          name: b.name,
          description: b.description,
          icon: b.icon || "🏆",
          currentProgress: b.earned ? 1 : 0,
          targetProgress: 1,
          earned: b.earned,
          rewardXP: 150,
          details: b.description,
          log: ["+150 XP awarded"],
        }))
      : fallbackBadges;

  // Derived dynamic XP Level Progression Engine
  const unlockedCount = operationalBadges.filter((b) => b.earned).length;
  const totalEvents = achievements.totalEvents || 0;
  const currentStreak = achievements.currentStreak || 0;

  // Derived calculations: 100 XP per event, 150 XP per streak day, 250 XP per badge
  const derivedXP = totalEvents * 100 + currentStreak * 150 + unlockedCount * 250 + 75;

  // Level system: 500 XP per Level
  const currentLevel = Math.floor(derivedXP / 500) + 1;
  const xpInCurrentLevel = derivedXP % 500;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / 500) * 100));
  const xpNeededForNext = 500 - xpInCurrentLevel;

  // SVG Radial Circle metrics
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.8
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const toggleExpand = (badgeId) => {
    setExpandedBadgeId(expandedBadgeId === badgeId ? null : badgeId);
  };

  const handleShareTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareStory)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    toast.success(t("userAchievements.toastTwitterShare"));
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://eventra.dev")}&summary=${encodeURIComponent(shareStory)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    toast.success(t("userAchievements.toastLinkedinShare"));
  };

  // Mock download badge certificate SVG
  const handleDownloadSVG = (badge) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <rect width="100%" height="100%" fill="#0f172a" rx="20"/>
      <circle cx="200" cy="80" r="40" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
      <text x="200" y="88" font-family="Arial" font-size="36" text-anchor="middle" fill="#fff">${badge.icon}</text>
      <text x="200" y="150" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#e2e8f0">${badge.name}</text>
      <text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle" fill="#94a3b8">EVENTRA ACHIEVER TOKEN</text>
      <text x="200" y="205" font-family="Arial" font-size="10" text-anchor="middle" fill="#6366f1">Level ${currentLevel} Developer</text>
    </svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${badge.id}-certificate.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Free browser memory immediately to prevent SPA memory leaks
    URL.revokeObjectURL(url);
    toast.success(t("userAchievements.toastCertificateDownloaded"));
  };

  // Onboarding Checklist configuration
  const onboardingQuests = [
    {
      id: "step1",
      title: "Register for your first event",
      description: "Unlock your first registration milestone",
      done: totalEvents >= 1,
    },
    {
      id: "step2",
      title: "Start a streak",
      description: "Participate in multiple events consecutively",
      done: currentStreak >= 1,
    },
    {
      id: "step3",
      title: "Unlock a milestone token",
      description: "Complete requirements to claim a badge",
      done: unlockedCount >= 1,
    },
  ];

  return (
    <div className="bg-bg text-text min-h-screen px-4 py-20 transition-colors duration-300 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER SECTION */}
        <div className="border-border flex flex-col gap-6 border-b pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-primary flex items-center gap-2 text-xs font-black tracking-wider uppercase">
              <Trophy className="h-4.5 w-4.5 animate-pulse" />
              {t("userAchievements.progressionStudio")}
            </div>
            <h1 className="from-text to-primary mt-1.5 bg-gradient-to-r bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              {t("userAchievements.heading")}
            </h1>
            <p className="text-text-light mt-2 max-w-2xl text-xs leading-relaxed sm:text-sm">
              {t("userAchievements.description")}
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="from-primary via-primary/80 to-secondary shadow-premium-md hover:shadow-glow-sm flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3 text-xs font-extrabold tracking-wider text-white uppercase transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Sparkles className="animate-spin-slow h-4 w-4 text-amber-300" />
              <span>{t("userAchievements.attendeeBadgeCenter")}</span>
            </button>
          </div>
        </div>

        {/* PROGRESSION ANALYTICS ROW */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* XP PROGRESS WHEEL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-bg/60 border-border shadow-premium-md relative flex flex-col items-center justify-center space-y-5 overflow-hidden rounded-3xl border p-6 text-center backdrop-blur-xl"
          >
            {/* Background absolute decorations */}
            <div className="bg-primary/10 absolute -top-16 -right-16 h-32 w-32 rounded-full blur-2xl" />
            <div className="bg-secondary/10 absolute -bottom-16 -left-16 h-32 w-32 rounded-full blur-2xl" />

            <div className="text-text-light flex items-center gap-2 text-xs font-black tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              {t("userAchievements.rankProgression")}
            </div>

            {/* Radial SVG Circle Wheel */}
            <div className="relative h-[180px] w-[180px] shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="xpWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f53f5e" />
                  </linearGradient>
                </defs>

                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-border"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Progress Ring */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#xpWheelGrad)"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>

              {/* Center Glassmorphic Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-text-light text-[10px] font-black tracking-widest uppercase">
                  {t("userAchievements.level")}
                </span>
                <span className="text-text mt-1 text-3xl leading-none font-black tracking-tighter">
                  {currentLevel}
                </span>
                <span className="text-primary bg-primary/10 border-primary/20 mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="border-border w-full space-y-1 border-t pt-3">
              <div className="text-text-light flex justify-between text-xs font-bold">
                <span>{t("userAchievements.xpInLevel")}</span>
                <span className="text-text font-black">{xpInCurrentLevel} / 500</span>
              </div>
              <div className="text-text-light flex justify-between text-xs font-bold">
                <span>{t("userAchievements.nextLevelIn")}</span>
                <span className="text-primary font-black">{xpNeededForNext} XP</span>
              </div>
              <div className="text-text-light/80 flex justify-between pt-2 text-[11px] font-bold tracking-wider uppercase">
                <span>{t("userAchievements.totalAccumulated")}</span>
                <span className="text-text font-extrabold">{derivedXP} XP</span>
              </div>
            </div>
          </motion.div>

          {/* ANALYTICS METRIC CARDS (COLSPAN: 2) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-2">
            {/* Card 1: Attended */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card-bg/60 border-border shadow-premium-sm hover:shadow-premium-md group rounded-3xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 text-primary shadow-premium-sm shrink-0 rounded-2xl p-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <p className="text-text-light text-[10px] leading-none font-black tracking-widest uppercase">
                  {t("userAchievements.metricsRegistrations")}
                </p>
                <p className="text-text mt-2.5 text-3xl font-black tracking-tight">{totalEvents}</p>
              </div>
            </motion.div>

            {/* Card 2: Streaks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-card-bg/60 border-border shadow-premium-sm hover:shadow-premium-md group rounded-3xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="bg-secondary/10 text-secondary shadow-premium-sm shrink-0 rounded-2xl p-3">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-secondary animate-pulse text-[10px] font-black">
                  {t("userAchievements.metricsActive")}
                </span>
              </div>
              <div>
                <p className="text-text-light text-[10px] leading-none font-black tracking-widest uppercase">
                  {t("userAchievements.metricsStreakRange")}
                </p>
                <p className="text-text mt-2.5 text-3xl font-black tracking-tight">
                  {currentStreak}{" "}
                  <span className="text-text-light text-xs font-bold tracking-widest uppercase">
                    {t("userAchievements.metricsEventsUnit")}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Card 3: Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card-bg/60 border-border shadow-premium-sm hover:shadow-premium-md group rounded-3xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 text-primary shadow-premium-sm shrink-0 rounded-2xl p-3">
                  <Award className="h-5 w-5" />
                </div>
                <CheckCircle className="text-primary h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <p className="text-text-light text-[10px] leading-none font-black tracking-widest uppercase">
                  {t("userAchievements.metricsTokensClaimed")}
                </p>
                <p className="text-text mt-2.5 text-3xl font-black tracking-tight">
                  {unlockedCount}{" "}
                  <span className="text-text-light text-xs font-bold tracking-tight">
                    / {operationalBadges.length}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ONBOARDING CHECKLIST FOR USERS WITH ZERO ACHIEVEMENTS */}
        {unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="from-primary/20 via-primary/10 to-card-bg/60 border-primary/20 shadow-premium-lg space-y-4 rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-450 h-5 w-5 animate-bounce" />
              <h2 className="text-md font-black tracking-tight text-white uppercase">
                {t("userAchievements.checklistHeading")}
              </h2>
            </div>
            <p className="text-text-light max-w-xl text-xs leading-relaxed">
              {t("userAchievements.checklistDescription")}
            </p>
            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
              {onboardingQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`rounded-2xl border p-4 transition ${
                    quest.done
                      ? "text-emerald-350 border-emerald-500/25 bg-emerald-500/10"
                      : "bg-bg/40 border-border text-text-light"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-text-light text-[10px] font-black tracking-wider uppercase">
                      {t("userAchievements.checklistQuest")}
                    </span>
                    {quest.done ? (
                      <span className="text-emerald-450 rounded bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase">
                        {t("userAchievements.checklistCompleted")}
                      </span>
                    ) : (
                      <span className="bg-bg/80 text-text-light/60 rounded px-2 py-0.5 text-[8px] font-black uppercase">
                        {t("userAchievements.checklistPending")}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-white">{quest.title}</h4>
                  <p className="text-text-light mt-1 text-[10px]">{quest.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MILESTONE BADGES SECTION */}
        <section className="space-y-4">
          <div className="border-border flex items-center gap-2 border-b pb-3">
            <h2 className="text-text text-lg font-black tracking-tight">
              {t("userAchievements.badgesSectionHeading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {operationalBadges.map((badge) => {
              const isOpen = expandedBadgeId === badge.id;

              return (
                <motion.div
                  key={badge.id}
                  layout
                  className={`flex cursor-pointer flex-col rounded-3xl border p-5 transition-all ${
                    badge.earned
                      ? "bg-card-bg/60 border-border shadow-premium-sm hover:shadow-premium-md hover:shadow-glow-sm backdrop-blur-xl"
                      : "bg-card-bg/15 border-border/30 opacity-70 shadow-none hover:opacity-100"
                  }`}
                  onClick={() => toggleExpand(badge.id)}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`shadow-premium-sm shrink-0 rounded-2xl p-2.5 text-3xl ${badge.earned ? "bg-primary/10" : "bg-bg grayscale filter"}`}
                    >
                      {badge.icon}
                    </span>
                    {badge.earned ? (
                      <span className="dark:text-emerald-350 shadow-premium-sm rounded-full border border-emerald-100/35 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-emerald-700 uppercase dark:bg-emerald-950/40">
                        {t("userAchievements.badgesSectionUnlocked")}
                      </span>
                    ) : (
                      <span className="bg-bg text-text-light flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase">
                        <Lock className="h-2.5 w-2.5" />
                        {t("userAchievements.badgesSectionLocked")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-text mt-4 text-base font-extrabold tracking-tight">
                    {badge.name}
                  </h3>
                  <p className="text-text-light mt-1 line-clamp-2 text-xs leading-relaxed">
                    {badge.description}
                  </p>

                  {/* Accordion expand indicator */}
                  <div className="text-primary border-border mt-4 flex items-center gap-1 border-t pt-3 text-[10px] font-black tracking-wider uppercase">
                    <span>{t("userAchievements.badgesSectionInspectDetails")}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </motion.div>
                  </div>

                  {/* COLLAPSIBLE TROPHY ACCORDION DRAWER */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-border mt-3 space-y-4 overflow-hidden border-t border-dashed pt-4"
                      >
                        {/* Requirement details */}
                        <div className="space-y-1">
                          <span className="text-text-light block text-[9px] leading-none font-black tracking-widest uppercase">
                            {t("userAchievements.badgesSectionRequirement")}
                          </span>
                          <span className="text-text-light mt-1 block text-xs leading-relaxed font-semibold">
                            {badge.details}
                          </span>
                        </div>

                        {/* Progress Bar indicator */}
                        <div className="space-y-1.5">
                          <div className="text-text-light flex justify-between text-[10px] font-black tracking-wide uppercase">
                            <span>{t("userAchievements.badgesSectionProgress")}</span>
                            <span>
                              {badge.currentProgress} / {badge.targetProgress}
                            </span>
                          </div>
                          <div className="bg-bg h-2 w-full overflow-hidden rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, (badge.currentProgress / badge.targetProgress) * 100)}%`,
                              }}
                              className={`h-full rounded-full bg-gradient-to-r ${badge.earned ? "from-emerald-500 to-teal-500" : "from-primary/60 to-primary"}`}
                            />
                          </div>
                        </div>

                        {/* Log logs */}
                        <div className="space-y-2">
                          <span className="block text-[9px] leading-none font-black tracking-widest text-slate-400 uppercase">
                            {t("userAchievements.badgesSectionCompletionLog")}
                          </span>
                          <div className="space-y-1">
                            {(badge.log || []).map((logItem, idx) => (
                              <div
                                key={idx}
                                className="text-text-light flex items-center gap-1.5 text-[10px] font-bold"
                              >
                                <span className="bg-primary h-1 w-1 shrink-0 rounded-full" />
                                <span>{logItem}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Share section */}
                        {badge.earned && (
                          <div
                            className="border-border space-y-2.5 border-t border-dashed pt-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-text-light block text-[9px] leading-none font-black tracking-widest uppercase">
                              {t("userAchievements.badgesSectionShare")}
                            </span>
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              <button
                                onClick={() => setActiveShareBadge(badge)}
                                className="from-primary to-secondary shadow-premium-sm hover:shadow-glow-sm flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r px-3 py-1.5 text-[10px] font-extrabold text-white transition-all hover:scale-[1.03] hover:opacity-90"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                <span>{t("userAchievements.badgesSectionShareCertificate")}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Lock Warning if locked */}
                        {!badge.earned && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-rose-100/20 bg-rose-50/50 p-2 px-3 text-[9px] leading-tight font-bold text-rose-600 dark:border-rose-900/10 dark:bg-rose-950/15 dark:text-rose-400">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                            <span>{t("userAchievements.badgesSectionLockedWarning")}</span>
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

        {/* Quest Center */}
        <QuestCenter
          totalEvents={achievements.totalEvents}
          currentStreak={achievements.currentStreak}
          gssocEvents={achievements.gssocEvents}
        />
      </div>

      {/* SHARE CARD GENERATOR OVERLAY MODAL */}
      <AnimatePresence>
        {activeShareBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border-border shadow-premium-lg relative w-full max-w-3xl space-y-5 rounded-3xl border p-6 text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveShareBadge(null)}
                className="bg-bg border-border text-text-light absolute top-5 right-5 cursor-pointer rounded-xl border p-2 transition-colors hover:opacity-90"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <h3 className="text-md text-primary flex items-center gap-2 font-black tracking-widest uppercase">
                  <Share2 className="h-4 w-4 animate-pulse" /> {t("userAchievements.modalHeading")}
                </h3>
                <p className="text-text-light text-xs">{t("userAchievements.modalDescription")}</p>
              </div>

              {/* Dual-Pane Grid Layout */}
              <div className="grid grid-cols-1 gap-6 pt-1 md:grid-cols-2">
                {/* Column 1: Message Customizer & Controls */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-text-light block text-[10px] font-black tracking-widest uppercase">
                      {t("userAchievements.modalCustomizeStory")}
                    </label>
                    <textarea
                      value={shareStory}
                      onChange={(e) => setShareStory(e.target.value)}
                      rows={4}
                      className="bg-bg border-border focus:border-primary focus:ring-primary text-text w-full resize-none rounded-2xl border p-3.5 text-xs leading-relaxed transition-all outline-none focus:ring-1"
                      placeholder={t("userAchievements.modalStoryPlaceholder")}
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>{t("userAchievements.modalInteractiveComposer")}</span>
                      <span
                        className={shareStory.length > 280 ? "font-extrabold text-rose-500" : ""}
                      >
                        {shareStory.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Quick Emojis & Hashtags Helpers */}
                  <div className="space-y-1.5">
                    <span className="text-text-light block text-[9px] font-black tracking-widest uppercase">
                      {t("userAchievements.modalQuickTags")}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["#GSSoC2026", "#OpenSource", "#DevLife", "#LearnToCode"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!shareStory.includes(tag)) {
                              setShareStory((prev) => `${prev.trim()} ${tag}`);
                            }
                          }}
                          className="bg-bg hover:bg-card-bg text-text border-border cursor-pointer rounded-lg border px-2.5 py-1 text-[9px] font-extrabold transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleShareTwitter}
                        className="border-border bg-bg hover:bg-card-bg text-text flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition"
                      >
                        <Twitter size={13} className="text-sky-400" />
                        <span>{t("userAchievements.modalPostOnX")}</span>
                      </button>
                      <button
                        onClick={handleShareLinkedIn}
                        className="border-border bg-bg hover:bg-card-bg text-text flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition"
                      >
                        <Linkedin size={13} className="text-blue-500" />
                        <span>{t("userAchievements.modalShareLinkedIn")}</span>
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareStory);
                          toast.success(t("userAchievements.toastStoryCopied"));
                        } catch {
                          toast.error(t("userAchievements.toastCopyFailed"));
                        }
                      }}
                      className="bg-bg hover:bg-card-bg border-border text-text flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition"
                    >
                      <CheckCircle size={13} className="text-emerald-500" />
                      <span>{t("userAchievements.modalCopyStory")}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSVG(activeShareBadge)}
                      className="from-primary to-secondary shadow-premium-md hover:shadow-glow-sm flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-xs font-black tracking-wider text-white uppercase transition hover:opacity-90"
                    >
                      <Award size={13} className="text-yellow-350" />
                      <span>{t("userAchievements.modalDownloadCertificate")}</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: Live Feed Preview */}
                <div className="bg-bg/40 border-border flex flex-col justify-between space-y-3.5 rounded-2xl border p-4">
                  <div className="border-border flex items-center justify-between border-b pb-2">
                    <span className="text-text-light text-[10px] font-black tracking-widest uppercase">
                      {t("userAchievements.modalLiveFeedMockup")}
                    </span>
                    {/* Switch layout platform selector */}
                    <div className="flex gap-1.5">
                      {["twitter", "linkedin"].map((plat) => (
                        <button
                          key={plat}
                          onClick={() => setSharePlatform(plat)}
                          className={`cursor-pointer rounded px-2 py-0.5 text-[8px] font-black tracking-widest uppercase transition ${
                            sharePlatform === plat
                              ? "bg-primary text-white"
                              : "bg-bg text-text-light hover:text-text"
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Twitter/X Post Mockup */}
                  {sharePlatform === "twitter" ? (
                    <div className="border-slate-850/85 space-y-3 rounded-xl border bg-black p-4 text-left text-white shadow-none select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-indigo-400">
                          EV
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold hover:underline">
                              Developer Achievement
                            </span>
                            <span className="h-3 w-3 text-sky-400">✔️</span>
                          </div>
                          <p className="text-[10px] text-slate-500">@eventra_developer</p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-200">
                        {shareStory || t("userAchievements.modalPreviewFallback")}
                      </p>

                      {/* Attached Card Mockup */}
                      <div className="border-slate-850 overflow-hidden rounded-2xl border bg-slate-950/70">
                        <div className="border-slate-850 border-b bg-gradient-to-br from-indigo-950/50 to-slate-950 p-5 text-center">
                          <span className="mx-auto inline-block rounded-2xl border border-indigo-500/25 bg-indigo-900/30 p-3 text-3xl shadow-none">
                            {activeShareBadge.icon}
                          </span>
                          <h4 className="mt-3 text-sm font-extrabold tracking-tight text-white">
                            {activeShareBadge.name}
                          </h4>
                          <p className="mt-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                            Verified Achieve Token
                          </p>
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                            eventra.dev
                          </p>
                          <h5 className="mt-0.5 text-[11px] font-extrabold text-slate-200">
                            Claimed Level {currentLevel} Attendee Badge!
                          </h5>
                          <p className="mt-1 line-clamp-1 text-[10px] leading-tight text-slate-500">
                            Register for meetups, unlock streak multipliers, and grow your XP.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Render LinkedIn Article Mockup */
                    <div className="bg-card-bg border-border text-text-light space-y-3 rounded-xl border p-4 text-left shadow-none select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-bg text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-black">
                          EV
                        </div>
                        <div>
                          <h4 className="text-xs font-black hover:text-blue-600 hover:underline">
                            Eventra Developer
                          </h4>
                          <p className="mt-1 text-[9px] leading-none text-slate-500">
                            GSSoC Achiever • Event Progression Engine
                          </p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {shareStory || t("userAchievements.modalPreviewFallback")}
                      </p>

                      {/* Attached Article Mockup */}
                      <div className="bg-bg/80 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 text-center dark:border-slate-800 dark:from-indigo-950/20 dark:to-slate-950">
                          <span className="mx-auto inline-block rounded-2xl border border-indigo-300/30 bg-indigo-100 p-3 text-3xl shadow-none dark:border-indigo-500/25 dark:bg-indigo-900/30">
                            {activeShareBadge.icon}
                          </span>
                          <h4 className="mt-3 text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {activeShareBadge.name}
                          </h4>
                          <p className="mt-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                            Achiever Token Certification
                          </p>
                        </div>
                        <div className="p-3">
                          <p className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                            EVENTRA.DEV
                          </p>
                          <h5 className="mt-0.5 text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                            Unlocked Badge Milestone on Eventra
                          </h5>
                          <p className="mt-1 line-clamp-1 text-[10px] leading-tight text-slate-500">
                            Developer successfully completed the &apos;{activeShareBadge.name}&apos;
                            challenges.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom helper info */}
                  <div className="text-slate-550 text-center text-[9px] leading-snug">
                    ℹ️ Select Twitter or LinkedIn tab to preview the card layout. Make sure to
                    complete your developer challenges to boost your XP level!
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATTENDEE EVENT BADGE GENERATOR OVERLAY MODAL */}
      <AnimatePresence>
        {isBadgeModalOpen && (
          <EventBadgeGenerator
            onClose={() => setIsBadgeModalOpen(false)}
            userStats={{ totalEvents, currentStreak, unlockedCount }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
