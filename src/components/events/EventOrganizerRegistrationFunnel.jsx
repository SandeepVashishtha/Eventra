import {
  ArrowDown,
  Eye,
  FileCheck2,
  MousePointerClick,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_FUNNEL = {
  views: 1200,
  registrationClicks: 720,
  formStarted: 560,
  formCompleted: 430,
  registrationConfirmed: 390,
};

const EventOrganizerRegistrationFunnel = ({
  funnelData = DEFAULT_FUNNEL,
}) => {
  const stages = [
    {
      key: "views",
      label: "Event Views",
      value: funnelData.views,
      icon: Eye,
      description: "People who viewed the event",
    },
    {
      key: "registrationClicks",
      label: "Registration Clicks",
      value: funnelData.registrationClicks,
      icon: MousePointerClick,
      description: "Users who opened registration",
    },
    {
      key: "formStarted",
      label: "Form Started",
      value: funnelData.formStarted,
      icon: FileCheck2,
      description: "Users who started the form",
    },
    {
      key: "formCompleted",
      label: "Form Completed",
      value: funnelData.formCompleted,
      icon: FileCheck2,
      description: "Users who completed the form",
    },
    {
      key: "registrationConfirmed",
      label: "Registration Confirmed",
      value: funnelData.registrationConfirmed,
      icon: UserCheck,
      description: "Confirmed registrations",
    },
  ];

  const conversionRates = useMemo(() => {
    return stages.map((stage, index) => {
      if (index === 0) return 100;

      const previous = stages[index - 1].value;

      return previous > 0
        ? Math.round((stage.value / previous) * 100)
        : 0;
    });
  }, [stages]);

  const overallConversion =
    funnelData.views > 0
      ? Math.round(
          (funnelData.registrationConfirmed /
            funnelData.views) *
            100
        )
      : 0;

  const largestDropOff = useMemo(() => {
    let largest = {
      from: stages[0].label,
      to: stages[1].label,
      percentage: 0,
    };

    for (let i = 1; i < stages.length; i++) {
      const currentRate = conversionRates[i];
      const drop = 100 - currentRate;

      if (drop > largest.percentage) {
        largest = {
          from: stages[i - 1].label,
          to: stages[i].label,
          percentage: drop,
        };
      }
    }

    return largest;
  }, [conversionRates, stages]);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(value);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Funnel
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Understand how participants move from viewing an
              event to completing registration.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-center dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
            Overall Conversion
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {overallConversion}%
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Eye}
          label="Event Views"
          value={formatNumber(funnelData.views)}
        />

        <SummaryCard
          icon={MousePointerClick}
          label="Registration Clicks"
          value={formatNumber(
            funnelData.registrationClicks
          )}
        />

        <SummaryCard
          icon={FileCheck2}
          label="Forms Completed"
          value={formatNumber(funnelData.formCompleted)}
        />

        <SummaryCard
          icon={UserCheck}
          label="Confirmed"
          value={formatNumber(
            funnelData.registrationConfirmed
          )}
        />
      </div>

      {/* Funnel */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration Journey
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Conversion between each registration stage.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const previousValue =
              index > 0 ? stages[index - 1].value : stage.value;

            const conversion =
              index === 0
                ? 100
                : previousValue > 0
                ? Math.round(
                    (stage.value / previousValue) * 100
                  )
                : 0;

            const width =
              funnelData.views > 0
                ? Math.max(
                    (stage.value / funnelData.views) * 100,
                    8
                  )
                : 0;

            return (
              <div key={stage.key}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                          {stage.label}
                        </h4>

                        <p className="mt-1 text-[6px] text-slate-400">
                          {stage.description}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          {formatNumber(stage.value)}
                        </p>

                        <p className="text-[6px] font-bold text-indigo-500">
                          {conversion}% conversion
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-8 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <div
                        className="flex h-full items-center rounded-xl bg-indigo-600 px-3 transition-all duration-500"
                        style={{
                          width: `${Math.min(width, 100)}%`,
                        }}
                      >
                        <span className="text-[6px] font-bold text-white">
                          {Math.round(width)}% of visitors
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <div className="ml-[18px] flex h-7 items-center">
                    <ArrowDown
                      size={13}
                      className="text-slate-300 dark:text-slate-600"
                    />

                    <span className="ml-2 text-[6px] font-bold text-slate-400">
                      {conversionRates[index + 1]}% continue
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drop-off Analysis */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-orange-600 dark:bg-slate-900 dark:text-orange-400">
              <ArrowDown size={16} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-orange-500">
                Largest Drop-off
              </p>

              <h3 className="mt-1 text-[9px] font-bold text-orange-800 dark:text-orange-300">
                {largestDropOff.from} →{" "}
                {largestDropOff.to}
              </h3>

              <p className="mt-2 text-[7px] leading-4 text-orange-700 dark:text-orange-400">
                {largestDropOff.percentage}% of users dropped
                during this stage transition.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-green-600 dark:bg-slate-900 dark:text-green-400">
              <UserCheck size={16} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
                Registration Success
              </p>

              <h3 className="mt-1 text-[9px] font-bold text-green-800 dark:text-green-300">
                {formatNumber(
                  funnelData.registrationConfirmed
                )}{" "}
                confirmed registrations
              </h3>

              <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
                {overallConversion}% of event viewers ultimately
                completed registration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Conversion Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Stage Conversion Details
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Stage
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Users
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Conversion
                </th>

                <th className="px-5 py-3 text-right text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Drop-off
                </th>
              </tr>
            </thead>

            <tbody>
              {stages.map((stage, index) => {
                const conversion =
                  conversionRates[index];

                const dropOff =
                  index === 0
                    ? 0
                    : 100 - conversion;

                return (
                  <tr
                    key={stage.key}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-5 py-4">
                      <span className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
                        {stage.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-[8px] font-black text-slate-800 dark:text-white">
                      {formatNumber(stage.value)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        {conversion}%
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-[6px] font-bold ${
                          dropOff >= 30
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      >
                        {dropOff}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
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

export default EventOrganizerRegistrationFunnel;