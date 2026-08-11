import {
  Bell,
  Calendar,
  Check,
  Clock,
  Edit3,
  Eye,
  Megaphone,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "announcement-1",
    title: "Registration Deadline Reminder",
    message:
      "Registration closes soon. Please complete your registration before the deadline.",
    scheduledAt: "2026-08-15T10:00",
    audience: "All Registered Participants",
    status: "scheduled",
    createdAt: "2026-08-10T09:30:00",
  },
  {
    id: "announcement-2",
    title: "Event Venue Update",
    message:
      "The event venue has been updated. Please check the event page for the latest details.",
    scheduledAt: "2026-08-12T15:00",
    audience: "All Participants",
    status: "scheduled",
    createdAt: "2026-08-09T12:00:00",
  },
];

const AUDIENCES = [
  "All Participants",
  "All Registered Participants",
  "Attendees",
  "Team Leaders",
  "Waitlisted Participants",
];

const EventAnnouncementScheduling = ({
  initialAnnouncements = DEFAULT_ANNOUNCEMENTS,
  eventName = "Event",
  onSchedule,
  onUpdate,
  onCancel,
  onPublish,
  onDelete,
  onNotify,
  className = "",
}) => {
  const [announcements, setAnnouncements] =
    useState(initialAnnouncements);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [previewAnnouncement, setPreviewAnnouncement] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [audience, setAudience] =
    useState("All Participants");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [formError, setFormError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [publishingId, setPublishingId] =
    useState(null);

  const filteredAnnouncements = useMemo(() => {
    if (statusFilter === "all") {
      return announcements;
    }

    return announcements.filter(
      (announcement) =>
        announcement.status ===
        statusFilter
    );
  }, [
    announcements,
    statusFilter,
  ]);

  const scheduledCount = announcements.filter(
    (announcement) =>
      announcement.status === "scheduled"
  ).length;

  const publishedCount = announcements.filter(
    (announcement) =>
      announcement.status === "published"
  ).length;

  const draftCount = announcements.filter(
    (announcement) =>
      announcement.status === "draft"
  ).length;

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setScheduledAt("");
    setAudience(
      "All Participants"
    );
    setEditingId(null);
    setFormError("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    setSuccessMessage("");
  };

  const openEditForm = (
    announcement
  ) => {
    setEditingId(
      announcement.id
    );

    setTitle(
      announcement.title
    );

    setMessage(
      announcement.message
    );

    setScheduledAt(
      announcement.scheduledAt
    );

    setAudience(
      announcement.audience
    );

    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const cleanTitle =
      title.trim();

    const cleanMessage =
      message.trim();

    if (!cleanTitle) {
      setFormError(
        "Please enter an announcement title."
      );
      return;
    }

    if (!cleanMessage) {
      setFormError(
        "Please enter an announcement message."
      );
      return;
    }

    if (!scheduledAt) {
      setFormError(
        "Please select a publication date and time."
      );
      return;
    }

    const selectedTime =
      new Date(
        scheduledAt
      ).getTime();

    if (
      Number.isNaN(
        selectedTime
      )
    ) {
      setFormError(
        "Please select a valid date and time."
      );
      return;
    }

    if (
      selectedTime <=
      Date.now()
    ) {
      setFormError(
        "Scheduled publication must be in the future."
      );
      return;
    }

    if (editingId) {
      const existing =
        announcements.find(
          (item) =>
            item.id ===
            editingId
        );

      const updated = {
        ...existing,
        title: cleanTitle,
        message: cleanMessage,
        scheduledAt,
        audience,
        status:
          existing?.status ===
          "published"
            ? "published"
            : "scheduled",
        updatedAt:
          new Date().toISOString(),
      };

      setAnnouncements(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              editingId
                ? updated
                : item
          )
      );

      onUpdate?.(updated);

      setSuccessMessage(
        "Scheduled announcement updated successfully."
      );
    } else {
      const announcement = {
        id: createId(),
        title: cleanTitle,
        message: cleanMessage,
        scheduledAt,
        audience,
        status: "scheduled",
        createdAt:
          new Date().toISOString(),
      };

      setAnnouncements(
        (current) => [
          announcement,
          ...current,
        ]
      );

      onSchedule?.(
        announcement
      );

      onNotify?.(
        announcement
      );

      setSuccessMessage(
        "Announcement scheduled successfully."
      );
    }

    setShowForm(false);
    resetForm();
  };

  const handleCancelSchedule = (
    announcement
  ) => {
    const confirmed =
      window.confirm(
        `Cancel "${announcement.title}"?`
      );

    if (!confirmed) {
      return;
    }

    const updated = {
      ...announcement,
      status: "cancelled",
      cancelledAt:
        new Date().toISOString(),
    };

    setAnnouncements(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            announcement.id
              ? updated
              : item
        )
    );

    onCancel?.(updated);

    setSuccessMessage(
      "Scheduled announcement cancelled."
    );
  };

  const handlePublishNow = async (
    announcement
  ) => {
    const confirmed =
      window.confirm(
        `Publish "${announcement.title}" now?`
      );

    if (!confirmed) {
      return;
    }

    setPublishingId(
      announcement.id
    );

    const updated = {
      ...announcement,
      status: "published",
      publishedAt:
        new Date().toISOString(),
    };

    setAnnouncements(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            announcement.id
              ? updated
              : item
        )
    );

    onPublish?.(updated);

    onNotify?.(updated);

    setPublishingId(null);

    setSuccessMessage(
      "Announcement published successfully."
    );
  };

  const handleDelete = (
    announcement
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${announcement.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setAnnouncements(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            announcement.id
        )
    );

    onDelete?.(
      announcement
    );

    setSuccessMessage(
      "Announcement deleted."
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Megaphone
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Communication
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Announcement Scheduling
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Prepare announcements in advance and automatically
              deliver them to relevant participants.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
        >
          <Megaphone size={14} />
          Create Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Clock size={17} />}
          label="Scheduled"
          value={scheduledCount}
          description="Waiting for publication"
        />

        <StatCard
          icon={<Check size={17} />}
          label="Published"
          value={publishedCount}
          description="Already delivered"
        />

        <StatCard
          icon={<Edit3 size={17} />}
          label="Drafts"
          value={draftCount}
          description="Announcements in draft"
        />
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          <Check size={13} />
          {successMessage}

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="ml-auto"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Create/Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Megaphone size={16} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {editingId
                    ? "Edit Scheduled Announcement"
                    : "Create Scheduled Announcement"}
                </h3>

                <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                  Schedule an announcement for future delivery.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-500 dark:hover:bg-slate-900"
            >
              <X size={15} />
            </button>
          </div>

          {formError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Announcement Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Registration Deadline Reminder"
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Announcement Message
              </label>

              <textarea
                rows={5}
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Write the announcement that participants will receive..."
                className="w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs leading-5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  <Calendar size={11} />
                  Publication Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) =>
                    setScheduledAt(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  <Users size={11} />
                  Target Audience
                </label>

                <select
                  value={audience}
                  onChange={(event) =>
                    setAudience(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  {AUDIENCES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Preview inside form */}
          {(title || message) && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Eye
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400"
                />

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Live Preview
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {title ||
                    "Announcement title"}
                </h4>

                <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                  {message ||
                    "Your announcement message will appear here."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    {audience}
                  </span>

                  {scheduledAt && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {formatDateTime(
                        scheduledAt
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Clock size={13} />

              {editingId
                ? "Update Schedule"
                : "Schedule Announcement"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterButton
          active={
            statusFilter === "all"
          }
          onClick={() =>
            setStatusFilter("all")
          }
        >
          All
        </FilterButton>

        <FilterButton
          active={
            statusFilter ===
            "scheduled"
          }
          onClick={() =>
            setStatusFilter(
              "scheduled"
            )
          }
        >
          Scheduled
        </FilterButton>

        <FilterButton
          active={
            statusFilter ===
            "published"
          }
          onClick={() =>
            setStatusFilter(
              "published"
            )
          }
        >
          Published
        </FilterButton>

        <FilterButton
          active={
            statusFilter ===
            "cancelled"
          }
          onClick={() =>
            setStatusFilter(
              "cancelled"
            )
          }
        >
          Cancelled
        </FilterButton>
      </div>

      {/* Announcement list */}
      <div className="mt-4 space-y-3">
        {filteredAnnouncements.length ===
        0 ? (
          <EmptyState
            onCreate={openCreateForm}
          />
        ) : (
          filteredAnnouncements.map(
            (announcement) => (
              <AnnouncementCard
                key={
                  announcement.id
                }
                announcement={
                  announcement
                }
                onEdit={() =>
                  openEditForm(
                    announcement
                  )
                }
                onPreview={() =>
                  setPreviewAnnouncement(
                    announcement
                  )
                }
                onCancel={() =>
                  handleCancelSchedule(
                    announcement
                  )
                }
                onPublish={() =>
                  handlePublishNow(
                    announcement
                  )
                }
                onDelete={() =>
                  handleDelete(
                    announcement
                  )
                }
                publishing={
                  publishingId ===
                  announcement.id
                }
              />
            )
          )
        )}
      </div>

      {/* Preview modal */}
      {previewAnnouncement && (
        <PreviewModal
          announcement={
            previewAnnouncement
          }
          eventName={eventName}
          onClose={() =>
            setPreviewAnnouncement(
              null
            )
          }
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Announcement card
----------------------------------- */

const AnnouncementCard = ({
  announcement,
  onEdit,
  onPreview,
  onCancel,
  onPublish,
  onDelete,
  publishing,
}) => {
  const isScheduled =
    announcement.status ===
    "scheduled";

  const isPublished =
    announcement.status ===
    "published";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isPublished
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : isScheduled
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {isPublished ? (
            <Check size={19} />
          ) : (
            <Bell size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {announcement.title}
            </h3>

            <StatusBadge
              status={
                announcement.status
              }
            />
          </div>

          <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
            {announcement.message}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <InfoBadge
              icon={
                <Calendar size={10} />
              }
              text={formatDateTime(
                announcement.scheduledAt
              )}
            />

            <InfoBadge
              icon={
                <Users size={10} />
              }
              text={
                announcement.audience
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ActionButton
            onClick={onPreview}
            icon={<Eye size={12} />}
          >
            Preview
          </ActionButton>

          {isScheduled && (
            <>
              <ActionButton
                onClick={onEdit}
                icon={<Edit3 size={12} />}
              >
                Edit
              </ActionButton>

              <ActionButton
                onClick={onPublish}
                disabled={publishing}
                primary
                icon={
                  <Send size={12} />
                }
              >
                {publishing
                  ? "Publishing..."
                  : "Publish Now"}
              </ActionButton>

              <ActionButton
                onClick={onCancel}
                danger
                icon={
                  <X size={12} />
                }
              >
                Cancel
              </ActionButton>
            </>
          )}

          {isPublished && (
            <ActionButton
              onClick={onDelete}
              danger
              icon={
                <Trash2 size={12} />
              }
            >
              Delete
            </ActionButton>
          )}

          {announcement.status ===
            "cancelled" && (
            <ActionButton
              onClick={onDelete}
              danger
              icon={
                <Trash2 size={12} />
              }
            >
              Delete
            </ActionButton>
          )}
        </div>
      </div>
    </article>
  );
};

/* ----------------------------------
   Preview modal
----------------------------------- */

const PreviewModal = ({
  announcement,
  eventName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Eye size={16} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Participant Preview
              </p>

              <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                Announcement Preview
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Megaphone size={15} />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  {eventName}
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Event Announcement
                </p>
              </div>
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              {announcement.title}
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-600 dark:text-slate-300">
              {announcement.message}
            </p>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                <InfoBadge
                  icon={
                    <Calendar size={10} />
                  }
                  text={formatDateTime(
                    announcement.scheduledAt
                  )}
                />

                <InfoBadge
                  icon={
                    <Users size={10} />
                  }
                  text={
                    announcement.audience
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <p className="text-[9px] leading-4 text-indigo-700 dark:text-indigo-300">
              This is how the announcement content will appear
              to the selected audience.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Stat card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Filter button
----------------------------------- */

const FilterButton = ({
  active,
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-[9px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
};

/* ----------------------------------
   Action button
----------------------------------- */

const ActionButton = ({
  children,
  icon,
  onClick,
  primary = false,
  danger = false,
  disabled = false,
}) => {
  let classes =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[8px] font-bold disabled:cursor-not-allowed disabled:opacity-50 ";

  if (primary) {
    classes +=
      "bg-indigo-600 text-white hover:bg-indigo-700 ";
  } else if (danger) {
    classes +=
      "border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 ";
  } else {
    classes +=
      "border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon}
      {children}
    </button>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config = {
    scheduled:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",

    published:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",

    cancelled:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",

    draft:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[7px] font-bold uppercase tracking-wide ${
        config[status] ||
        config.draft
      }`}
    >
      {status}
    </span>
  );
};

/* ----------------------------------
   Info badge
----------------------------------- */

const InfoBadge = ({
  icon,
  text,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[8px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {icon}
      {text}
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  onCreate,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Megaphone size={19} />
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No announcements found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
        Create and schedule an announcement to communicate with
        event participants.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
      >
        Create Announcement
      </button>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `announcement-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const formatDateTime = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventAnnouncementScheduling;