import {
  Check,
  ChevronDown,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  CO_ORGANIZER_PERMISSION_CONFIG,
  CO_ORGANIZER_STATUSES,
  addCoOrganizer,
  createCoOrganizerActivity,
  createCoOrganizerInvitation,
  getActiveCoOrganizerCount,
  getActiveCoOrganizers,
  getCoOrganizerSummary,
  normalizePermissions,
  removeCoOrganizer,
  updateCoOrganizerPermissions,
  validateCoOrganizerInvitation,
} from "../../utils/eventCoOrganizerUtils";

import CoOrganizerCard from "./CoOrganizerCard";

const EventCoOrganizers = ({
  event = {},
  user = {},
  coOrganizers = [],
  activities = [],
  onChange,
  onActivitiesChange,
  className = "",
}) => {
  const [isInviteOpen, setIsInviteOpen] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id;

  const organizerId =
    user.id ??
    user.userId ??
    user.user_id;

  const summary = useMemo(
    () =>
      getCoOrganizerSummary(
        coOrganizers
      ),
    [coOrganizers]
  );

  const activeCoOrganizers =
    useMemo(
      () =>
        getActiveCoOrganizers(
          coOrganizers
        ),
      [coOrganizers]
    );

  const togglePermission = (
    permission
  ) => {
    setSelectedPermissions(
      (current) => {
        if (
          current.includes(
            permission
          )
        ) {
          return current.filter(
            (item) =>
              item !== permission
          );
        }

        return [
          ...current,
          permission,
        ];
      }
    );
  };

  const resetInviteForm = () => {
    setEmail("");
    setName("");
    setSelectedPermissions([]);
    setMessage("");
    setError("");
  };

  const handleInvite = async (
    eventObject
  ) => {
    eventObject.preventDefault();

    if (isSaving) {
      return;
    }

    setError("");

    const validation =
      validateCoOrganizerInvitation({
        eventId,
        organizerId,
        email,
        permissions:
          selectedPermissions,
      });

    if (!validation.valid) {
      setError(
        validation.errors.join(" ")
      );
      return;
    }

    setIsSaving(true);

    try {
      const invitation =
        createCoOrganizerInvitation({
          eventId,
          organizerId,
          email,
          name,
          permissions:
            selectedPermissions,
          message,
        });

      const updatedCoOrganizers =
        addCoOrganizer(
          coOrganizers,
          invitation
        );

      onChange?.(
        updatedCoOrganizers
      );

      const activity =
        createCoOrganizerActivity({
          eventId,
          actorId:
            organizerId,
          coOrganizerId:
            invitation.id,
          action:
            "co-organizer-invited",
          details: `Invited ${email} as a co-organizer.`,
        });

      onActivitiesChange?.([
        ...activities,
        activity,
      ]);

      resetInviteForm();
      setIsInviteOpen(false);
    } catch (inviteError) {
      setError(
        inviteError?.message ||
          "Unable to create the co-organizer invitation."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionsChange = (
    coOrganizer,
    permissions
  ) => {
    const normalized =
      normalizePermissions(
        permissions
      );

    const updated =
      updateCoOrganizerPermissions(
        coOrganizers,
        coOrganizer.id,
        normalized
      );

    onChange?.(updated);

    const activity =
      createCoOrganizerActivity({
        eventId,
        actorId:
          organizerId,
        coOrganizerId:
          coOrganizer.id,
        action:
          "permissions-updated",
        details:
          "Co-organizer permissions were updated.",
      });

    onActivitiesChange?.([
      ...activities,
      activity,
    ]);
  };

  const handleRemove = (
    coOrganizer
  ) => {
    const confirmed =
      window.confirm(
        `Remove ${
          coOrganizer.name ||
          coOrganizer.email ||
          "this co-organizer"
        } from the event?`
      );

    if (!confirmed) {
      return;
    }

    const updated =
      removeCoOrganizer(
        coOrganizers,
        coOrganizer.id
      );

    onChange?.(updated);

    const activity =
      createCoOrganizerActivity({
        eventId,
        actorId:
          organizerId,
        coOrganizerId:
          coOrganizer.id,
        action:
          "co-organizer-removed",
        details:
          "Co-organizer was removed from the event.",
      });

    onActivitiesChange?.([
      ...activities,
      activity,
    ]);
  };

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Users
                size={21}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Co-Organizers
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {getActiveCoOrganizerCount(
                    coOrganizers
                  )}{" "}
                  active
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Invite trusted collaborators and assign
                permissions for managing this event.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setIsInviteOpen(
                (current) => !current
              );
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {isInviteOpen ? (
              <X size={16} />
            ) : (
              <Plus size={16} />
            )}

            {isInviteOpen
              ? "Cancel"
              : "Invite Co-Organizer"}
          </button>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryItem
            label="Total"
            value={summary.total}
          />

          <SummaryItem
            label="Active"
            value={summary.active}
          />

          <SummaryItem
            label="Pending"
            value={summary.pending}
          />

          <SummaryItem
            label="Removed"
            value={summary.removed}
          />
        </div>
      </div>

      {/* Invitation form */}
      {isInviteOpen && (
        <form
          onSubmit={handleInvite}
          className="border-b border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Invite a Co-Organizer
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The invitation will start with pending
              status until the participant accepts it.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email */}
            <div>
              <label
                htmlFor="co-organizer-email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Email address *
              </label>

              <div className="relative mt-2">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="co-organizer-email"
                  type="email"
                  value={email}
                  onChange={(eventObject) =>
                    setEmail(
                      eventObject.target.value
                    )
                  }
                  placeholder="organizer@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="co-organizer-name"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Name
              </label>

              <input
                id="co-organizer-name"
                type="text"
                value={name}
                onChange={(eventObject) =>
                  setName(
                    eventObject.target.value
                  )
                }
                placeholder="Co-organizer name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                className="text-indigo-500"
              />

              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Assign permissions
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {CO_ORGANIZER_PERMISSION_CONFIG.map(
                (permission) => {
                  const selected =
                    selectedPermissions.includes(
                      permission.id
                    );

                  return (
                    <button
                      key={permission.id}
                      type="button"
                      onClick={() =>
                        togglePermission(
                          permission.id
                        )
                      }
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                          : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {selected && (
                          <Check size={13} />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-800 dark:text-white">
                          {permission.label}
                        </span>

                        <span className="mt-1 block text-[11px] leading-5 text-slate-400">
                          {permission.description}
                        </span>
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mt-5">
            <label
              htmlFor="co-organizer-message"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Invitation message
            </label>

            <textarea
              id="co-organizer-message"
              value={message}
              onChange={(eventObject) =>
                setMessage(
                  eventObject.target.value
                )
              }
              rows={3}
              maxLength={500}
              placeholder="Add a short message for the co-organizer..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
            />
          </div>

          {/* Form actions */}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                resetInviteForm();
                setIsInviteOpen(false);
              }}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                !email.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Mail size={16} />

              {isSaving
                ? "Sending..."
                : "Send Invitation"}
            </button>
          </div>
        </form>
      )}

      {/* Co-organizer list */}
      <div className="p-5">
        {coOrganizers.length > 0 ? (
          <div className="space-y-3">
            {coOrganizers.map(
              (coOrganizer) => (
                <CoOrganizerCard
                  key={
                    coOrganizer.id
                  }
                  coOrganizer={
                    coOrganizer
                  }
                  onPermissionsChange={
                    handlePermissionsChange
                  }
                  onRemove={
                    handleRemove
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptyCoOrganizerState
            onInvite={() => {
              setError("");
              setIsInviteOpen(true);
            }}
          />
        )}
      </div>
    </section>
  );
};

const SummaryItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

const EmptyCoOrganizerState = ({
  onInvite,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Users
          size={21}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        No co-organizers yet
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        Invite collaborators to help manage participants,
        announcements, event details, and feedback.
      </p>

      <button
        type="button"
        onClick={onInvite}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
      >
        <Plus size={14} />
        Invite Co-Organizer
      </button>
    </div>
  );
};

export default EventCoOrganizers;