import {
  Award,
  BarChart3,
  Bookmark,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    name: "AI & Machine Learning",
    speaker: "Dr. Priya Sharma",
    bookmarks: 245,
    registrations: 320,
    attendance: 285,
    resourceViews: 410,
    feedbackRating: 4.8,
  },
  {
    id: 2,
    name: "Full Stack Development",
    speaker: "Rahul Mehta",
    bookmarks: 210,
    registrations: 290,
    attendance: 250,
    resourceViews: 365,
    feedbackRating: 4.6,
  },
  {
    id: 3,
    name: "Data Science Workshop",
    speaker: "Anita Patel",
    bookmarks: 175,
    registrations: 240,
    attendance: 205,
    resourceViews: 310,
    feedbackRating: 4.5,
  },
  {
    id: 4,
    name: "Cybersecurity Essentials",
    speaker: "Arjun Singh",
    bookmarks: 130,
    registrations: 190,
    attendance: 160,
    resourceViews: 250,
    feedbackRating: 4.3,
  },
];

const EventSessionPopularityAnalytics = ({
  sessions = DEFAULT_SESSIONS,
}) => {
  const analytics = useMemo(() => {
    const normalized = sessions.map((session) => {
      const bookmarks = Number(session.bookmarks || 0);
      const registrations = Number(
        session.registrations || 0
      );
      const attendance = Number(session.attendance || 0);
      const resourceViews = Number(
        session.resourceViews || 0
      );
      const feedbackRating = Number(
        session.feedbackRating || 0
      );

      const attendanceRate =
        registrations > 0
          ? (attendance / registrations) * 100
          : 0;

      /*
       * Popularity score:
       * - Bookmarks: 20%
       * - Registrations: 25%
       * - Attendance rate: 25%
       * - Resource views: 15%
       * - Feedback rating: 15%
       */
      const popularityScore =
        bookmarks * 0.2 +
        registrations * 0.25 +
        attendanceRate * 0.25 +
        resourceViews * 0.15 +
        feedbackRating * 15;

      return {
        ...session,
        bookmarks,
        registrations,
        attendance,
        resourceViews,
        feedbackRating,
        attendanceRate,
        popularityScore,
      };
    });

    const ranked = [...normalized]
      .sort(
        (a, b) =>
          b.popularityScore - a.popularityScore
      )
      .map((session, index) => ({
        ...session,
        rank: index + 1,
      }));

    const totalBookmarks = normalized.reduce(
      (sum, session) => sum + session.bookmarks,
      0
    );

    const totalRegistrations = normalized.reduce(
      (sum, session) => sum + session.registrations,
      0
    );

    const totalAttendance = normalized.reduce(
      (sum, session) => sum + session.attendance,
      0
    );

    const totalResourceViews = normalized.reduce(
      (sum, session) => sum + session.resourceViews,
      0
    );

    const averageRating =
      normalized.length > 0
        ? normalized.reduce(
            (sum, session) =>
              sum + session.feedbackRating,
            0
          ) / normalized.length
        : 0;

    const overallAttendanceRate =
      totalRegistrations > 0
        ? (totalAttendance / totalRegistrations) * 100
        : 0;

    return {
      ranked,
      totalBookmarks,
      totalRegistrations,
      totalAttendance,
      totalResourceViews,
      averageRating,
      overallAttendanceRate,
      topSession: ranked[0] || null,
    };
  }, [sessions]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <TrendingUp size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Popularity Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Identify which sessions receive the highest
              participant interest using bookmarks, registrations,
              attendance, resource views, and feedback.
            </p>
          </div>
        </div>

        {analytics.topSession && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-center dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-center justify-center gap-1.5">
              <Award
                size={13}
                className="text-amber-500"
              />

              <p className="text-[6px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Most Popular
              </p>
            </div>

            <p className="mt-1 max-w-[180px] text-[8px] font-black text-amber-700 dark:text-amber-300">
              {analytics.topSession.name}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Bookmark}
          label="Bookmarks"
          value={analytics.totalBookmarks}
        />

        <MetricCard
          icon={Users}
          label="Registrations"
          value={analytics.totalRegistrations}
        />

        <MetricCard
          icon={UserCheck}
          label="Attendance"
          value={analytics.totalAttendance}
        />

        <MetricCard
          icon={Eye}
          label="Resource Views"
          value={analytics.totalResourceViews}
        />

        <MetricCard
          icon={Star}
          label="Avg Rating"
          value={analytics.averageRating.toFixed(1)}
        />
      </div>

      {/* Ranking */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BarChart3
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Session Popularity Ranking
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Sessions ranked using aggregated engagement
                signals.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {analytics.ranked.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
            />
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Session Performance Comparison
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Compare the key popularity signals for every session.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {analytics.ranked.map((session) => (
            <div key={session.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="max-w-[70%] truncate text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  {session.name}
                </span>

                <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                  Score {Math.round(session.popularityScore)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (session.popularityScore /
                        Math.max(
                          analytics.ranked[0]
                            ?.popularityScore || 1,
                          1
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Details */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analytics.ranked.slice(0, 4).map((session) => (
          <div
            key={session.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Rank #{session.rank}
                </p>

                <h4 className="mt-2 line-clamp-2 text-[9px] font-black text-slate-800 dark:text-white">
                  {session.name}
                </h4>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-900/20">
                <Star size={14} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SmallMetric
                icon={Bookmark}
                label="Bookmarks"
                value={session.bookmarks}
              />

              <SmallMetric
                icon={Users}
                label="Registrations"
                value={session.registrations}
              />

              <SmallMetric
                icon={UserCheck}
                label="Attendance"
                value={`${Math.round(
                  session.attendanceRate
                )}%`}
              />

              <SmallMetric
                icon={Eye}
                label="Resources"
                value={session.resourceViews}
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[6px] font-bold text-slate-400">
                Feedback
              </span>

              <span className="flex items-center gap-1 text-[7px] font-black text-amber-500">
                <Star size={10} />
                {session.feedbackRating.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {analytics.topSession && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-green-600 dark:bg-slate-900 dark:text-green-400">
              <TrendingUp size={15} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
                Session Insight
              </p>

              <h3 className="mt-1 text-[9px] font-bold text-green-800 dark:text-green-300">
                {analytics.topSession.name} is currently the most
                popular session.
              </h3>

              <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
                It leads the session ranking based on combined
                participant interest, registrations, attendance,
                resource engagement, and feedback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <MessageSquare
            size={14}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-[6px] leading-4 text-slate-400">
            Popularity is calculated from multiple session-level
            signals rather than a single metric. This provides a
            broader view of participant interest and engagement.
          </p>
        </div>
      </div>
    </section>
  );
};

const SessionRow = ({ session }) => {
  const rankStyles = {
    1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    2: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  };

  return (
    <div className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
            rankStyles[session.rank] ||
            "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          }`}
        >
          #{session.rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                {session.name}
              </h4>

              <p className="mt-1 text-[6px] text-slate-400">
                {session.speaker}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8px] font-black text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={11} />
              {Math.round(session.popularityScore)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <InlineMetric
              icon={Bookmark}
              value={session.bookmarks}
              label="Bookmarks"
            />

            <InlineMetric
              icon={Users}
              value={session.registrations}
              label="Registrations"
            />

            <InlineMetric
              icon={UserCheck}
              value={session.attendance}
              label="Attendance"
            />

            <InlineMetric
              icon={Eye}
              value={session.resourceViews}
              label="Views"
            />

            <InlineMetric
              icon={Star}
              value={session.feedbackRating.toFixed(1)}
              label="Rating"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
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

const InlineMetric = ({
  icon: Icon,
  value,
  label,
}) => (
  <div className="flex items-center gap-2">
    <Icon size={11} className="text-slate-400" />

    <div>
      <p className="text-[7px] font-black text-slate-700 dark:text-slate-300">
        {value}
      </p>

      <p className="text-[5px] text-slate-400">
        {label}
      </p>
    </div>
  </div>
);

const SmallMetric = ({
  icon: Icon,
  label,
  value,
}) => (
  <div>
    <div className="flex items-center gap-1 text-slate-400">
      <Icon size={9} />

      <span className="text-[5px] font-bold">
        {label}
      </span>
    </div>

    <p className="mt-1 text-[8px] font-black text-slate-700 dark:text-slate-300">
      {value}
    </p>
  </div>
);

export default EventSessionPopularityAnalytics;