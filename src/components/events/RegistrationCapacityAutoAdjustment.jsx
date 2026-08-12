import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  History,
  Minus,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_RULE = {
  enabled: true,
  waitlistThreshold: 10,
  increaseBy: 25,
  maximumCapacity: 200,
  notifyBeforeChange: true,
};

const RegistrationCapacityAutoAdjustment = ({
  currentCapacity = 100,
  waitlistCount = 12,
  initialRule = DEFAULT_RULE,
  adjustmentHistory = [],
  onSaveRule,
  onApplyAdjustment,
}) => {
  const [rule, setRule] = useState({
    ...DEFAULT_RULE,
    ...initialRule,
  });

  const [history, setHistory] =
    useState(adjustmentHistory);

  const [saving, setSaving] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const capacityLimitReached =
    currentCapacity >=
    Number(rule.maximumCapacity);

  const thresholdReached =
    waitlistCount >=
    Number(rule.waitlistThreshold);

  const recommendedCapacity = Math.min(
    currentCapacity +
      Number(rule.increaseBy),
    Number(rule.maximumCapacity)
  );

  const capacityIncrease =
    recommendedCapacity - currentCapacity;

  const shouldAdjust =
    rule.enabled &&
    thresholdReached &&
    !capacityLimitReached &&
    capacityIncrease > 0;

  const status = useMemo(() => {
    if (!rule.enabled) {
      return {
        label: "Disabled",
        description:
          "Automatic capacity adjustment is currently disabled.",
        type: "disabled",
      };
    }

    if (capacityLimitReached) {
      return {
        label: "Maximum Reached",
        description:
          "The event has reached the configured maximum capacity.",
        type: "warning",
      };
    }

    if (shouldAdjust) {
      return {
        label: "Adjustment Recommended",
        description: `Waitlist demand has reached the configured threshold. Capacity can increase to ${recommendedCapacity} seats.`,
        type: "active",
      };
    }

    return {
      label: "Monitoring",
      description:
        "The system is monitoring registration demand and the waitlist.",
      type: "monitoring",
    };
  }, [
    rule.enabled,
    capacityLimitReached,
    shouldAdjust,
    recommendedCapacity,
  ]);

  const updateRule = (key, value) => {
    setRule((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveConfiguration = async () => {
    setSaving(true);

    try {
      await onSaveRule?.(rule);
    } finally {
      setSaving(false);
    }
  };

  const applyAdjustment = async () => {
    if (!shouldAdjust) return;

    const adjustment = {
      previousCapacity: currentCapacity,
      newCapacity: recommendedCapacity,
      increaseBy: capacityIncrease,
      waitlistCount,
      changedAt: new Date().toISOString(),
      reason: `Waitlist exceeded ${rule.waitlistThreshold} participants.`,
      automatic: true,
    };

    setHistory((current) => [
      adjustment,
      ...current,
    ]);

    await onApplyAdjustment?.(adjustment);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Settings size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Automatic Capacity Adjustment
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Automatically increase event capacity when registration
              demand exceeds the configured waitlist threshold.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            updateRule(
              "enabled",
              !rule.enabled
            )
          }
          className={`rounded-xl px-4 py-2.5 text-[8px] font-bold ${
            rule.enabled
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {rule.enabled
            ? "Enabled"
            : "Disabled"}
        </button>
      </div>

      {/* Status */}
      <div
        className={`mt-6 rounded-2xl border p-5 ${
          status.type === "active"
            ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
            : status.type === "warning"
            ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
            : status.type === "disabled"
            ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            : "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {status.type === "active" ? (
            <AlertTriangle
              className="text-indigo-600 dark:text-indigo-400"
              size={20}
            />
          ) : status.type === "warning" ? (
            <AlertTriangle
              className="text-amber-600 dark:text-amber-400"
              size={20}
            />
          ) : status.type === "disabled" ? (
            <X
              className="text-slate-500"
              size={20}
            />
          ) : (
            <CheckCircle2
              className="text-green-600 dark:text-green-400"
              size={20}
            />
          )}

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              {status.label}
            </h3>

            <p className="mt-1 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
              {status.description}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Current Capacity"
          value={currentCapacity}
          suffix="seats"
        />

        <MetricCard
          label="Waitlist"
          value={waitlistCount}
          suffix="people"
          highlight={
            thresholdReached
          }
        />

        <MetricCard
          label="Threshold"
          value={rule.waitlistThreshold}
          suffix="people"
        />

        <MetricCard
          label="Maximum"
          value={rule.maximumCapacity}
          suffix="seats"
        />
      </div>

      {/* Configuration */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Settings
            size={15}
            className="text-indigo-500"
          />

          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Capacity Rules
          </h3>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Waitlist Threshold */}
          <NumberField
            label="Waitlist Threshold"
            description="Trigger adjustment when waitlist reaches this number."
            value={rule.waitlistThreshold}
            min={1}
            onChange={(value) =>
              updateRule(
                "waitlistThreshold",
                value
              )
            }
          />

          {/* Increase Amount */}
          <NumberField
            label="Increase Capacity By"
            description="Number of seats to add during an adjustment."
            value={rule.increaseBy}
            min={1}
            onChange={(value) =>
              updateRule(
                "increaseBy",
                value
              )
            }
          />

          {/* Maximum */}
          <NumberField
            label="Maximum Capacity"
            description="Hard limit that automatic adjustments cannot exceed."
            value={rule.maximumCapacity}
            min={1}
            onChange={(value) =>
              updateRule(
                "maximumCapacity",
                value
              )
            }
          />

          {/* Notification */}
          <div>
            <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Organizer Notification
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Notify the organizer before an automatic change.
            </p>

            <button
              type="button"
              onClick={() =>
                updateRule(
                  "notifyBeforeChange",
                  !rule.notifyBeforeChange
                )
              }
              className={`mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 ${
                rule.notifyBeforeChange
                  ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
                  : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
              }`}
            >
              <span className="flex items-center gap-2 text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                <Bell size={13} />
                Notify before adjustment
              </span>

              <span
                className={`h-5 w-9 rounded-full p-0.5 ${
                  rule.notifyBeforeChange
                    ? "bg-indigo-600"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition ${
                    rule.notifyBeforeChange
                      ? "translate-x-4"
                      : "translate-x-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={saveConfiguration}
          disabled={saving}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Capacity Rules"}
        </button>
      </div>

      {/* Recommended Adjustment */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Users size={17} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Recommended Adjustment
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Based on current waitlist demand and your configured rules.
              </p>
            </div>
          </div>

          {shouldAdjust && (
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              Action Required
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CapacityBox
            label="Current"
            value={currentCapacity}
          />

          <Plus
            size={18}
            className="text-indigo-500"
          />

          <CapacityBox
            label="Increase"
            value={capacityIncrease}
            highlighted
          />

          <Plus
            size={18}
            className="text-slate-300"
          />

          <CapacityBox
            label="New Capacity"
            value={recommendedCapacity}
          />
        </div>

        {shouldAdjust && (
          <button
            type="button"
            onClick={applyAdjustment}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
          >
            <Plus size={13} />
            Apply Automatic Adjustment
          </button>
        )}

        {!shouldAdjust && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-950">
            <p className="text-[7px] text-slate-400">
              No capacity adjustment is required right now.
            </p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() =>
            setShowHistory(
              (value) => !value
            )
          }
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="flex items-center gap-2 text-[9px] font-bold text-slate-800 dark:text-white">
            <History size={15} />
            Capacity Adjustment History
          </span>

          <span className="text-[7px] text-slate-400">
            {history.length} changes
          </span>
        </button>

        {showHistory && (
          <div className="mt-3 space-y-3">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <History
                  size={25}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-[8px] text-slate-400">
                  No automatic capacity changes have been recorded.
                </p>
              </div>
            ) : (
              history.map(
                (item, index) => (
                  <HistoryItem
                    key={
                      item.id ||
                      index
                    }
                    item={item}
                  />
                )
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Metric Card
--------------------------------- */

const MetricCard = ({
  label,
  value,
  suffix,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <p
          className={`text-xl font-black ${
            highlight
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-800 dark:text-white"
          }`}
        >
          {value}
        </p>

        <span className="text-[6px] text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
};

/* --------------------------------
   Number Field
--------------------------------- */

const NumberField = ({
  label,
  description,
  value,
  min,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <p className="mt-1 text-[7px] text-slate-400">
        {description}
      </p>

      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
};

/* --------------------------------
   Capacity Box
--------------------------------- */

const CapacityBox = ({
  label,
  value,
  highlighted = false,
}) => {
  return (
    <div
      className={`min-w-28 rounded-2xl border p-4 text-center ${
        highlighted
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-black ${
          highlighted
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-800 dark:text-white"
        }`}
      >
        {value}
      </p>

      <p className="text-[6px] text-slate-400">
        seats
      </p>
    </div>
  );
};

/* --------------------------------
   History Item
--------------------------------- */

const HistoryItem = ({
  item,
}) => {
  const increase =
    item.newCapacity >
    item.previousCapacity;

  const difference =
    item.newCapacity -
    item.previousCapacity;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {increase ? (
              <Plus
                size={14}
                className="text-green-500"
              />
            ) : (
              <Minus
                size={14}
                className="text-red-500"
              />
            )}

            <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              {item.previousCapacity} →{" "}
              {item.newCapacity} seats
            </p>
          </div>

          <p className="mt-1 text-[7px] text-slate-400">
            {item.reason ||
              "Automatic capacity adjustment"}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${
            increase
              ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
          }`}
        >
          {increase ? "+" : ""}
          {difference}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[6px] text-slate-400">
        <span>
          Waitlist:{" "}
          <strong className="text-slate-600 dark:text-slate-300">
            {item.waitlistCount}
          </strong>
        </span>

        <span>
          {new Date(
            item.changedAt
          ).toLocaleString("en-IN")}
        </span>

        {item.automatic && (
          <span className="font-bold text-indigo-500">
            Automatic
          </span>
        )}
      </div>
    </div>
  );
};

export default RegistrationCapacityAutoAdjustment;