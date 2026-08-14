import React, { useState } from "react";

export interface SessionBookmarkData {
  id: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
}

interface SessionBookmarkProps {
  session: SessionBookmarkData;
  initialBookmarked?: boolean;
  isAuthenticated?: boolean;
  onBookmarkChange?: (
    sessionId: string,
    bookmarked: boolean
  ) => void;
}

const SessionBookmark: React.FC<
  SessionBookmarkProps
> = ({
  session,
  initialBookmarked = false,
  isAuthenticated = true,
  onBookmarkChange,
}) => {
  const [bookmarked, setBookmarked] =
    useState(initialBookmarked);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      setMessage(
        "Please sign in to bookmark sessions."
      );
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const nextState = !bookmarked;

      setBookmarked(nextState);

      onBookmarkChange?.(
        session.id,
        nextState
      );

      setMessage(
        nextState
          ? "Session added to your schedule."
          : "Session removed from your schedule."
      );
    } catch {
      setBookmarked(bookmarked);

      setMessage(
        "Unable to update the bookmark. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleBookmark}
        disabled={loading}
        aria-pressed={bookmarked}
        aria-label={
          bookmarked
            ? `Remove ${session.title} from your schedule`
            : `Bookmark ${session.title}`
        }
        className={`
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          px-4
          py-2
          text-sm
          font-semibold
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${
            bookmarked
              ? `
                border-blue-600
                bg-blue-600
                text-white
                hover:bg-blue-700
              `
              : `
                border-gray-300
                bg-white
                text-gray-700
                hover:bg-gray-50
                dark:border-gray-600
                dark:bg-gray-800
                dark:text-gray-200
                dark:hover:bg-gray-700
              `
          }
        `}
      >
        <span
          aria-hidden="true"
          className="text-base"
        >
          {bookmarked ? "★" : "☆"}
        </span>

        <span>
          {loading
            ? "Saving..."
            : bookmarked
            ? "Bookmarked"
            : "Bookmark"}
        </span>
      </button>

      {message && (
        <p
          role="status"
          className="
            text-xs
            text-gray-500
            dark:text-gray-400
          "
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default SessionBookmark;