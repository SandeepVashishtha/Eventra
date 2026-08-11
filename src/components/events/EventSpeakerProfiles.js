import {
  Award,
  ExternalLink,
  Linkedin,
  Mic2,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";

const EventSpeakerProfiles = ({
  speakers = [],
  title = "Event Speakers",
  subtitle = "Meet the experts and speakers participating in this event.",
  className = "",
  onSpeakerClick,
}) => {
  const normalizedSpeakers = useMemo(
    () =>
      Array.isArray(speakers)
        ? speakers.map(normalizeSpeaker)
        : [],
    [speakers]
  );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Mic2
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Featured Speakers
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-2.5 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Speakers
          </p>

          <p className="mt-0.5 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {normalizedSpeakers.length}
          </p>
        </div>
      </div>

      {/* Speaker list */}
      {normalizedSpeakers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {normalizedSpeakers.map(
            (speaker, index) => (
              <SpeakerCard
                key={
                  speaker.id ||
                  `${speaker.name}-${index}`
                }
                speaker={speaker}
                onClick={onSpeakerClick}
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Speaker Card
----------------------------------- */

const SpeakerCard = ({
  speaker,
  onClick,
}) => {
  const clickable =
    typeof onClick === "function";

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 ${
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700"
          : ""
      }`}
      onClick={() =>
        onClick?.(speaker)
      }
      role={
        clickable
          ? "button"
          : undefined
      }
      tabIndex={
        clickable
          ? 0
          : undefined
      }
      onKeyDown={(event) => {
        if (
          clickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick(speaker);
        }
      }}
    >
      {/* Profile section */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <SpeakerAvatar
            speaker={speaker}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {speaker.name}
                </h3>

                {speaker.designation && (
                  <p className="mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {speaker.designation}
                  </p>
                )}

                {speaker.organization && (
                  <p className="mt-0.5 truncate text-[9px] text-slate-400">
                    {speaker.organization}
                  </p>
                )}
              </div>

              {speaker.featured && (
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Biography */}
        {speaker.biography && (
          <p className="mt-4 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {speaker.biography}
          </p>
        )}

        {/* Expertise */}
        {speaker.expertise.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5">
              <Award
                size={12}
                className="text-indigo-500"
              />

              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Expertise
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {speaker.expertise
                .slice(0, 5)
                .map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  )
                )}

              {speaker.expertise.length >
                5 && (
                <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  +
                  {speaker.expertise
                    .length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Session */}
        {speaker.session && (
          <SessionInfo
            session={
              speaker.session
            }
          />
        )}

        {/* Social links */}
        {speaker.links.length > 0 && (
          <SocialLinks
            links={speaker.links}
          />
        )}
      </div>
    </article>
  );
};

/* ----------------------------------
   Speaker avatar
----------------------------------- */

const SpeakerAvatar = ({
  speaker,
}) => {
  if (speaker.photo) {
    return (
      <img
        src={speaker.photo}
        alt={`${speaker.name} profile`}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
        loading="lazy"
      />
    );
  }

  const initials = getInitials(
    speaker.name
  );

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {initials || (
        <UserRound size={22} />
      )}
    </div>
  );
};

/* ----------------------------------
   Session information
----------------------------------- */

const SessionInfo = ({
  session,
}) => {
  const sessionTitle =
    typeof session ===
    "string"
      ? session
      : session.title ||
        session.name ||
        "Speaker Session";

  const sessionDate =
    typeof session ===
    "object"
      ? session.date ||
        session.startTime ||
        null
      : null;

  const sessionTime =
    typeof session ===
    "object"
      ? session.time ||
        null
      : null;

  const sessionLocation =
    typeof session ===
    "object"
      ? session.location ||
        session.venue ||
        null
      : null;

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
        Session
      </p>

      <p className="mt-1 text-xs font-bold text-indigo-900 dark:text-indigo-200">
        {sessionTitle}
      </p>

      {(sessionDate ||
        sessionTime ||
        sessionLocation) && (
        <div className="mt-2 space-y-1">
          {sessionDate && (
            <p className="text-[9px] text-indigo-700 dark:text-indigo-300">
              {formatDateTime(
                sessionDate
              )}
            </p>
          )}

          {sessionTime && (
            <p className="text-[9px] text-indigo-700 dark:text-indigo-300">
              {sessionTime}
            </p>
          )}

          {sessionLocation && (
            <p className="text-[9px] text-indigo-700 dark:text-indigo-300">
              {sessionLocation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Social links
----------------------------------- */

const SocialLinks = ({
  links,
}) => {
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      {links.map(
        (link, index) => (
          <a
            key={`${link.url}-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
            aria-label={`Open ${link.label} profile`}
          >
            {getSocialIcon(
              link.type
            )}

            {link.label}

            <ExternalLink
              size={9}
            />
          </a>
        )
      )}
    </div>
  );
};

/* ----------------------------------
   Social icon
----------------------------------- */

const getSocialIcon = (
  type
) => {
  if (
    String(type)
      .toLowerCase() ===
    "linkedin"
  ) {
    return (
      <Linkedin size={11} />
    );
  }

  return (
    <ExternalLink size={11} />
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = () => {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Mic2 size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        No speakers available
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Speaker profiles will appear here when event
        organizers add speakers.
      </p>
    </div>
  );
};

/* ----------------------------------
   Normalize speaker
----------------------------------- */

const normalizeSpeaker = (
  speaker = {}
) => {
  const links = normalizeLinks(
    speaker.links ||
      speaker.socialLinks ||
      speaker.profiles ||
      []
  );

  const expertise = normalizeExpertise(
    speaker.expertise ||
      speaker.skills ||
      speaker.specializations
  );

  return {
    ...speaker,

    id:
      speaker.id ||
      speaker.speakerId ||
      speaker._id,

    name:
      speaker.name ||
      [
        speaker.firstName,
        speaker.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Event Speaker",

    photo:
      speaker.photo ||
      speaker.profilePhoto ||
      speaker.profileImage ||
      speaker.avatar ||
      "",

    designation:
      speaker.designation ||
      speaker.jobTitle ||
      speaker.role ||
      "",

    organization:
      speaker.organization ||
      speaker.company ||
      speaker.institution ||
      "",

    biography:
      speaker.biography ||
      speaker.bio ||
      "",

    expertise,

    links,

    session:
      speaker.session ||
      speaker.sessionInfo ||
      null,

    featured:
      Boolean(
        speaker.featured
      ),
  };
};

/* ----------------------------------
   Normalize expertise
----------------------------------- */

const normalizeExpertise = (
  expertise
) => {
  if (!expertise) {
    return [];
  }

  if (Array.isArray(expertise)) {
    return expertise
      .map((item) =>
        typeof item ===
        "string"
          ? item
          : item?.name ||
            item?.title ||
            ""
      )
      .filter(Boolean);
  }

  if (
    typeof expertise ===
    "string"
  ) {
    return expertise
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

/* ----------------------------------
   Normalize social links
----------------------------------- */

const normalizeLinks = (
  links
) => {
  if (
    !Array.isArray(links)
  ) {
    return [];
  }

  return links
    .map((link) => {
      if (
        typeof link ===
        "string"
      ) {
        return {
          url: link,
          label: getLinkLabel(
            link
          ),
          type: getLinkType(
            link
          ),
        };
      }

      if (!link) {
        return null;
      }

      const url =
        link.url ||
        link.href ||
        link.link;

      if (!url) {
        return null;
      }

      return {
        url,
        label:
          link.label ||
          link.name ||
          getLinkLabel(url),
        type:
          link.type ||
          getLinkType(url),
      };
    })
    .filter(Boolean);
};

/* ----------------------------------
   Link helpers
----------------------------------- */

const getLinkType = (
  url
) => {
  const value =
    String(url).toLowerCase();

  if (
    value.includes(
      "linkedin.com"
    )
  ) {
    return "linkedin";
  }

  if (
    value.includes(
      "github.com"
    )
  ) {
    return "github";
  }

  if (
    value.includes(
      "twitter.com"
    ) ||
    value.includes(
      "x.com"
    )
  ) {
    return "twitter";
  }

  return "website";
};

const getLinkLabel = (
  url
) => {
  const type =
    getLinkType(url);

  const labels = {
    linkedin: "LinkedIn",
    github: "GitHub",
    twitter: "Profile",
    website: "Website",
  };

  return (
    labels[type] ||
    "Profile"
  );
};

/* ----------------------------------
   Initials
----------------------------------- */

const getInitials = (
  name
) => {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ||
        ""
    )
    .join("");
};

/* ----------------------------------
   Date formatting
----------------------------------- */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventSpeakerProfiles;