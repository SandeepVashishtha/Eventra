import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

export default function UserAchievements() {
  const { achievements, fetchAchievements } = useNotification();

  useEffect(() => {
    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // System fallback badges if the array returns empty during database synchronization
  const fallbackBadges = [
    { id: 1, name: 'First Step', description: 'Registered for your first event!', earned: true, icon: '🚀' },
    { id: 2, name: 'Event Enthusiast', description: 'Attended 5 separate community meetups', earned: achievements.totalEvents >= 5, icon: '🔥' },
    { id: 3, name: 'Streak Master', description: 'Maintained a multi-event attendance streak', earned: achievements.currentStreak >= 3, icon: '👑' },
  ];

  const operationalBadges = achievements.badges.length > 0 ? achievements.badges : fallbackBadges;

  return (
    <div className="container mx-auto p-6 max-w-6xl mt-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">Your Achievement Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track your growth, milestones, and participation metrics across Eventra events.</p>
      </header>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-2xl">📅</div>
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-slate-400 uppercase">Events Attended</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{achievements.totalEvents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/40 text-orange-500 dark:text-orange-400 rounded-lg text-2xl">⚡</div>
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-slate-400 uppercase">Active Streak</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{achievements.currentStreak} Events</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-lg text-2xl">🏅</div>
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-slate-400 uppercase">Badges Unlocked</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              {operationalBadges.filter(b => b.earned).length} / {operationalBadges.length}
            </p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Milestone Tokens & Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {operationalBadges.map((badge) => (
            <div 
              key={badge.id || badge.name} 
              className={`p-5 rounded-xl border transition-all ${
                badge.earned 
                  ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm' 
                  : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60 filter grayscale'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl bg-gray-50 dark:bg-slate-800 p-2 rounded-lg">{badge.icon || '🏆'}</span>
                {badge.earned ? (
                  <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 px-2.5 py-0.5 rounded-full">Unlocked</span>
                ) : (
                  <span className="text-xs font-semibold bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full">Locked</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mt-4">{badge.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}