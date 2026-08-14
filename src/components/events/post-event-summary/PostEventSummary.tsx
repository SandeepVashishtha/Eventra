import React, { useMemo } from "react";

export interface PostEventSpeaker {
  id: string;
  name: string;
  role?: string;
  organization?: string;
  imageUrl?: string;
}

export interface PostEventSession {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  speakerName?: string;
}

export interface PostEventResource {
  id: string;
  name: string;
  url: string;
  type?: string;
}

export interface PostEventFeedback {
  id: string;
  rating?: number;
  comment?: string;
}

export interface PostEventMedia {
  id: string;
  url: string;
  title?: string;
  type?: "image" | "video";
}

export interface PostEventCertificate {
  id: string;
  name?: string;
  url?: string;
  available: boolean;
}

export interface PostEventData {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  speakers?: PostEventSpeaker[];
  sessions?: PostEventSession[];
  resources?: PostEventResource[];
  feedback?: PostEventFeedback[];
  media?: PostEventMedia[];
  certificate?: PostEventCertificate;
}

interface PostEventSummaryProps {
  event: PostEventData;
  className?: string;
}

const formatDate = (
  value?: string
): string => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(date);
};

const formatDateTime = (
  value?: string
): string => {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const isEventCompleted = (
  endDate?: string
): boolean => {
  if (!endDate) {
    return false;
  }

  const end = new Date(endDate);

  if (Number.isNaN(end.getTime())) {
    return false;
  }

  return end.getTime() < Date.now();
};

const PostEventSummary: React.FC<
  PostEventSummaryProps
> = ({
  event,
  className = "",
}) => {
  const completed = useMemo(
    () =>
      isEventCompleted(
        event.endDate
      ),
    [event.endDate]
  );

  if (!completed) {
    return (
      <section
        className={`
          w-full
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
          ${className}
        `}
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-gray-100
              text-xl
              dark:bg-gray-800
            "
          >
            📅
          </div>

          <h2
            className="
              mt-4
              text-xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Event summary is not
            available yet
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-lg
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            The post-event summary
            will become available after
            this event has ended.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`
        w-full
        space-y-6
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
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
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div>
            <span
              className="
                inline-flex
                rounded-full
                bg-green-100
                px-3
                py-1
                text-xs
                font-semibold
                text-green-700
                dark:bg-green-900/30
                dark:text-green-300
              "
            >
              Event Completed
            </span>

            <h1
              className="
                mt-3
                text-2xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              {event.title}
            </h1>

            {event.description && (
              <p
                className="
                  mt-3
                  max-w-3xl
                  text-sm
                  leading-6
                  text-gray-600
                  dark:text-gray-400
                "
              >
                {event.description}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <div
            className="
              rounded-xl
              bg-gray-50
              p-4
              dark:bg-gray-800
            "
          >
            <p
              className="
                text-xs
                font-medium
                text-gray-500
                dark:text-gray-400
              "
            >
              Event Date
            </p>

            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              {formatDate(
                event.startDate
              )}
            </p>
          </div>

          <div
            className="
              rounded-xl
              bg-gray-50
              p-4
              dark:bg-gray-800
            "
          >
            <p
              className="
                text-xs
                font-medium
                text-gray-500
                dark:text-gray-400
              "
            >
              Venue
            </p>

            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              {event.venue ||
                "Online / Venue unavailable"}
            </p>
          </div>
        </div>
      </div>

      {/* Speakers */}
      {event.speakers &&
        event.speakers.length > 0 && (
          <div
            className="
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
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Speakers
            </h2>

            <div
              className="
                mt-5
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {event.speakers.map(
                (speaker) => (
                  <article
                    key={speaker.id}
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      p-4
                      dark:border-gray-700
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      {speaker.imageUrl ? (
                        <img
                          src={
                            speaker.imageUrl
                          }
                          alt={
                            speaker.name
                          }
                          className="
                            h-12
                            w-12
                            rounded-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-100
                            font-semibold
                            text-gray-600
                            dark:bg-gray-800
                            dark:text-gray-300
                          "
                        >
                          {speaker.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3
                          className="
                            font-semibold
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {
                            speaker.name
                          }
                        </h3>

                        {speaker.role && (
                          <p
                            className="
                              text-xs
                              text-gray-500
                              dark:text-gray-400
                            "
                          >
                            {
                              speaker.role
                            }
                          </p>
                        )}

                        {speaker.organization && (
                          <p
                            className="
                              text-xs
                              text-gray-500
                              dark:text-gray-400
                            "
                          >
                            {
                              speaker.organization
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        )}

      {/* Sessions */}
      {event.sessions &&
        event.sessions.length > 0 && (
          <div
            className="
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
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Sessions
            </h2>

            <div
              className="
                mt-5
                space-y-4
              "
            >
              {event.sessions.map(
                (session) => (
                  <article
                    key={session.id}
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      p-4
                      dark:border-gray-700
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >
                      <div>
                        <h3
                          className="
                            font-semibold
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {
                            session.title
                          }
                        </h3>

                        {session.description && (
                          <p
                            className="
                              mt-1
                              text-sm
                              text-gray-600
                              dark:text-gray-400
                            "
                          >
                            {
                              session.description
                            }
                          </p>
                        )}
                      </div>

                      {session.startTime && (
                        <span
                          className="
                            whitespace-nowrap
                            text-xs
                            text-gray-500
                            dark:text-gray-400
                          "
                        >
                          {
                            formatDateTime(
                              session.startTime
                            )
                          }
                        </span>
                      )}
                    </div>

                    {session.speakerName && (
                      <p
                        className="
                          mt-3
                          text-xs
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        Speaker:{" "}
                        {
                          session.speakerName
                        }
                      </p>
                    )}
                  </article>
                )
              )}
            </div>
          </div>
        )}

      {/* Resources */}
      {event.resources &&
        event.resources.length > 0 && (
          <div
            className="
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
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Event Resources
            </h2>

            <div
              className="
                mt-5
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              {event.resources.map(
                (resource) => (
                  <a
                    key={resource.id}
                    href={
                      resource.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      p-4
                      transition
                      hover:bg-gray-50
                      dark:border-gray-700
                      dark:hover:bg-gray-800
                    "
                  >
                    <p
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {resource.name}
                    </p>

                    {resource.type && (
                      <p
                        className="
                          mt-1
                          text-xs
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        {resource.type}
                      </p>
                    )}
                  </a>
                )
              )}
            </div>
          </div>
        )}

      {/* Feedback */}
      {event.feedback &&
        event.feedback.length > 0 && (
          <div
            className="
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
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Participant Feedback
            </h2>

            <div
              className="
                mt-5
                space-y-4
              "
            >
              {event.feedback.map(
                (feedback) => (
                  <article
                    key={feedback.id}
                    className="
                      rounded-xl
                      bg-gray-50
                      p-4
                      dark:bg-gray-800
                    "
                  >
                    {typeof feedback.rating ===
                      "number" && (
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        Rating:{" "}
                        {
                          feedback.rating
                        }/5
                      </p>
                    )}

                    {feedback.comment && (
                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        {
                          feedback.comment
                        }
                      </p>
                    )}
                  </article>
                )
              )}
            </div>
          </div>
        )}

      {/* Media */}
      {event.media &&
        event.media.length > 0 && (
          <div
            className="
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
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Photos & Media
            </h2>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {event.media.map(
                (media) => (
                  <a
                    key={media.id}
                    href={
                      media.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="
                      group
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200
                      dark:border-gray-700
                    "
                  >
                    {media.type ===
                    "video" ? (
                      <div
                        className="
                          flex
                          aspect-video
                          items-center
                          justify-center
                          bg-gray-100
                          text-2xl
                          dark:bg-gray-800
                        "
                      >
                        ▶
                      </div>
                    ) : (
                      <img
                        src={
                          media.url
                        }
                        alt={
                          media.title ||
                          "Event media"
                        }
                        className="
                          aspect-video
                          w-full
                          object-cover
                          transition
                          duration-200
                          group-hover:scale-105
                        "
                      />
                    )}

                    {media.title && (
                      <p
                        className="
                          p-2
                          text-xs
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        {
                          media.title
                        }
                      </p>
                    )}
                  </a>
                )
              )}
            </div>
          </div>
        )}

      {/* Certificate */}
      {event.certificate?.available && (
        <div
          className="
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
              gap-4
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
                Certificate
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Your event certificate is
                available.
              </p>
            </div>

            {event.certificate.url && (
              <a
                href={
                  event.certificate.url
                }
                target="_blank"
                rel="noreferrer"
                className="
                  rounded-lg
                  bg-gray-900
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-gray-700
                  dark:bg-white
                  dark:text-gray-900
                  dark:hover:bg-gray-200
                "
              >
                View Certificate
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PostEventSummary;