import {
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Image,
  MessageSquare,
  PlayCircle,
  Trophy,
  Users,
} from "lucide-react";

import {
  buildPostEventSummary,
} from "../../utils/postEventSummaryUtils";

const EventPostEventSummary = ({
  event = {},
  className = "",
}) => {
  const summary =
    buildPostEventSummary(event);

  if (!summary.completed) {
    return null;
  }

  const stats =
    summary.statistics;

  return (
    <section
      aria-labelledby="post-event-summary-title"
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Recap
            </p>

            <h2
              id="post-event-summary-title"
              className="mt-1 text-lg font-bold text-slate-900 dark:text-white"
            >
              {summary.title}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Post-Event Summary
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 size={13} />
          Event Completed
        </span>
      </div>

      {summary.description && (
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          {summary.description}
        </p>
      )}

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Registered"
          value={
            stats.registeredParticipants
          }
        />

        <StatCard
          icon={CalendarCheck}
          label="Attendees"
          value={stats.attendees}
        />

        <StatCard
          icon={BarChart3}
          label="Attendance"
          value={`${stats.attendancePercentage}%`}
        />

        <StatCard
          icon={Award}
          label="Certificates"
          value={
            stats.certificates
              .issued
          }
          secondary={`of ${stats.certificates.total}`}
        />
      </div>

      {/* Attendance progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Attendance Overview
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              {stats.attendees} attendees from{" "}
              {stats.registeredParticipants}{" "}
              registrations
            </p>
          </div>

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {stats.attendancePercentage}%
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={
            stats.attendancePercentage
          }
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Attendance percentage"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${stats.attendancePercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Highlights */}
      {summary.highlights.length >
        0 && (
        <SummaryBlock
          icon={Trophy}
          title="Event Highlights"
        >
          <ul className="space-y-2">
            {summary.highlights.map(
              (highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                  {typeof highlight ===
                  "object"
                    ? highlight.text ||
                      highlight.title ||
                      highlight.description
                    : highlight}
                </li>
              )
            )}
          </ul>
        </SummaryBlock>
      )}

      {/* Winners */}
      {summary.winners.length >
        0 && (
        <SummaryBlock
          icon={Trophy}
          title="Winners & Top Participants"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {summary.winners.map(
              (winner, index) => (
                <WinnerCard
                  key={
                    winner?.id ||
                    winner?.userId ||
                    index
                  }
                  winner={winner}
                  position={
                    index + 1
                  }
                />
              )
            )}
          </div>
        </SummaryBlock>
      )}

      {/* Top participants fallback */}
      {summary.winners.length ===
        0 &&
        summary.topParticipants
          .length > 0 && (
          <SummaryBlock
            icon={Trophy}
            title="Top Participants"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.topParticipants.map(
                (
                  participant,
                  index
                ) => (
                  <WinnerCard
                    key={
                      participant?.id ||
                      participant?.userId ||
                      index
                    }
                    winner={
                      participant
                    }
                    position={
                      index + 1
                    }
                  />
                )
              )}
            </div>
          </SummaryBlock>
        )}

      {/* Feedback */}
      {stats.feedback.count >
        0 && (
        <SummaryBlock
          icon={MessageSquare}
          title="Feedback Summary"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FeedbackStat
              label="Responses"
              value={
                stats.feedback.count
              }
            />

            <FeedbackStat
              label="Average Rating"
              value={
                stats.feedback
                  .averageRating
                  ? `${stats.feedback.averageRating}/5`
                  : "N/A"
              }
            />

            <FeedbackStat
              label="Positive"
              value={
                stats.feedback
                  .positiveCount
              }
            />

            <FeedbackStat
              label="Needs Improvement"
              value={
                stats.feedback
                  .negativeCount
              }
            />
          </div>
        </SummaryBlock>
      )}

      {/* Photos */}
      {summary.photos.length >
        0 && (
        <SummaryBlock
          icon={Image}
          title="Event Photos & Gallery"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {summary.photos
              .slice(0, 8)
              .map(
                (photo, index) => (
                  <PhotoCard
                    key={index}
                    photo={photo}
                  />
                )
              )}
          </div>
        </SummaryBlock>
      )}

      {/* Resources */}
      {summary.links.length >
        0 && (
        <SummaryBlock
          icon={BookOpen}
          title="Event Resources"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {summary.links.map(
              (link, index) => (
                <ResourceLink
                  key={
                    link.url ||
                    index
                  }
                  link={link}
                />
              )
            )}
          </div>
        </SummaryBlock>
      )}

      {/* Certificates */}
      {stats.certificates
        .total > 0 && (
        <SummaryBlock
          icon={Award}
          title="Certificates"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Certificate status
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {
                  stats.certificates
                    .issued
                }{" "}
                issued ·{" "}
                {
                  stats.certificates
                    .pending
                }{" "}
                pending
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:w-40 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${stats.certificates.percentage}%`,
                }}
              />
            </div>
          </div>
        </SummaryBlock>
      )}

      {/* Empty state */}
      {!hasSummarySections(
        summary
      ) && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/60">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Event summary is available
          </p>

          <p className="mt-1 text-xs text-slate-400">
            More event recap information will appear
            here when available.
          </p>
        </div>
      )}
    </section>
  );
};

/**
 * Statistics card.
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  secondary,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <Icon
        size={17}
        className="text-indigo-500"
      />

      <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>

        {secondary && (
          <span className="text-[10px] text-slate-400">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Reusable summary section.
 */
const SummaryBlock = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="mb-4 flex items-center gap-2">
        <Icon
          size={16}
          className="text-indigo-500"
        />

        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
};

/**
 * Winner card.
 */
const WinnerCard = ({
  winner,
  position,
}) => {
  const name =
    winner?.name ||
    winner?.fullName ||
    winner?.username ||
    winner?.participantName ||
    "Participant";

  const score =
    winner?.score ??
    winner?.points;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        #{position}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
          {name}
        </p>

        {winner?.award && (
          <p className="mt-0.5 text-[10px] text-slate-400">
            {winner.award}
          </p>
        )}
      </div>

      {score !==
        undefined && (
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {score}
        </span>
      )}
    </div>
  );
};

/**
 * Feedback statistic.
 */
const FeedbackStat = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/**
 * Photo card.
 */
const PhotoCard = ({
  photo,
}) => {
  const src =
    typeof photo ===
    "string"
      ? photo
      : photo?.url ||
        photo?.src ||
        photo?.imageUrl;

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
        Image unavailable
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl"
    >
      <img
        src={src}
        alt={
          typeof photo ===
          "object"
            ? photo.alt ||
              photo.title ||
              "Event photo"
            : "Event photo"
        }
        className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </a>
  );
};

/**
 * Resource link.
 */
const ResourceLink = ({
  link,
}) => {
  const isRecording =
    link.type ===
    "recording";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
        {isRecording ? (
          <PlayCircle
            size={17}
            className="text-indigo-600 dark:text-indigo-400"
          />
        ) : (
          <BookOpen
            size={17}
            className="text-indigo-600 dark:text-indigo-400"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
          {link.label}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          Open resource
        </p>
      </div>

      <ExternalLink
        size={14}
        className="shrink-0 text-slate-400 transition group-hover:text-indigo-500"
      />
    </a>
  );
};

/**
 * Determine whether additional summary
 * sections contain content.
 */
const hasSummarySections = (
  summary
) => {
  return Boolean(
    summary.highlights.length ||
      summary.winners.length ||
      summary.topParticipants
        .length ||
      summary.photos.length ||
      summary.links.length ||
      summary.feedback.count ||
      summary.certificates.total
  );
};

export default EventPostEventSummary;