import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Lock,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventSessionCapacityManagement = ({
  initialSessions = [],
  onSave,
  onCloseSession,
  onToggleWaitlist,
  className = "",
}) => {
  const [sessions, setSessions] =
    useState(initialSessions);

  const [editingId, setEditingId] =
    useState(null);

  const [capacityInput, setCapacityInput] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const sessionStats = useMemo(() => {
    const totalCapacity = sessions.reduce(
      (total, session) =>
        total + Number(session.capacity || 0),
      0
    );

    const totalRegistered = sessions.reduce(
      (total, session) =>
        total + Number(session.registered || 0),
      0
    );

    const fullSessions = sessions.filter(
      (session) =>
        Number(session.registered || 0) >=
        Number(session.capacity || 0)
    ).length;

    return {
      totalCapacity,
      totalRegistered,
      fullSessions,
    };
  }, [sessions]);

  const startEditing = (session) => {
    setEditingId(session.id);
    setCapacityInput(
      String(session.capacity || "")
    );
    setMessage("");
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setCapacityInput("");
  };

  const saveCapacity = async (sessionId) => {
    const capacity =
      Number(capacityInput);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError(
        "Capacity must be a positive whole number."
      );
      return;
    }

    const session = sessions.find(
      (item) => item.id === sessionId
    );

    if (!session) {
      return;
    }

    if (
      capacity <
      Number(session.registered || 0)
    ) {
      setError(
        "Capacity cannot be lower than the current number of registered participants."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedSession = {
        ...session,
        capacity,
        isFull:
          Number(session.registered || 0) >=
          capacity,
        registrationOpen:
          Number(session.registered || 0) <
          capacity,
      };

      setSessions((current) =>
        current.map((item) =>
          item.id === sessionId
            ? updatedSession
            : item
        )
      );

      await onSave?.(updatedSession);

      setEditingId(null);
      setCapacityInput("");

      setMessage(
        "Session capacity updated successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update session capacity."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSession = async (
    session
  ) => {
    setError("");
    setMessage("");

    try {
      const updatedSession = {
        ...session,
        registrationOpen: false,
        status: "closed",
      };

      setSessions((current) =>
        current.map((item) =>
          item.id === session.id
            ? updatedSession
            : item
        )
      );

      await onCloseSession?.(
        updatedSession
      );

      setMessage(
        `"${session.name}" registration has been closed.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to close the session."
      );
    }
  };

  const handleToggleWaitlist = async (
    session
  ) => {
    setError("");
    setMessage("");

    try {
      const updatedSession = {
        ...session,
        waitlistEnabled:
          !session.waitlistEnabled,
      };

      setSessions((current) =>
        current.map((item) =>
          item.id === session.id
            ? updatedSession
            : item
        )
      );

      await onToggleWaitlist?.(
        updatedSession
      );

      setMessage(
        updatedSession.waitlistEnabled
          ? "Session waitlist enabled."
          : "Session waitlist disabled."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update waitlist."
      );
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Capacity Management
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage seating limits and availability for
              individual event sessions.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Sessions
          </p>

          <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {sessions.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total Capacity"
          value={sessionStats.totalCapacity}
        />

        <SummaryCard
          label="Registered"
          value={sessionStats.totalRegistered}
        />

        <SummaryCard
          label="Full Sessions"
          value={sessionStats.fullSessions}
        />
      </div>

      {/* Sessions */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Event Sessions
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Configure capacity and waitlist settings for
              each session.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {sessions.length === 0 ? (
            <EmptySessions />
          ) : (
            sessions.map((session) => {
              const capacity =
                Number(session.capacity) || 0;

              const registered =
                Number(session.registered) || 0;

              const remaining = Math.max(
                capacity - registered,
                0
              );

              const percentage =
                capacity > 0
                  ? Math.min(
                      Math.round(
                        (registered / capacity) *
                          100
                      ),
                      100
                    )
                  : 0;

              const isFull =
                registered >= capacity;

              const isEditing =
                editingId === session.id;

              return (
                <article
                  key={session.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Session heading */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                          {session.name}
                        </h3>

                        <StatusBadge
                          isFull={isFull}
                          isClosed={
                            session.status ===
                              "closed" ||
                            session.registrationOpen ===
                              false
                          }
                        />
                      </div>

                      {session.description && (
                        <p className="mt-1 text-[7px] leading-4 text-slate-400">
                          {session.description}
                        </p>
                      )}

                      {session.startTime && (
                        <p className="mt-2 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                          {formatDate(
                            session.startTime
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            startEditing(
                              session
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Edit3 size={11} />
                          Edit Capacity
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Capacity editor */}
                  {isEditing ? (
                    <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                      <label className="text-[8px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        Session Capacity
                      </label>

                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="number"
                          min={
                            registered
                          }
                          value={
                            capacityInput
                          }
                          onChange={(event) =>
                            setCapacityInput(
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-w-xs"
                        />

                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            saveCapacity(
                              session.id
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <Save size={12} />
                          {saving
                            ? "Saving..."
                            : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEditing
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Capacity stats */}
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat
                          label="Capacity"
                          value={capacity}
                        />

                        <MiniStat
                          label="Registered"
                          value={registered}
                        />

                        <MiniStat
                          label="Remaining"
                          value={remaining}
                        />

                        <MiniStat
                          label="Usage"
                          value={`${percentage}%`}
                        />
                      </div>

                      {/* Progress */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-bold text-slate-400">
                            Seat occupancy
                          </span>

                          <span className="text-[7px] font-bold text-slate-500 dark:text-slate-400">
                            {registered}/{capacity}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull
                                ? "bg-red-500"
                                : percentage >=
                                    80
                                  ? "bg-amber-500"
                                  : "bg-indigo-600"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Full warning */}
                      {isFull && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                          <AlertTriangle
                            size={14}
                            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                          />

                          <div>
                            <p className="text-[8px] font-bold text-red-700 dark:text-red-400">
                              Session is full
                            </p>

                            <p className="mt-1 text-[7px] leading-4 text-red-600/70 dark:text-red-400/70">
                              No additional participants
                              can register unless capacity
                              is increased or the waitlist
                              is enabled.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleWaitlist(
                              session
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[7px] font-bold ${
                            session.waitlistEnabled
                              ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <Users size={12} />

                          {session.waitlistEnabled
                            ? "Waitlist Enabled"
                            : "Enable Waitlist"}
                        </button>

                        {session.registrationOpen !==
                          false &&
                          session.status !==
                            "closed" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCloseSession(
                                  session
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-[7px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400"
                            >
                              <Lock size={12} />
                              Close Session
                            </button>
                          )}
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <AlertTriangle
            size={14}
            className="shrink-0"
          />
          {error}
        </div>
      )}
    </section>
  );
};

const SummaryCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const MiniStat = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const StatusBadge = ({
  isFull,
  isClosed,
}) => {
  if (isClosed) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-1 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Closed
      </span>
    );
  }

  if (isFull) {
    return (
      <span className="rounded-full bg-red-50 px-2 py-1 text-[6px] font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400">
        Full
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-50 px-2 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
      Open
    </span>
  );
};

const EmptySessions = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <Plus
      size={22}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No sessions available
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Add event sessions to start managing individual
      capacities.
    </p>
  </div>
);

const formatDate = (
  value
) => {
  if (!value) return "";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default EventSessionCapacityManagement;