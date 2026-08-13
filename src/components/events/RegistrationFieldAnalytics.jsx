import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FileText,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_FIELDS = [
  {
    id: "track",
    label: "Preferred Track",
    type: "select",
    responses: {
      "AI/ML": 45,
      "Web Development": 32,
      IoT: 23,
    },
    totalResponses: 100,
    totalParticipants: 120,
  },
  {
    id: "experience",
    label: "Experience Level",
    type: "select",
    responses: {
      Beginner: 52,
      Intermediate: 38,
      Advanced: 20,
    },
    totalResponses: 110,
    totalParticipants: 120,
  },
  {
    id: "attendance",
    label: "Expected Attendance",
    type: "select",
    responses: {
      "Full Event": 70,
      "First Day Only": 18,
      "Second Day Only": 12,
    },
    totalResponses: 100,
    totalParticipants: 120,
  },
];

const RegistrationFieldAnalytics = ({
  fields = DEFAULT_FIELDS,
  title = "Registration Field Analytics",
}) => {
  const [selectedField, setSelectedField] =
    useState(fields[0]?.id || "");

  const [chartType, setChartType] =
    useState("bar");

  const activeField =
    fields.find(
      (field) => field.id === selectedField
    ) || fields[0];

  const analytics = useMemo(() => {
    if (!activeField) {
      return {
        totalResponses: 0,
        missingResponses: 0,
        responseRate: 0,
        popularChoice: null,
        choices: [],
      };
    }

    const totalParticipants =
      activeField.totalParticipants || 0;

    const totalResponses =
      activeField.totalResponses ||
      Object.values(
        activeField.responses || {}
      ).reduce((sum, value) => sum + value, 0);

    const missingResponses = Math.max(
      totalParticipants - totalResponses,
      0
    );

    const responseRate =
      totalParticipants > 0
        ? Math.round(
            (totalResponses /
              totalParticipants) *
              100
          )
        : 0;

    const choices = Object.entries(
      activeField.responses || {}
    )
      .map(([label, count]) => ({
        label,
        count,
        percentage:
          totalResponses > 0
            ? Math.round(
                (count / totalResponses) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalResponses,
      missingResponses,
      responseRate,
      popularChoice: choices[0] || null,
      choices,
    };
  }, [activeField]);

  if (!fields.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <FileText
          size={24}
          className="mx-auto text-slate-400"
        />

        <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
          No registration fields available
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Add custom registration fields to view analytics.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Insights
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Analyze responses collected through custom registration fields.
            </p>
          </div>
        </div>

        {/* Field Selector */}
        <div className="relative min-w-[220px]">
          <label className="mb-1 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Select Field
          </label>

          <div className="relative">
            <select
              value={selectedField}
              onChange={(event) =>
                setSelectedField(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-[8px] font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {fields.map((field) => (
                <option
                  key={field.id}
                  value={field.id}
                >
                  {field.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          icon={Users}
          label="Total Responses"
          value={analytics.totalResponses}
          subtitle="valid responses"
        />

        <AnalyticsCard
          icon={CheckCircle2}
          label="Response Rate"
          value={`${analytics.responseRate}%`}
          subtitle="of participants"
        />

        <AnalyticsCard
          icon={TrendingUp}
          label="Popular Choice"
          value={
            analytics.popularChoice
              ? analytics.popularChoice.label
              : "--"
          }
          subtitle={
            analytics.popularChoice
              ? `${analytics.popularChoice.percentage}% of responses`
              : "No responses"
          }
        />

        <AnalyticsCard
          icon={FileText}
          label="Missing Responses"
          value={analytics.missingResponses}
          subtitle="participants without response"
        />
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Response Distribution
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Breakdown of responses for{" "}
                {activeField.label}.
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <ChartButton
                active={chartType === "bar"}
                onClick={() =>
                  setChartType("bar")
                }
                icon={BarChart3}
                label="Bar"
              />

              <ChartButton
                active={chartType === "list"}
                onClick={() =>
                  setChartType("list")
                }
                icon={PieChart}
                label="List"
              />
            </div>
          </div>

          {chartType === "bar" ? (
            <DistributionChart
              choices={analytics.choices}
            />
          ) : (
            <DistributionList
              choices={analytics.choices}
            />
          )}
        </div>

        {/* Popular Choices */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Popular Choices
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Most selected responses.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {analytics.choices
              .slice(0, 5)
              .map((choice, index) => (
                <ChoiceRow
                  key={choice.label}
                  choice={choice}
                  rank={index + 1}
                />
              ))}

            {!analytics.choices.length && (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Missing Responses */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <FileText size={16} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Missing Responses
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Participants who did not provide an answer.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">
              {analytics.missingResponses}
            </p>

            <p className="text-[6px] font-semibold text-slate-400">
              missing responses
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{
              width: `${Math.min(
                100 -
                  analytics.responseRate,
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[6px] font-semibold text-slate-400">
          <span>
            {analytics.responseRate}% responded
          </span>

          <span>
            {100 - analytics.responseRate}% missing
          </span>
        </div>
      </div>

      {/* Field Summary */}
      <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <TrendingUp size={16} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-900 dark:text-indigo-300">
              Field Insight
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
              {analytics.popularChoice
                ? `"${analytics.popularChoice.label}" is the most popular choice for ${activeField.label}, representing ${analytics.popularChoice.percentage}% of all responses.`
                : `There are not enough responses to generate an insight for ${activeField.label}.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Analytics Card
--------------------------------- */

const AnalyticsCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-3 truncate text-[6px] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
};

/* --------------------------------
   Chart Button
--------------------------------- */

const ChartButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[6px] font-bold transition ${
        active
          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );
};

/* --------------------------------
   Distribution Chart
--------------------------------- */

const DistributionChart = ({
  choices,
}) => {
  if (!choices.length) {
    return <EmptyState />;
  }

  const maxCount = Math.max(
    ...choices.map(
      (choice) => choice.count
    ),
    1
  );

  return (
    <div className="mt-6 space-y-5">
      {choices.map((choice) => {
        const width =
          (choice.count / maxCount) * 100;

        return (
          <div key={choice.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-[7px] font-bold text-slate-600 dark:text-slate-300">
                {choice.label}
              </span>

              <span className="shrink-0 text-[7px] font-black text-slate-700 dark:text-slate-300">
                {choice.count}{" "}
                <span className="font-semibold text-slate-400">
                  ({choice.percentage}%)
                </span>
              </span>
            </div>

            <div className="h-8 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <div
                className="flex h-full items-center rounded-xl bg-indigo-500 px-3 transition-all duration-500"
                style={{
                  width: `${Math.max(
                    width,
                    4
                  )}%`,
                }}
              >
                {width > 18 && (
                  <span className="text-[6px] font-bold text-white">
                    {choice.percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --------------------------------
   Distribution List
--------------------------------- */

const DistributionList = ({
  choices,
}) => {
  if (!choices.length) {
    return <EmptyState />;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-950">
        <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Choice
        </span>

        <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Responses
        </span>

        <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          %
        </span>
      </div>

      {choices.map((choice) => (
        <div
          key={choice.label}
          className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800"
        >
          <span className="truncate text-[7px] font-semibold text-slate-700 dark:text-slate-300">
            {choice.label}
          </span>

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-400">
            {choice.count}
          </span>

          <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
            {choice.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
};

/* --------------------------------
   Choice Row
--------------------------------- */

const ChoiceRow = ({
  choice,
  rank,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[7px] font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
        #{rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[7px] font-bold text-slate-700 dark:text-slate-300">
          {choice.label}
        </p>

        <p className="mt-1 text-[6px] text-slate-400">
          {choice.count} responses
        </p>
      </div>

      <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">
        {choice.percentage}%
      </span>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="mt-6 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
      <div className="text-center">
        <FileText
          size={20}
          className="mx-auto text-slate-300 dark:text-slate-600"
        />

        <p className="mt-2 text-[7px] font-semibold text-slate-400">
          No response data available
        </p>
      </div>
    </div>
  );
};

export default RegistrationFieldAnalytics;