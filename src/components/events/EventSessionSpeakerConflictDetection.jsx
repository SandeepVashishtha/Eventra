import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "AI Fundamentals",
    speaker: "Alex Johnson",
    start: "14:00",
    end: "15:00",
  },
  {
    id: 2,
    title: "Advanced Machine Learning",
    speaker: "Alex Johnson",
    start: "14:30",
    end: "15:30",
  },
  {
    id: 3,
    title: "Data Science Workshop",
    speaker: "Sarah Williams",
    start: "15:30",
    end: "16:30",
  },
];

const DEFAULT_SPEAKERS = [
  "Alex Johnson",
  "Sarah Williams",
  "Michael Brown",
  "Emily Davis",
];

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(
    2,
    "0"
  )} ${suffix}`;
};

const hasTimeOverlap = (startA, endA, startB, endB) => {
  return (
    toMinutes(startA) < toMinutes(endB) &&
    toMinutes(endA) > toMinutes(startB)
  );
};

const EventSessionSpeakerConflictDetection = ({
  sessions = DEFAULT_SESSIONS,
  speakers = DEFAULT_SPEAKERS,
}) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState(
    speakers[0] || ""
  );

  const [startTime, setStartTime] = useState("14:30");
  const [endTime, setEndTime] = useState("15:30");
  const [sessionTitle, setSessionTitle] = useState("");
  const [overrideConflict, setOverrideConflict] =
    useState(false);

  const conflicts = useMemo(() => {
    if (!selectedSpeaker || !startTime || !endTime) {
      return [];
    }

    return sessions.filter((session) => {
      if (session.speaker !== selectedSpeaker) {
        return false;
      }

      return hasTimeOverlap(
        startTime,
        endTime,
        session.start,
        session.end
      );
    });
  }, [sessions, selectedSpeaker, startTime, endTime]);

  const hasConflict = conflicts.length > 0;

  const canAssign =
    sessionTitle.trim() &&
    selectedSpeaker &&
    startTime &&
    endTime &&
    (!hasConflict || overrideConflict);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldAlert size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Schedule Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Speaker Conflict Detection
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Automatically check whether a speaker is already
              assigned to another session during the selected
              time.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
            hasConflict
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          }`}
        >
          {hasConflict ? (
            <AlertTriangle size={13} />
          ) : (
            <CheckCircle2 size={13} />
          )}

          <span className="text-[6px] font-bold">
            {hasConflict
              ? "Conflict Detected"
              : "No Conflict"}
          </span>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Assign Speaker
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Select a speaker and session time to check for
            scheduling conflicts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Session Title */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Session Title
            </label>

            <input
              type="text"
              value={sessionTitle}
              onChange={(event) =>
                setSessionTitle(event.target.value)
              }
              placeholder="Enter session title"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-900/30"
            />
          </div>

          {/* Speaker */}
          <div>
            <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Speaker
            </label>

            <div className="relative">
              <UserRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={selectedSpeaker}
                onChange={(event) =>
                  setSelectedSpeaker(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {speakers.map((speaker) => (
                  <option key={speaker} value={speaker}>
                    {speaker}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start */}
          <div>
            <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Start Time
            </label>

            <div className="relative">
              <Clock3
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>

          {/* End */}
          <div>
            <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
              End Time
            </label>

            <div className="relative">
              <Clock3
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Warning */}
      {hasConflict && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle size={17} />
            </div>

            <div className="flex-1">
              <h4 className="text-[9px] font-bold text-red-700 dark:text-red-400">
                ⚠️ Speaker Schedule Conflict
              </h4>

              <p className="mt-1 text-[7px] leading-4 text-red-600 dark:text-red-400">
                <strong>{selectedSpeaker}</strong> is already
                assigned to another session during the selected
                time.
              </p>

              <div className="mt-4 space-y-2">
                {conflicts.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-red-200 bg-white p-3 dark:border-red-900/30 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[8px] font-bold text-slate-800 dark:text-white">
                          {session.title}
                        </p>

                        <p className="mt-1 text-[6px] text-slate-400">
                          Existing speaker assignment
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[6px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <Clock3 size={11} />

                        {formatTime(session.start)} –{" "}
                        {formatTime(session.end)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Override */}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-red-200 bg-white p-3 dark:border-red-900/30 dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={overrideConflict}
                  onChange={(event) =>
                    setOverrideConflict(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <span>
                  <span className="block text-[7px] font-bold text-slate-700 dark:text-slate-300">
                    Override conflict
                  </span>

                  <span className="mt-1 block text-[6px] leading-4 text-slate-400">
                    Allow this assignment despite the scheduling
                    conflict.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {!hasConflict && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div>
            <h4 className="text-[8px] font-bold text-green-700 dark:text-green-400">
              Speaker is available
            </h4>

            <p className="mt-1 text-[7px] leading-4 text-green-600 dark:text-green-500">
              No existing session overlaps with the selected
              speaker's schedule.
            </p>
          </div>
        </div>
      )}

      {/* Assign Button */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={!canAssign}
          className={`rounded-xl px-5 py-3 text-[7px] font-bold transition ${
            canAssign
              ? hasConflict
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {hasConflict && overrideConflict
            ? "Override & Assign Speaker"
            : "Assign Speaker"}
        </button>
      </div>

      {/* Existing Schedule */}
      <div className="mt-7">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            {selectedSpeaker}'s Existing Schedule
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Existing assignments are checked automatically when
            selecting a speaker.
          </p>
        </div>

        <div className="space-y-3">
          {sessions
            .filter(
              (session) =>
                session.speaker === selectedSpeaker
            )
            .map((session) => {
              const conflictsWithNewSession =
                hasTimeOverlap(
                  startTime,
                  endTime,
                  session.start,
                  session.end
                );

              return (
                <div
                  key={session.id}
                  className={`rounded-2xl border p-4 ${
                    conflictsWithNewSession
                      ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                          {session.title}
                        </h4>

                        {conflictsWithNewSession && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-[5px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            OVERLAP
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[6px] text-slate-400">
                        Speaker: {session.speaker}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Clock3 size={11} />

                      {formatTime(session.start)} –{" "}
                      {formatTime(session.end)}
                    </div>
                  </div>
                </div>
              );
            })}

          {sessions.filter(
            (session) => session.speaker === selectedSpeaker
          ).length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
              <UserRound
                size={20}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-[7px] font-bold text-slate-500 dark:text-slate-400">
                No existing sessions
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventSessionSpeakerConflictDetection;