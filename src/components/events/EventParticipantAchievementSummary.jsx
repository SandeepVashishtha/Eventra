import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Medal,
  Star,
  Trophy,
} from "lucide-react";

const DEFAULT_ACHIEVEMENTS = [
  {
    id: 1,
    title: "AI Innovation Summit Certificate",
    event: "AI Innovation Summit",
    type: "Certificate",
    date: "Aug 13, 2026",
    description: "Successfully completed the event.",
  },
  {
    id: 2,
    title: "Hackathon Finalist",
    event: "Hackathon 2026",
    type: "Award",
    date: "Jul 28, 2026",
    description: "Reached the final round of the hackathon.",
  },
  {
    id: 3,
    title: "Active Participant",
    event: "Data Science Workshop",
    type: "Badge",
    date: "Jul 10, 2026",
    description: "Completed multiple sessions and activities.",
  },
  {
    id: 4,
    title: "5 Events Completed",
    event: "Eventra",
    type: "Milestone",
    date: "Jun 25, 2026",
    description: "Successfully participated in five events.",
  },
];

const getAchievementIcon = (type) => {
  switch (type) {
    case "Certificate":
      return BadgeCheck;
    case "Award":
      return Trophy;
    case "Badge":
      return Medal;
    case "Milestone":
      return Star;
    default:
      return Award;
  }
};

const EventParticipantAchievementSummary = ({
  achievements = DEFAULT_ACHIEVEMENTS,
  participationCount = 5,
}) => {
  const certificates = achievements.filter(
    (item) => item.type === "Certificate"
  ).length;

  const awards = achievements.filter(
    (item) => item.type === "Award"
  ).length;

  const badges = achievements.filter(
    (item) => item.type === "Badge"
  ).length;

  const milestones = achievements.filter(
    (item) => item.type === "Milestone"
  ).length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Trophy size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Profile
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Achievement Summary
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              View certificates, awards, badges, milestones, and
              participation achievements earned through Eventra.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Total Achievements
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {achievements.length}
          </p>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={BadgeCheck}
          label="Certificates"
          value={certificates}
        />

        <StatCard
          icon={Trophy}
          label="Awards"
          value={awards}
        />

        <StatCard
          icon={Medal}
          label="Badges"
          value={badges}
        />

        <StatCard
          icon={Star}
          label="Milestones"
          value={milestones}
        />

        <StatCard
          icon={CalendarDays}
          label="Events"
          value={participationCount}
        />
      </div>

      {/* Achievement Timeline */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Award
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Earned Achievements
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                A centralized record of your Eventra achievements.
              </p>
            </div>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="p-10 text-center">
            <Trophy
              size={30}
              className="mx-auto text-slate-300 dark:text-slate-700"
            />

            <p className="mt-4 text-[8px] font-bold text-slate-700 dark:text-slate-300">
              No achievements yet
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Participate in events to start building your achievement
              record.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {achievements.map((achievement) => (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        )}
      </div>

      {/* Participation Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Participation Progress
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Your overall Eventra participation record.
            </p>
          </div>

          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">
            {participationCount} Events
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${Math.min(participationCount * 10, 100)}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2 text-[6px] text-slate-400">
          <CheckCircle2 size={11} />

          Keep participating to unlock more badges and milestones.
        </div>
      </div>
    </section>
  );
};

const AchievementRow = ({ achievement }) => {
  const Icon = getAchievementIcon(achievement.type);

  return (
    <div className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                {achievement.title}
              </h4>

              <p className="mt-1 text-[7px] text-slate-400">
                {achievement.event}
              </p>
            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {achievement.type}
            </span>
          </div>

          <p className="mt-3 text-[7px] leading-relaxed text-slate-500 dark:text-slate-400">
            {achievement.description}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[6px] text-slate-400">
            <CalendarDays size={10} />
            Earned {achievement.date}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default EventParticipantAchievementSummary;