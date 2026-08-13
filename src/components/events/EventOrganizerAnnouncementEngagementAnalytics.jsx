import {
  BarChart3,
  CheckCircle2,
  Eye,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Event Schedule Updated",
    sentCount: 900,
    viewedCount: 810,
    linkClicks: 420,
  },
  {
    id: 2,
    title: "Important Registration Reminder",
    sentCount: 900,
    viewedCount: 765,
    linkClicks: 315,
  },
  {
    id: 3,
    title: "Workshop Room Change",
    sentCount: 900,
    viewedCount: 630,
    linkClicks: 180,
  },
];

const EventOrganizerAnnouncementEngagementAnalytics = ({
  announcements = DEFAULT_ANNOUNCEMENTS,
}) => {
  const analytics = useMemo(() => {
    return announcements.map((announcement) => {
      const sent = Number(announcement.sentCount || 0);
      const viewed = Number(announcement.viewedCount || 0);
      const clicks = Number(announcement.linkClicks || 0);

      const viewPercentage =
        sent > 0 ? (viewed / sent) * 100 : 0;

      const unreadCount = Math.max(sent - viewed, 0);

      const clickPercentage =
        viewed > 0 ? (clicks / viewed) * 100 : 0;

      return {
        ...announcement,
        sent,
        viewed,
        clicks,
        viewPercentage,
        unreadCount,
        clickPercentage,
      };
    });
  }, [announcements]);

  const summary = useMemo(() => {
    const sent = analytics.reduce(
      (sum, item) => sum + item.sent,
      0
    );

    const viewed = analytics.reduce(
      (sum, item) => sum + item.viewed,
      0
    );

    const clicks = analytics.reduce(
      (sum, item) => sum + item.clicks,
      0
    );

    const unread = analytics.reduce(
      (sum, item) => sum + item.unreadCount,
      0
    );

    const viewRate = sent > 0 ? (viewed / sent) * 100 : 0;

    const clickRate =
      viewed > 0 ? (clicks / viewed) * 100 : 0;

    return {
      sent,
      viewed,
      clicks,
      unread,
      viewRate,
      clickRate,
    };
  }, [analytics]);

  const bestAnnouncement = [...analytics].sort(
    (a, b) => b.viewPercentage - a.viewPercentage
  )[0];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <MessageSquare size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Announcement Engagement
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track how participants interact with event
              announcements and identify messages that may
              need additional attention.
            </p>
          </div>
        </div>

        {bestAnnouncement && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2
                size={13}
                className="text-green-600 dark:text-green-400"
              />

              <p className="text-[6px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                Highest View Rate
              </p>
            </div>

            <p className="mt-1 max-w-[180px] text-[8px] font-black text-green-700 dark:text-green-300">
              {bestAnnouncement.title}
            </p>

            <p className="mt-1 text-center text-[7px] font-bold text-green-600">
              {Math.round(bestAnnouncement.viewPercentage)}%
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Mail}
          label="Sent"
          value={summary.sent}
        />

        <MetricCard
          icon={Eye}
          label="Viewed"
          value={summary.viewed}
        />

        <MetricCard
          icon={TrendingUp}
          label="View Rate"
          value={`${summary.viewRate.toFixed(1)}%`}
        />

        <MetricCard
          icon={LinkIcon}
          label="Link Clicks"
          value={summary.clicks}
        />

        <MetricCard
          icon={Users}
          label="Unread"
          value={summary.unread}
        />
      </div>

      {/* Overall Engagement */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Overall Announcement Engagement
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Combined participant interaction across all
              announcements.
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {summary.viewRate.toFixed(1)}%
            </p>

            <p className="text-[6px] text-slate-400">
              view rate
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${Math.min(summary.viewRate, 100)}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[6px] font-bold text-slate-400">
            {summary.viewed} viewed
          </span>

          <span className="text-[6px] font-bold text-slate-400">
            {summary.unread} unread
          </span>
        </div>
      </div>

      {/* Announcement Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BarChart3
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Announcement Performance
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Compare engagement metrics for each announcement.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {analytics.map((announcement) => (
            <AnnouncementRow
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      </div>

      {/* View Rate Comparison */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          View Rate Comparison
        </h3>

        <p className="mt-1 text-[7px] text-slate-400">
          Identify announcements with strong or weak participant
          reach.
        </p>

        <div className="mt-5 space-y-5">
          {analytics.map((announcement) => (
            <div key={announcement.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="max-w-[70%] truncate text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  {announcement.title}
                </span>

                <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                  {announcement.viewPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      announcement.viewPercentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Detail Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analytics.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
          />
        ))}
      </div>

      {/* Insight */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <TrendingUp
            size={16}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Organizer Insight
            </p>

            <h3 className="mt-1 text-[9px] font-bold text-amber-800 dark:text-amber-300">
              {summary.unread > 0
                ? `${summary.unread} announcement views are still pending.`
                : "All announcement recipients have viewed the messages."}
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-amber-700 dark:text-amber-400">
              Use view rates and link clicks to identify
              announcements that may require a follow-up message
              or clearer communication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const AnnouncementRow = ({ announcement }) => (
  <div className="p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[9px] font-bold text-slate-800 dark:text-white">
          {announcement.title}
        </h4>

        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <InlineMetric
            icon={Mail}
            label="Sent"
            value={announcement.sent}
          />

          <InlineMetric
            icon={Eye}
            label="Viewed"
            value={announcement.viewed}
          />

          <InlineMetric
            icon={TrendingUp}
            label="View Rate"
            value={`${announcement.viewPercentage.toFixed(1)}%`}
          />

          <InlineMetric
            icon={LinkIcon}
            label="Clicks"
            value={announcement.clicks}
          />

          <InlineMetric
            icon={Users}
            label="Unread"
            value={announcement.unreadCount}
          />
        </div>
      </div>

      <div className="w-full lg:w-36">
        <div className="mb-1 flex justify-between">
          <span className="text-[5px] font-bold uppercase text-slate-400">
            Engagement
          </span>

          <span className="text-[6px] font-black text-indigo-600 dark:text-indigo-400">
            {announcement.viewPercentage.toFixed(0)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600"
            style={{
              width: `${Math.min(
                announcement.viewPercentage,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

const AnnouncementCard = ({ announcement }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Announcement
        </p>

        <h4 className="mt-2 line-clamp-2 text-[9px] font-black text-slate-800 dark:text-white">
          {announcement.title}
        </h4>
      </div>

      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <MessageSquare size={14} />
      </div>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-4">
      <SmallMetric
        icon={Mail}
        label="Sent"
        value={announcement.sent}
      />

      <SmallMetric
        icon={Eye}
        label="Viewed"
        value={announcement.viewed}
      />

      <SmallMetric
        icon={LinkIcon}
        label="Clicks"
        value={announcement.clicks}
      />

      <SmallMetric
        icon={Users}
        label="Unread"
        value={announcement.unreadCount}
      />
    </div>

    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-[6px] font-bold text-slate-400">
          Click-through rate
        </span>

        <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">
          {announcement.clickPercentage.toFixed(1)}%
        </span>
      </div>
    </div>
  </div>
);

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
  label,
  value,
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

export default EventOrganizerAnnouncementEngagementAnalytics;