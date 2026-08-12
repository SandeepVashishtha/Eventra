import {
  Bell,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventSessionWaitlist = ({
  session,
  waitlist = [],
  currentUserId,
  onJoinWaitlist,
  onLeaveWaitlist,
  onPromoteParticipant,
  className = "",
}) => {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const capacity = session?.capacity || 0;

  const registeredCount =
    session?.registeredCount || 0;

  const availableSeats = Math.max(
    capacity - registeredCount,
    0
  );

  const isFull =
    capacity > 0 &&
    registeredCount >= capacity;

  const sortedWaitlist = useMemo(() => {
    return [...waitlist].sort(
      (a, b) =>
        new Date(a.joinedAt) -
        new Date(b.joinedAt)
    );
  }, [waitlist]);

  const currentPosition = sortedWaitlist.findIndex(
    (participant) =>
      participant.userId === currentUserId
  );

  const isOnWaitlist =
    currentPosition !== -1;

  const handleJoin = async () => {
    setProcessing(true);
    setMessage("");

    try {
      await onJoinWaitlist?.(session);

      setMessage(
        "You have been added to the session waitlist."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to join the waitlist."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleLeave = async () => {
    setProcessing(true);
    setMessage("");

    try {
      await onLeaveWaitlist?.(session);

      setMessage(
        "You have left the session waitlist."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to leave the waitlist."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Session Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Session Waitlist
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {session?.name ||
                "Event Session"}
            </h2>

            {session?.date && (
              <p className="mt-1 text-[8px] text-slate-400">
                {formatDate(session.date)}
              </p>
            )}
          </div>
        </div>

        <StatusBadge
          full={isFull}
          availableSeats={availableSeats}
        />
      </div>

      {/* Capacity */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <InfoCard
          label="Capacity"
          value={capacity}
        />

        <InfoCard
          label="Registered"
          value={registeredCount}
        />

        <InfoCard
          label="Available"
          value={availableSeats}
        />
      </div>

      {/* Current User */}
      {isOnWaitlist && (
        <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Clock3 size={17} />
            </div>

            <div className="flex-1">
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                Your Waitlist Position
              </p>

              <p className="mt-1 text-3xl font-black text-indigo-700 dark:text-indigo-300">
                #{currentPosition + 1}
              </p>

              <p className="mt-1 text-[7px] text-indigo-700/70 dark:text-indigo-400/70">
                You will be notified when a seat becomes
                available.
              </p>

              <button
                type="button"
                disabled={processing}
                onClick={handleLeave}
                className="mt-4 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-[7px] font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-indigo-400"
              >
                {processing
                  ? "Processing..."
                  : "Leave Waitlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join */}
      {isFull && !isOnWaitlist && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <Clock3
              size={17}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div className="flex-1">
              <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                Session Is Full
              </p>

              <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
                Join the waitlist to be considered when a
                seat becomes available.
              </p>

              <button
                type="button"
                disabled={processing}
                onClick={handleJoin}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing
                  ? "Joining..."
                  : "Join Session Waitlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available */}
      {!isFull && !isOnWaitlist && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div>
            <p className="text-[9px] font-bold text-green-700 dark:text-green-400">
              Seats Available
            </p>

            <p className="mt-1 text-[7px] text-green-700/70 dark:text-green-400/70">
              {availableSeats} seat
              {availableSeats !== 1
                ? "s"
                : ""}{" "}
              currently available for this session.
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-[8px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </div>
      )}

      {/* Waitlist */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Current Waitlist
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Participants are promoted in waitlist order.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {sortedWaitlist.length}
          </span>
        </div>

        {sortedWaitlist.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <Users
              size={23}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-600 dark:text-slate-300">
              No one is waiting
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {sortedWaitlist.map(
              (participant, index) => (
                <WaitlistRow
                  key={participant.id}
                  participant={participant}
                  position={index + 1}
                  isCurrentUser={
                    participant.userId ===
                    currentUserId
                  }
                  onPromote={() =>
                    onPromoteParticipant?.(
                      participant
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Promotion Information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Bell
            size={17}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Promotion Notifications
            </p>

            <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              When a seat becomes available, the next eligible
              participant can be promoted and notified automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -----------------------------
   Waitlist Row
------------------------------ */

const WaitlistRow = ({
  participant,
  position,
  isCurrentUser,
  onPromote,
}) => {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
        isCurrentUser
          ? "border-indigo-300 dark:border-indigo-700"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[8px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          #{position}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
              {participant.name ||
                "Participant"}
            </p>

            {isCurrentUser && (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400">
                You
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-[7px] text-slate-400">
            {participant.email || "No email"}
          </p>

          {participant.joinedAt && (
            <p className="mt-1 text-[6px] text-slate-400">
              Joined{" "}
              {formatDate(
                participant.joinedAt
              )}
            </p>
          )}
        </div>

        {onPromote && (
          <button
            type="button"
            onClick={onPromote}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-[7px] font-bold text-white hover:bg-indigo-700"
          >
            Promote
          </button>
        )}
      </div>
    </div>
  );
};

/* -----------------------------
   Info Card
------------------------------ */

const InfoCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

/* -----------------------------
   Status Badge
------------------------------ */

const StatusBadge = ({
  full,
  availableSeats,
}) => {
  if (full) {
    return (
      <span className="whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-[7px] font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400">
        Full
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-green-50 px-3 py-1.5 text-[7px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
      {availableSeats} Available
    </span>
  );
};

/* -----------------------------
   Helpers
------------------------------ */

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default EventSessionWaitlist;