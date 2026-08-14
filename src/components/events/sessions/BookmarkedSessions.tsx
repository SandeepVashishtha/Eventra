import React, {
  useMemo,
} from "react";

import type {
  SessionBookmarkData,
} from "./SessionBookmark";

interface BookmarkedSessionsProps {
  sessions: SessionBookmarkData[];
  bookmarkedSessionIds: string[];
  onRemove?: (
    sessionId: string
  ) => void;
}

const BookmarkedSessions: React.FC<
  BookmarkedSessionsProps
> = ({
  sessions,
  bookmarkedSessionIds,
  onRemove,
}) => {
  const bookmarkedSessions =
    useMemo(() => {
      return sessions
        .filter((session) =>
          bookmarkedSessionIds.includes(
            session.id
          )
        )
        .sort(
          (a, b) =>
            new Date(
              a.startTime
            ).getTime() -
            new Date(
              b.startTime
            ).getTime()
        );
    }, [
      sessions,
      bookmarkedSessionIds,
    ]);

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    ).format(date);
  };

  const formatTime = (
    value: string
  ) => {
    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "--";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
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
    >
      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            My Session Schedule
          </h2>

          <p
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Sessions you have
            bookmarked.
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-blue-100
            px-3
            py-1
            text-xs
            font-semibold
            text-blue-700
            dark:bg-blue-900/30
            dark:text-blue-300
          "
        >
          {bookmarkedSessions.length}{" "}
          {bookmarkedSessions.length ===
          1
            ? "session"
            : "sessions"}
        </span>
      </div>

      {bookmarkedSessions.length ===
      0 ? (
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
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-gray-100
              text-xl
              dark:bg-gray-800
            "
          >
            ☆
          </div>

          <h3
            className="
              mt-4
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            No bookmarked sessions
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Bookmark sessions from
            event schedules to build
            your personal schedule.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-6
            space-y-4
          "
        >
          {bookmarkedSessions.map(
            (session) => (
              <article
                key={session.id}
                className="
                  rounded-xl
                  border
                  border-gray-200
                  p-5
                  dark:border-gray-700
                "
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
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-blue-600
                        dark:text-blue-400
                      "
                    >
                      {formatDate(
                        session.startTime
                      )}
                    </p>

                    <h3
                      className="
                        mt-1
                        text-lg
                        font-bold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {session.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-gray-600
                        dark:text-gray-400
                      "
                    >
                      {formatTime(
                        session.startTime
                      )}
                      {" - "}
                      {formatTime(
                        session.endTime
                      )}
                    </p>

                    {session.speaker && (
                      <p
                        className="
                          mt-2
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        Speaker:{" "}
                        {session.speaker}
                      </p>
                    )}

                    {session.location && (
                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        Location:{" "}
                        {session.location}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRemove?.(
                        session.id
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-gray-50
                      dark:border-gray-600
                      dark:text-gray-200
                      dark:hover:bg-gray-800
                    "
                  >
                    Remove
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default BookmarkedSessions;