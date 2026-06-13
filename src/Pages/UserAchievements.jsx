import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuestCenter from '../components/gamification/QuestCenter';
import EventBadgeGenerator from '../components/user/EventBadgeGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import XPProgressWheel from '../components/user/achievements/XPProgressWheel';
import AnalyticsMetrics from '../components/user/achievements/AnalyticsMetrics';
import OnboardingChecklist from '../components/user/achievements/OnboardingChecklist';
import MilestoneBadges from '../components/user/achievements/MilestoneBadges';
import ShareBadgeModal from '../components/user/achievements/ShareBadgeModal';

export default function UserAchievements() {
  const { t } = useTranslation();
  useDocumentTitle(t("userAchievements.pageTitle"));
  const { achievements, fetchAchievements } = useNotification();
  const [activeShareBadge, setActiveShareBadge] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const fallbackBadges = useMemo(() => [
    {
      id: 'first-step', name: 'First Step',
      description: 'Registered for your first event on Eventra!',
      icon: '🚀', currentProgress: Math.min(1, achievements.totalEvents || 0),
      targetProgress: 1, earned: (achievements.totalEvents || 0) >= 1,
      rewardXP: 100,
      details: 'Kickstart your open-source registration journey. Join any workshop or hackathon to claim this token.',
      log: ['+100 XP awarded', 'Profile Starter badge enabled'],
    },
    {
      id: 'event-enthusiast', name: 'Event Enthusiast',
      description: 'Registered for 5 separate platform events and meetups.',
      icon: '🔥', currentProgress: achievements.totalEvents || 0,
      targetProgress: 5, earned: (achievements.totalEvents || 0) >= 5,
      rewardXP: 250,
      details: 'Attend workshops, webinars, and hackathons. Build consistency across local communities.',
      log: ['+250 XP awarded', 'Community Enthusiast badge enabled'],
    },
    {
      id: 'streak-master', name: 'Streak Master',
      description: 'Maintained a multi-event active registration streak.',
      icon: '👑', currentProgress: achievements.currentStreak || 0,
      targetProgress: 3, earned: (achievements.currentStreak || 0) >= 3,
      rewardXP: 300,
      details: 'Register for events on consecutive schedules. Streaks scale your multiplier benefits.',
      log: ['+300 XP awarded', 'Elite Streaker badge enabled'],
    },
    {
      id: 'gssoc-contributor', name: 'GSSoC Contributor',
      description: 'Register for GSSoC specialized repository hackathons.',
      icon: '💻', currentProgress: Math.min(achievements.gssocEvents || 0, 2),
      targetProgress: 2, earned: (achievements.gssocEvents || 0) >= 2,
      rewardXP: 200,
      details: 'Collaborate with global open-source developers and sync your GSSoC progress boards.',
      log: ['+200 XP awarded', 'GSSoC Specialist badge enabled'],
    },
    {
      id: 'ai-pioneer', name: 'AI Pioneer',
      description: 'Complete highly technical AI/Web3 workshops.',
      icon: '🔮', currentProgress: Math.min(achievements.totalEvents || 0, 4),
      targetProgress: 4, earned: (achievements.totalEvents || 0) >= 4,
      rewardXP: 400,
      details: 'Dive deep into AI integrations, blockchain, and next-generation Web3 protocols.',
      log: ['+400 XP awarded', 'AI Specialist badge enabled'],
    },
  ], [achievements.totalEvents, achievements.currentStreak, achievements.gssocEvents]);

  const operationalBadges = achievements.badges && achievements.badges.length > 0
    ? achievements.badges.map((b, idx) => ({
        id: b.id || `badge-${idx}`,
        name: b.name,
        description: b.description,
        icon: b.icon || '🏆',
        currentProgress: b.earned ? 1 : 0,
        targetProgress: 1,
        earned: b.earned,
        rewardXP: 150,
        details: b.description,
        log: ['+150 XP awarded'],
      }))
    : fallbackBadges;

  const unlockedCount = operationalBadges.filter(b => b.earned).length;
  const totalEvents = achievements.totalEvents || 0;
  const currentStreak = achievements.currentStreak || 0;

  const derivedXP = (totalEvents * 100) + (currentStreak * 150) + (unlockedCount * 250) + 75;
  const currentLevel = Math.floor(derivedXP / 500) + 1;
  const xpInCurrentLevel = derivedXP % 500;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / 500) * 100));
  const xpNeededForNext = 500 - xpInCurrentLevel;

  const onboardingQuests = [
    { id: 'step1', title: 'Register for your first event', description: 'Unlock your first registration milestone', done: totalEvents >= 1 },
    { id: 'step2', title: 'Start a streak', description: 'Participate in multiple events consecutively', done: currentStreak >= 1 },
    { id: 'step3', title: 'Unlock a milestone token', description: 'Complete requirements to claim a badge', done: unlockedCount >= 1 },
  ];

  return (
    <div className="min-h-screen bg-bg text-text py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs tracking-wider uppercase">
              <Trophy className="w-4.5 h-4.5 animate-pulse" />
              {t("userAchievements.progressionStudio")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-text to-primary">
              {t("userAchievements.heading")}
            </h1>
            <p className="text-text-light mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {t("userAchievements.description")}
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-secondary hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-premium-md hover:shadow-glow-sm active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>{t("userAchievements.attendeeBadgeCenter")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <XPProgressWheel
            currentLevel={currentLevel}
            progressPercent={progressPercent}
            xpInCurrentLevel={xpInCurrentLevel}
            xpNeededForNext={xpNeededForNext}
            derivedXP={derivedXP}
          />
          <AnalyticsMetrics
            totalEvents={totalEvents}
            currentStreak={currentStreak}
            unlockedCount={unlockedCount}
            operationalBadges={operationalBadges}
          />
        </div>

        <OnboardingChecklist onboardingQuests={onboardingQuests} />

        <MilestoneBadges
          operationalBadges={operationalBadges}
          onShareBadge={setActiveShareBadge}
        />

        <QuestCenter
          totalEvents={achievements.totalEvents}
          currentStreak={achievements.currentStreak}
          gssocEvents={achievements.gssocEvents}
        />
      </div>

      <ShareBadgeModal
        activeShareBadge={activeShareBadge}
        setActiveShareBadge={setActiveShareBadge}
        currentLevel={currentLevel}
      />

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
