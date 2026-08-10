import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  MapPin,
  User,
  Users,
  XCircle,
} from "lucide-react";

const EventDraftPreview = ({
  event = {},
  onBackToEditing,
  onPublish,
  isPublishing = false,
}) => {
  const {
    title = "Untitled Event",
    description = "No event description provided.",
    startDate,
    endDate,
    startTime,
    endTime,
    venue,
    location,
    organizer,
    registrationDeadline,
    registrationLimit,
    registrationUrl,
    rules = [],
    requirements = [],
    banner,
    image,
    images = [],
  } = event;

  const eventImage =
    banner ||
    image ||
    images?.[0];

  const organizerName =
    typeof organizer === "object"
      ? organizer.name ||
        organizer.fullName ||
        "Event Organizer"
      : organizer ||
        "Event Organizer";

  const organizerEmail =
    typeof organizer === "object"
      ? organizer.email
      : null;

  const formatDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
      }
    ).format(date);
  };

  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value) {
      return [value];
    }

    return [];
  };

  const formattedStartDate =
    formatDate(startDate);

  const formattedEndDate =
    formatDate(endDate);

  const hasDate =
    formattedStartDate ||
    formattedEndDate;

  const hasTime =
    startTime || endTime;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Preview toolbar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <FileText
                size={18}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Event Preview
              </p>

              <p className="text-[11px] text-slate-400">
                This is how participants will see
                your event.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {onBackToEditing && (
              <button
                type="button"
                onClick={onBackToEditing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={14} />
                Back to Editing
              </button>
            )}

            {onPublish && (
              <button
                type="button"
                onClick={onPublish}
                disabled={isPublishing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={14} />

                {isPublishing
                  ? "Publishing..."
                  : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participant-facing preview */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Banner */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {eventImage ? (
            <img
              src={eventImage}
              alt={title}
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100 sm:h-80 dark:from-indigo-950 dark:to-slate-900">
              <div className="text-center">
                <ImageIcon
                  size={40}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-xs text-slate-400">
                  No event banner uploaded
                </p>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                Event Preview
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                Draft
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {/* Event information */}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <PreviewSection
              icon={CalendarDays}
              title="Event Schedule"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={CalendarDays}
                  label="Date"
                  value={
                    hasDate
                      ? formattedStartDate ||
                        formattedEndDate
                      : "Date not provided"
                  }
                />

                {formattedEndDate &&
                  formattedEndDate !==
                    formattedStartDate && (
                    <InfoItem
                      icon={CalendarDays}
                      label="End Date"
                      value={
                        formattedEndDate
                      }
                    />
                  )}

                <InfoItem
                  icon={Clock}
                  label="Time"
                  value={
                    hasTime
                      ? `${startTime || ""}${
                          startTime &&
                          endTime
                            ? " – "
                            : ""
                        }${
                          endTime || ""
                        }`
                      : "Time not provided"
                  }
                />
              </div>
            </PreviewSection>

            {/* Venue */}
            <PreviewSection
              icon={MapPin}
              title="Venue"
            >
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {venue ||
                  location ||
                  "Venue not provided"}
              </p>
            </PreviewSection>

            {/* Registration */}
            <PreviewSection
              icon={Users}
              title="Registration Information"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={Clock}
                  label="Registration Deadline"
                  value={
                    formatDate(
                      registrationDeadline
                    ) ||
                    "Not specified"
                  }
                />

                <InfoItem
                  icon={Users}
                  label="Participant Limit"
                  value={
                    registrationLimit
                      ? `${registrationLimit} participants`
                      : "No limit specified"
                  }
                />
              </div>

              {registrationUrl && (
                <a
                  href={
                    registrationUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Registration Link
                </a>
              )}
            </PreviewSection>

            {/* Rules */}
            <PreviewSection
              icon={FileText}
              title="Rules"
            >
              <ListContent
                items={getArray(
                  rules
                )}
                emptyText="No event rules provided."
              />
            </PreviewSection>

            {/* Requirements */}
            <PreviewSection
              icon={CheckCircle2}
              title="Requirements"
            >
              <ListContent
                items={getArray(
                  requirements
                )}
                emptyText="No specific requirements provided."
              />
            </PreviewSection>
          </div>

          {/* Organizer */}
          <aside className="space-y-5">
            <PreviewSection
              icon={User}
              title="Organizer"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <User
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {organizerName}
                  </p>

                  {organizerEmail && (
                    <p className="mt-1 break-all text-xs text-slate-400">
                      {organizerEmail}
                    </p>
                  )}
                </div>
              </div>
            </PreviewSection>

            {/* Preview status */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
              <div className="flex items-start gap-3">
                <XCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                />

                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Preview Only
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-amber-700 dark:text-amber-400">
                    This event is still a draft. Participants
                    cannot register until you publish it.
                  </p>
                </div>
              </div>
            </div>

            {/* Publish action */}
            {onPublish && (
              <button
                type="button"
                onClick={onPublish}
                disabled={isPublishing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={15} />
                {isPublishing
                  ? "Publishing..."
                  : "Publish Event"}
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

/**
 * Reusable preview section.
 */
const PreviewSection = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <Icon
              size={15}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
        )}

        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
};

/**
 * Information item.
 */
const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={12} />
        {label}
      </div>

      <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/**
 * Rules / requirements list.
 */
const ListContent = ({
  items,
  emptyText,
}) => {
  if (!items.length) {
    return (
      <p className="text-xs text-slate-400">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map(
        (item, index) => {
          const text =
            typeof item ===
            "object"
              ? item.label ||
                item.title ||
                item.name ||
                item.description ||
                JSON.stringify(
                  item
                )
              : item;

          return (
            <li
              key={index}
              className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400"
            >
              <CheckCircle2
                size={14}
                className="mt-0.5 shrink-0 text-green-500"
              />

              <span>
                {text}
              </span>
            </li>
          );
        }
      )}
    </ul>
  );
};

export default EventDraftPreview;