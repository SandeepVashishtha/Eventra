import {
  CalendarDays,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import OrganizerEventCard from "./OrganizerEventCard";
import {
  getOrganizerProfile,
  getOrganizerEventSummary,
} from "../../utils/organizerProfileUtils";

const OrganizerProfile = ({
  organizer,
  events = [],
}) => {
  if (!organizer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <Users
          size={40}
          className="mx-auto text-slate-400"
        />

        <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
          Organizer information unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Organizer details could not be loaded.
        </p>
      </div>
    );
  }

  const profile =
    getOrganizerProfile(organizer);

  const eventSummary =
    getOrganizerEventSummary(events);

  const previousEvents =
    eventSummary.previousEvents || [];

  const upcomingEvents =
    eventSummary.upcomingEvents || [];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {/* Profile header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 shadow-md dark:border-slate-900 dark:bg-indigo-900/40">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={`${profile.name} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                  {getInitials(
                    profile.name
                  )}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {profile.name}
              </h1>

              {profile.organization && (
                <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {profile.organization}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {profile.description}
            </p>
          )}

          {/* Organization details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profile.location && (
              <ProfileDetail
                icon={MapPin}
                label="Location"
                value={profile.location}
              />
            )}

            {profile.email && (
              <ProfileDetail
                icon={Mail}
                label="Contact"
                value={profile.email}
                href={`mailto:${profile.email}`}
              />
            )}

            {profile.website && (
              <ProfileDetail
                icon={Globe}
                label="Website"
                value="Visit website"
                href={profile.website}
              />
            )}

            <ProfileDetail
              icon={CalendarDays}
              label="Events"
              value={String(
                eventSummary.totalEvents
              )}
            />
          </div>

          {/* Social links */}
          {profile.socialLinks &&
            profile.socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {profile.socialLinks.map(
                  (social) => (
                    <a
                      key={`${social.label}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                    >
                      {social.label}
                      <ExternalLink
                        size={14}
                      />
                    </a>
                  )
                )}
              </div>
            )}
        </div>
      </div>

      {/* Event statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Events"
          value={
            eventSummary.totalEvents
          }
        />

        <StatCard
          label="Upcoming Events"
          value={
            upcomingEvents.length
          }
        />

        <StatCard
          label="Previous Events"
          value={
            previousEvents.length
          }
        />
      </div>

      {/* Upcoming events */}
      <EventSection
        title="Upcoming Events"
        description="Events currently scheduled by this organizer."
        events={upcomingEvents}
        emptyMessage="No upcoming events."
      />

      {/* Previous events */}
      <EventSection
        title="Previous Events"
        description="Events previously organized by this organizer."
        events={previousEvents}
        emptyMessage="No previous events."
      />
    </section>
  );
};

const EventSection = ({
  title,
  description,
  events,
  emptyMessage,
}) => (
  <section>
    <div className="mb-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>

    {events.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event, index) => (
          <OrganizerEventCard
            key={
              event.id ||
              event.eventId ||
              `${event.name || event.title}-${index}`
            }
            event={event}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <CalendarDays
          size={34}
          className="mx-auto text-slate-400"
        />

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    )}
  </section>
);

const ProfileDetail = ({
  icon: Icon,
  label,
  value,
  href,
}) => {
  const content = (
    <>
      <Icon
        size={18}
        className="shrink-0 text-indigo-500"
      />

      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={
          href.startsWith("mailto:")
            ? undefined
            : "_blank"
        }
        rel={
          href.startsWith("mailto:")
            ? undefined
            : "noopener noreferrer"
        }
        className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/20"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
      {content}
    </div>
  );
};

const StatCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const getInitials = (name = "") => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "O";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export default OrganizerProfile;