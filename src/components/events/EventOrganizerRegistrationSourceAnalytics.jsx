import {
  BarChart3,
  ExternalLink,
  Link2,
  QrCode,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_SOURCES = [
  {
    id: "eventra",
    name: "Eventra Discovery",
    registrations: 320,
    visits: 780,
  },
  {
    id: "shared-link",
    name: "Shared Event Link",
    registrations: 245,
    visits: 510,
  },
  {
    id: "qr",
    name: "QR Code",
    registrations: 180,
    visits: 360,
  },
  {
    id: "campaign",
    name: "Campaign Link",
    registrations: 125,
    visits: 290,
  },
  {
    id: "referral",
    name: "External Referral",
    registrations: 85,
    visits: 240,
  },
];

const SOURCE_ICONS = {
  eventra: BarChart3,
  "shared-link": Link2,
  qr: QrCode,
  campaign: Share2,
  referral: ExternalLink,
};

const EventOrganizerRegistrationSourceAnalytics = ({
  sources = DEFAULT_SOURCES,
}) => {
  const analytics = useMemo(() => {
    const totalRegistrations = sources.reduce(
      (sum, source) => sum + Number(source.registrations || 0),
      0
    );

    const totalVisits = sources.reduce(
      (sum, source) => sum + Number(source.visits || 0),
      0
    );

    const enrichedSources = sources.map((source) => {
      const registrations = Number(source.registrations || 0);
      const visits = Number(source.visits || 0);

      const conversionRate =
        visits > 0
          ? (registrations / visits) * 100
          : 0;

      const registrationShare =
        totalRegistrations > 0
          ? (registrations / totalRegistrations) * 100
          : 0;

      return {
        ...source,
        registrations,
        visits,
        conversionRate,
        registrationShare,
      };
    });

    const topSource = [...enrichedSources].sort(
      (a, b) => b.registrations - a.registrations
    )[0];

    const bestConversionSource = [...enrichedSources].sort(
      (a, b) => b.conversionRate - a.conversionRate
    )[0];

    const overallConversion =
      totalVisits > 0
        ? (totalRegistrations / totalVisits) * 100
        : 0;

    return {
      totalRegistrations,
      totalVisits,
      overallConversion,
      enrichedSources,
      topSource,
      bestConversionSource,
    };
  }, [sources]);

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
              Registration Source Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Understand which channels are generating event
              registrations and compare their conversion rates.
            </p>
          </div>
        </div>

        {analytics.topSource && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-center dark:border-green-900/30 dark:bg-green-900/10">
            <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
              Top Registration Source
            </p>

            <p className="mt-1 text-sm font-black text-green-700 dark:text-green-300">
              {analytics.topSource.name}
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Registrations"
          value={analytics.totalRegistrations}
          description="from all sources"
        />

        <MetricCard
          icon={ExternalLink}
          label="Total Visits"
          value={analytics.totalVisits}
          description="tracked source visits"
        />

        <MetricCard
          icon={TrendingUp}
          label="Overall Conversion"
          value={`${analytics.overallConversion.toFixed(1)}%`}
          description="visits to registrations"
        />

        <MetricCard
          icon={BarChart3}
          label="Sources"
          value={sources.length}
          description="active registration channels"
        />
      </div>

      {/* Source Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration Sources
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Compare traffic, registrations, and conversion
              performance.
            </p>
          </div>

          {analytics.bestConversionSource && (
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              Best Conversion:{" "}
              {analytics.bestConversionSource.name}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Source
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Visits
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Registrations
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Share
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Conversion
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.enrichedSources.map((source) => {
                const Icon =
                  SOURCE_ICONS[source.id] || BarChart3;

                return (
                  <tr
                    key={source.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          <Icon size={15} />
                        </div>

                        <div>
                          <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                            {source.name}
                          </p>

                          <p className="mt-1 text-[5px] text-slate-400">
                            {source.visits} tracked visits
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right text-[8px] font-bold text-slate-700 dark:text-slate-300">
                      {source.visits}
                    </td>

                    <td className="px-5 py-4 text-right text-[8px] font-bold text-slate-700 dark:text-slate-300">
                      {source.registrations}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                        {source.registrationShare.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{
                              width: `${Math.min(
                                source.conversionRate,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="w-12 text-right text-[8px] font-black text-indigo-600 dark:text-indigo-400">
                          {source.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparison */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Registration Volume by Source
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Visual comparison of registrations generated by each
            channel.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {analytics.enrichedSources.map((source) => {
            const percentage =
              analytics.totalRegistrations > 0
                ? (source.registrations /
                    analytics.totalRegistrations) *
                  100
                : 0;

            return (
              <div key={source.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                    {source.name}
                  </span>

                  <span className="text-[7px] font-black text-slate-700 dark:text-slate-300">
                    {source.registrations}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {analytics.topSource && (
          <InsightCard
            title="Highest Registration Volume"
            value={analytics.topSource.name}
            description={`${analytics.topSource.registrations} registrations, representing ${analytics.topSource.registrationShare.toFixed(
              1
            )}% of total registrations.`}
          />
        )}

        {analytics.bestConversionSource && (
          <InsightCard
            title="Best Conversion Rate"
            value={analytics.bestConversionSource.name}
            description={`${analytics.bestConversionSource.conversionRate.toFixed(
              1
            )}% of tracked visits from this source resulted in registrations.`}
          />
        )}
      </div>

      {/* Tracking Note */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <TrendingUp size={15} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              Marketing Insight
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Use registration source performance to identify
              high-performing promotional channels and optimize
              future event campaigns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
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

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const InsightCard = ({
  title,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
    <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
      {title}
    </p>

    <h3 className="mt-2 text-[10px] font-black text-green-800 dark:text-green-300">
      {value}
    </h3>

    <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
      {description}
    </p>
  </div>
);

export default EventOrganizerRegistrationSourceAnalytics;