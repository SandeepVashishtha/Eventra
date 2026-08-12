import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const REFUND_STATUSES = {
  REQUESTED: "Refund Requested",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const STATUS_ORDER = [
  REFUND_STATUSES.REQUESTED,
  REFUND_STATUSES.PROCESSING,
  REFUND_STATUSES.COMPLETED,
];

const EventCancellationRefundTracking = ({
  refund,
  onRetry,
  onRefresh,
  className = "",
}) => {
  const [currentRefund, setCurrentRefund] =
    useState(refund || null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [retrying, setRetrying] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [error, setError] =
    useState("");

  const progressIndex = useMemo(() => {
    if (
      currentRefund?.status ===
      REFUND_STATUSES.FAILED
    ) {
      return -1;
    }

    return STATUS_ORDER.indexOf(
      currentRefund?.status
    );
  }, [currentRefund]);

  if (!currentRefund) {
    return (
      <section
        className={`rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}
      >
        <CreditCard
          size={28}
          className="mx-auto text-slate-400"
        />

        <h2 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
          No Refund Information
        </h2>

        <p className="mt-1 text-[8px] text-slate-400">
          Refund information will appear here after a
          paid registration is cancelled.
        </p>
      </section>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      const updatedRefund =
        await onRefresh?.(currentRefund.id);

      if (updatedRefund) {
        setCurrentRefund(updatedRefund);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to refresh refund status."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setError("");

    try {
      const updatedRefund =
        await onRetry?.(currentRefund.id);

      if (updatedRefund) {
        setCurrentRefund(updatedRefund);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to retry the refund."
      );
    } finally {
      setRetrying(false);
    }
  };

  const copyReference = async () => {
    if (!currentRefund.reference) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        currentRefund.reference
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      setError(
        "Unable to copy the refund reference."
      );
    }
  };

  const isFailed =
    currentRefund.status ===
    REFUND_STATUSES.FAILED;

  const isCompleted =
    currentRefund.status ===
    REFUND_STATUSES.COMPLETED;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CreditCard size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Refund Tracking
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {currentRefund.eventName ||
                "Event Refund"}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Registration cancellation refund status
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label="Refresh refund status"
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Amount */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          Refund Amount
        </p>

        <div className="mt-1 flex items-center justify-between gap-4">
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {formatCurrency(
              currentRefund.amount,
              currentRefund.currency
            )}
          </p>

          <StatusBadge
            status={currentRefund.status}
          />
        </div>

        {currentRefund.registrationId && (
          <p className="mt-3 text-[7px] text-slate-400">
            Registration ID:{" "}
            <span className="font-semibold">
              {currentRefund.registrationId}
            </span>
          </p>
        )}
      </div>

      {/* Progress */}
      {!isFailed && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
            Refund Progress
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {STATUS_ORDER.map(
              (status, index) => {
                const active =
                  index <= progressIndex;

                const current =
                  index === progressIndex;

                return (
                  <div
                    key={status}
                    className="relative"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                      >
                        {index === 0 && (
                          <Clock3
                            size={13}
                          />
                        )}

                        {index === 1 && (
                          <RefreshCw
                            size={13}
                          />
                        )}

                        {index === 2 && (
                          <CheckCircle2
                            size={13}
                          />
                        )}
                      </div>

                      <div className="hidden sm:block">
                        <p
                          className={`text-[7px] font-bold ${
                            active
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`mt-2 text-[7px] font-bold sm:hidden ${
                        current
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400"
                      }`}
                    >
                      {status}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <XCircle size={17} />
            </div>

            <div>
              <p className="text-[9px] font-bold text-red-700 dark:text-red-400">
                Refund Failed
              </p>

              <p className="mt-1 text-[7px] leading-4 text-red-700/70 dark:text-red-400/70">
                {currentRefund.failureReason ||
                  "The refund could not be completed."}
              </p>

              {onRetry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={
                      retrying
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {retrying
                    ? "Retrying..."
                    : "Retry Refund"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailCard
          label="Request Date"
          value={formatDateTime(
            currentRefund.requestDate
          )}
        />

        <DetailCard
          label="Completion Date"
          value={
            currentRefund.completionDate
              ? formatDateTime(
                  currentRefund.completionDate
                )
              : "Not completed"
          }
        />

        <DetailCard
          label="Refund Reference"
          value={
            currentRefund.reference ||
            "Not available"
          }
          action={
            currentRefund.reference
              ? (
                <button
                  type="button"
                  onClick={copyReference}
                  className="text-indigo-600 dark:text-indigo-400"
                  aria-label="Copy refund reference"
                >
                  {copied ? (
                    <CheckCircle2
                      size={13}
                    />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              )
              : null
          }
        />

        <DetailCard
          label="Payment Method"
          value={
            currentRefund.paymentMethod ||
            "Not available"
          }
        />
      </div>

      {/* Status message */}
      {isCompleted && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div>
            <p className="text-[9px] font-bold text-green-700 dark:text-green-400">
              Refund Completed
            </p>

            <p className="mt-1 text-[7px] leading-4 text-green-700/70 dark:text-green-400/70">
              The refund has been successfully processed.
              Please allow your payment provider additional
              time to reflect the amount if necessary.
            </p>
          </div>
        </div>
      )}

      {currentRefund.status ===
        REFUND_STATUSES.PROCESSING && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <Clock3
            size={17}
            className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
          />

          <div>
            <p className="text-[9px] font-bold text-blue-700 dark:text-blue-400">
              Refund Is Processing
            </p>

            <p className="mt-1 text-[7px] leading-4 text-blue-700/70 dark:text-blue-400/70">
              Your refund request has been received and is
              currently being processed.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <AlertCircle
            size={14}
            className="shrink-0"
          />
          {error}
        </div>
      )}
    </section>
  );
};

const StatusBadge = ({
  status,
}) => {
  const styles = {
    [REFUND_STATUSES.REQUESTED]:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",

    [REFUND_STATUSES.PROCESSING]:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",

    [REFUND_STATUSES.COMPLETED]:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",

    [REFUND_STATUSES.FAILED]:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[7px] font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-500"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

const DetailCard = ({
  label,
  value,
  action,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <div className="mt-2 flex items-center justify-between gap-3">
      <p className="truncate text-[9px] font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>

      {action}
    </div>
  </div>
);

const formatCurrency = (
  amount,
  currency = "INR"
) => {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

export default EventCancellationRefundTracking;