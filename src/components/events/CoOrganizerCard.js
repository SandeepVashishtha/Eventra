import {
  Check,
  ChevronDown,
  Clock3,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  CO_ORGANIZER_PERMISSION_CONFIG,
  CO_ORGANIZER_STATUSES,
  getCoOrganizerPermissionLabels,
  getCoOrganizerStatusLabel,
  normalizePermissions,
} from "../../utils/eventCoOrganizerUtils";

const CoOrganizerCard = ({
  coOrganizer = {},
  onPermissionsChange,
  onRemove,
}) => {
  const [isPermissionsOpen, setIsPermissionsOpen] =
    useState(false);

  const permissions = normalizePermissions(
    coOrganizer.permissions
  );

  const status =
    coOrganizer.status ||
    CO_ORGANIZER_STATUSES.PENDING;

  const statusLabel =
    getCoOrganizerStatusLabel(status);

  const permissionLabels =
    getCoOrganizerPermissionLabels(
      permissions
    );

  const displayName =
    coOrganizer.name ||
    coOrganizer.email ||
    "Co-Organizer";

  const initials = getInitials(
    coOrganizer.name ||
      coOrganizer.email ||
      "CO"
  );

  const handlePermissionToggle = (
    permissionId
  ) => {
    const nextPermissions =
      permissions.includes(permissionId)
        ? permissions.filter(
            (permission) =>
              permission !== permissionId
          )
        : [
            ...permissions,
            permissionId,
          ];

    onPermissionsChange?.(
      coOrganizer,
      nextPermissions
    );
  };

  const isActive =
    status ===
    CO_ORGANIZER_STATUSES.ACCEPTED;

  const isPending =
    status ===
    CO_ORGANIZER_STATUSES.PENDING;

  const isRemoved =
    status ===
    CO_ORGANIZER_STATUSES.REMOVED;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            isActive
              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {initials}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
              {displayName}
            </h3>

            <StatusBadge status={status} />
          </div>

          {coOrganizer.email && (
            <a
              href={`mailto:${coOrganizer.email}`}
              className="mt-1 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <Mail size={12} />
              {coOrganizer.email}
            </a>
          )}

          {/* Invitation information */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
            {coOrganizer.invitedAt && (
              <span className="inline-flex items-center gap-1">
                <Clock3 size={11} />
                Invited{" "}
                {formatDate(
                  coOrganizer.invitedAt
                )}
              </span>
            )}

            {coOrganizer.acceptedAt && (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check size={11} />
                Accepted{" "}
                {formatDate(
                  coOrganizer.acceptedAt
                )}
              </span>
            )}

            {coOrganizer.declinedAt && (
              <span className="inline-flex items-center gap-1 text-red-500">
                <X size={11} />
                Declined{" "}
                {formatDate(
                  coOrganizer.declinedAt
                )}
              </span>
            )}

            {coOrganizer.removedAt && (
              <span className="inline-flex items-center gap-1">
                <Trash2 size={11} />
                Removed{" "}
                {formatDate(
                  coOrganizer.removedAt
                )}
              </span>
            )}
          </div>

          {/* Permissions summary */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck
                  size={14}
                  className="text-indigo-500"
                />
                Permissions
              </div>

              {permissionLabels.length > 0 ? (
                permissionLabels.map(
                  (label) => (
                    <span
                      key={label}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {label}
                    </span>
                  )
                )
              ) : (
                <span className="text-[11px] text-slate-400">
                  No permissions assigned
                </span>
              )}
            </div>
          </div>

          {/* Permission editor */}
          {isPermissionsOpen && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Manage Permissions
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {CO_ORGANIZER_PERMISSION_CONFIG.map(
                  (permission) => {
                    const selected =
                      permissions.includes(
                        permission.id
                      );

                    return (
                      <button
                        key={
                          permission.id
                        }
                        type="button"
                        disabled={
                          isRemoved
                        }
                        onClick={() =>
                          handlePermissionToggle(
                            permission.id
                          )
                        }
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                            : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900"
                        } ${
                          isRemoved
                            ? "cursor-not-allowed opacity-50"
                            : ""
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
                            {
                              permission.label
                            }
                          </span>

                          <span className="mt-1 block text-[11px] leading-5 text-slate-400">
                            {
                              permission.description
                            }
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:flex-col">
          {!isRemoved && (
            <button
              type="button"
              onClick={() =>
                setIsPermissionsOpen(
                  (current) =>
                    !current
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              aria-expanded={
                isPermissionsOpen
              }
            >
              <ShieldCheck
                size={14}
              />

              <span className="hidden md:inline">
                Permissions
              </span>

              <ChevronDown
                size={13}
                className={`transition-transform ${
                  isPermissionsOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          )}

          {!isRemoved && (
            <button
              type="button"
              onClick={() =>
                onRemove?.(
                  coOrganizer
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              aria-label={`Remove ${displayName}`}
            >
              <Trash2 size={14} />

              <span className="hidden md:inline">
                Remove
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Pending notice */}
      {isPending && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/10 dark:text-amber-300">
          <Clock3
            size={14}
            className="mt-0.5 shrink-0"
          />

          <p>
            This invitation is waiting for the
            participant to accept.
          </p>
        </div>
      )}

      {/* Removed notice */}
      {isRemoved && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <X
            size={14}
            className="mt-0.5 shrink-0"
          />

          <p>
            This co-organizer has been removed and no
            longer has access to the event.
          </p>
        </div>
      )}
    </article>
  );
};

/**
 * Status badge.
 */
const StatusBadge = ({
  status,
}) => {
  const config = {
    [CO_ORGANIZER_STATUSES.PENDING]: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      icon: Clock3,
    },

    [CO_ORGANIZER_STATUSES.ACCEPTED]: {
      label: "Active",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      icon: Check,
    },

    [CO_ORGANIZER_STATUSES.DECLINED]: {
      label: "Declined",
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      icon: X,
    },

    [CO_ORGANIZER_STATUSES.REMOVED]: {
      label: "Removed",
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      icon: Trash2,
    },
  };

  const current =
    config[status] ||
    {
      label: "Unknown",
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      icon: UserRound,
    };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={10} />
      {current.label}
    </span>
  );
};

/**
 * Generate initials from a name/email.
 */
const getInitials = (
  value
) => {
  const text = String(
    value || ""
  ).trim();

  if (!text) {
    return "CO";
  }

  const parts = text
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return text
    .replace(
      /[^a-zA-Z0-9]/g,
      ""
    )
    .slice(0, 2)
    .toUpperCase();
};

/**
 * Format an ISO timestamp.
 */
const formatDate = (
  value
) => {
  const date = new Date(value);

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
    }
  ).format(date);
};

export default CoOrganizerCard;