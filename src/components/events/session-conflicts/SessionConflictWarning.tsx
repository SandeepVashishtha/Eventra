import React, { useMemo, useState } from "react";

export interface EventSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
}

interface SessionConflictWarningProps {
  sessions?: EventSession[];
  initialSelectedSessionIds?: string[];
  onSelectionChange?: (sessionIds: string[]) => void;
}

interface SessionConflict {
  first: EventSession;
  second: EventSession;
}

const toTimestamp = (value: string): number => {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sessionsOverlap = (
  first: EventSession,
  second: EventSession,
): boolean => {
  const firstStart = toTimestamp(first.startTime);
  const firstEnd = toTimestamp(first.endTime);
  const secondStart = toTimestamp(second.startTime);
  const secondEnd = toTimestamp(second.endTime);

  if (
    firstEnd <= firstStart ||
    secondEnd <= secondStart
  ) {
    return false;
  }

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
};

const findConflicts = (
  sessions: EventSession[],
): SessionConflict[] => {
  const conflicts: SessionConflict[] = [];

  for (let index = 0; index < sessions.length; index += 1) {
    for (
      let nextIndex = index + 1;
      nextIndex < sessions.length;
      nextIndex += 1
    ) {
      const first = sessions[index];
      const second = sessions[nextIndex];

      if (sessionsOverlap(first, second)) {
        conflicts.push({
          first,
          second,
        });
      }
    }
  }

  return conflicts;
};

const formatSessionTime = (
  value: string,
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const sortSessions = (
  sessions: EventSession[],
): EventSession[] => {
  return [...sessions].sort(
    (first, second) =>
      toTimestamp(first.startTime) -
      toTimestamp(second.startTime),
  );
};

const SessionConflictWarning: React.FC<
  SessionConflictWarningProps
> = ({
  sessions = [],
  initialSelectedSessionIds = [],
  onSelectionChange,
}) => {
  const [selectedSessionIds, setSelectedSessionIds] =
    useState<string[]>(
      initialSelectedSessionIds,
    );

  const [showOnlySelected, setShowOnlySelected] =
    useState(false);

  const sortedSessions = useMemo(
    () => sortSessions(sessions),
    [sessions],
  );

  const selectedSessions = useMemo(
    () =>
      sortedSessions.filter((session) =>
        selectedSessionIds.includes(
          session.id,
        ),
      ),
    [sortedSessions, selectedSessionIds],
  );

  const conflicts = useMemo(
    () => findConflicts(selectedSessions),
    [selectedSessions],
  );

  const conflictingSessionIds = useMemo(() => {
    const ids = new Set<string>();

    conflicts.forEach((conflict) => {
      ids.add(conflict.first.id);
      ids.add(conflict.second.id);
    });

    return ids;
  }, [conflicts]);

  const visibleSessions = useMemo(() => {
    if (!showOnlySelected) {
      return sortedSessions;
    }

    return selectedSessions;
  }, [
    showOnlySelected,
    sortedSessions,
    selectedSessions,
  ]);

  const toggleSession = (
    sessionId: string,
  ) => {
    const nextSelection =
      selectedSessionIds.includes(sessionId)
        ? selectedSessionIds.filter(
            (id) => id !== sessionId,
          )
        : [
            ...selectedSessionIds,
            sessionId,
          ];

    setSelectedSessionIds(nextSelection);

    onSelectionChange?.(nextSelection);
  };

  const clearSelection = () => {
    setSelectedSessionIds([]);

    onSelectionChange?.([]);
  };

  return (
    <section
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
      "
      aria-labelledby="session-conflict-title"
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h2
            id="session-conflict-title"
            className="
              text-2xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Session Schedule
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Select sessions you plan to attend.
            Eventra will warn you when selected
            sessions overlap.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setShowOnlySelected(
                (current) => !current,
              )
            }
            className="
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-100
              dark:border-gray-600
              dark:text-gray-200
              dark:hover:bg-gray-800
            "
          >
            {showOnlySelected
              ? "Show All"
              : "Selected Only"}
          </button>

          <button
            type="button"
            onClick={clearSelection}
            disabled={
              selectedSessionIds.length === 0
            }
            className="
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-gray-600
              dark:text-gray-200
              dark:hover:bg-gray-800
            "
          >
            Clear
          </button>
        </div>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-3
        "
      >
        <div
          className="
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-4
            dark:border-blue-900
            dark:bg-blue-900/20
          "
        >
          <p
            className="
              text-sm
              text-blue-700
              dark:text-blue-300
            "
          >
            Available Sessions
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-blue-800
              dark:text-blue-200
            "
          >
            {sessions.length}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-purple-200
            bg-purple-50
            p-4
            dark:border-purple-900
            dark:bg-purple-900/20
          "
        >
          <p
            className="
              text-sm
              text-purple-700
              dark:text-purple-300
            "
          >
            Selected Sessions
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-purple-800
              dark:text-purple-200
            "
          >
            {selectedSessionIds.length}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            dark:border-red-900
            dark:bg-red-900/20
          "
        >
          <p
            className="
              text-sm
              text-red-700
              dark:text-red-300
            "
          >
            Conflicts
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-red-800
              dark:text-red-200
            "
          >
            {conflicts.length}
          </p>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-orange-300
            bg-orange-50
            p-5
            dark:border-orange-800
            dark:bg-orange-900/20
          "
          role="alert"
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              aria-hidden="true"
              className="
                text-xl
              "
            >
              ⚠️
            </span>

            <div>
              <h3
                className="
                  font-semibold
                  text-orange-900
                  dark:text-orange-200
                "
              >
                Schedule conflicts detected
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-orange-800
                  dark:text-orange-300
                "
              >
                Some of your selected sessions
                overlap. Review the conflicts below
                and change your selection if needed.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {conflicts.map(
              (conflict, index) => (
                <div
                  key={`${conflict.first.id}-${conflict.second.id}`}
                  className="
                    rounded-lg
                    border
                    border-orange-200
                    bg-white
                    p-4
                    dark:border-orange-900
                    dark:bg-gray-900
                  "
                >
                  <p
                    className="
                      mb-3
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-orange-700
                      dark:text-orange-300
                    "
                  >
                    Conflict {index + 1}
                  </p>

                  <div
                    className="
                      grid
                      gap-3
                      md:grid-cols-2
                    "
                  >
                    <div>
                      <p
                        className="
                          font-semibold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {conflict.first.title}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        {formatSessionTime(
                          conflict.first.startTime,
                        )}
                        {" – "}
                        {formatSessionTime(
                          conflict.first.endTime,
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className="
                          font-semibold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {conflict.second.title}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        {formatSessionTime(
                          conflict.second.startTime,
                        )}
                        {" – "}
                        {formatSessionTime(
                          conflict.second.endTime,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {selectedSessions.length > 0 &&
        conflicts.length === 0 && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-green-200
              bg-green-50
              p-5
              dark:border-green-900
              dark:bg-green-900/20
            "
            role="status"
          >
            <h3
              className="
                font-semibold
                text-green-900
                dark:text-green-200
              "
            >
              No session conflicts
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-green-700
                dark:text-green-300
              "
            >
              Your selected sessions do not
              overlap.
            </p>
          </div>
        )}

      {visibleSessions.length === 0 ? (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-dashed
            border-gray-300
            p-8
            text-center
            dark:border-gray-700
          "
        >
          <h3
            className="
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            No sessions available
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Sessions will appear here when they
            are available for this event.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleSessions.map(
            (session) => {
              const selected =
                selectedSessionIds.includes(
                  session.id,
                );

              const hasConflict =
                conflictingSessionIds.has(
                  session.id,
                );

              return (
                <article
                  key={session.id}
                  className={`
                    rounded-xl
                    border
                    p-5
                    transition
                    ${
                      hasConflict
                        ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10"
                        : selected
                          ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      md:flex-row
                      md:items-start
                      md:justify-between
                    "
                  >
                    <div
                      className="
                        flex
                        gap-4
                      "
                    >
                      <input
                        id={`session-${session.id}`}
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleSession(
                            session.id,
                          )
                        }
                        className="
                          mt-1
                          h-5
                          w-5
                          rounded
                          border-gray-300
                          text-blue-600
                          focus:ring-blue-500
                        "
                      />

                      <div>
                        <label
                          htmlFor={`session-${session.id}`}
                          className="
                            cursor-pointer
                            text-lg
                            font-semibold
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {session.title}
                        </label>

                        <p
                          className="
                            mt-2
                            text-sm
                            text-gray-600
                            dark:text-gray-400
                          "
                        >
                          {formatSessionTime(
                            session.startTime,
                          )}
                          {" – "}
                          {formatSessionTime(
                            session.endTime,
                          )}
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            gap-3
                            text-sm
                            text-gray-500
                            dark:text-gray-400
                          "
                        >
                          {session.speaker && (
                            <span>
                              Speaker:{" "}
                              {
                                session.speaker
                              }
                            </span>
                          )}

                          {session.location && (
                            <span>
                              Location:{" "}
                              {
                                session.location
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasConflict && (
                      <span
                        className="
                          inline-flex
                          w-fit
                          rounded-full
                          bg-orange-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-orange-800
                          dark:bg-orange-900/30
                          dark:text-orange-300
                        "
                      >
                        Schedule Conflict
                      </span>
                    )}
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      <div
        className="
          mt-6
          rounded-lg
          bg-gray-50
          p-4
          text-sm
          text-gray-600
          dark:bg-gray-800
          dark:text-gray-400
        "
      >
        <strong
          className="
            text-gray-800
            dark:text-gray-200
          "
        >
          Tip:
        </strong>{" "}
        Select the sessions you want to attend.
        If two selected sessions happen at the
        same time, Eventra will highlight the
        conflict so you can change your selection.
      </div>
    </section>
  );
};

export default SessionConflictWarning;