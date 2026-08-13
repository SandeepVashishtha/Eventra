import React, { useState } from "react";

export type CoOrganizerPermission =
  | "manage_event"
  | "manage_registrations"
  | "manage_resources"
  | "view_analytics";

export interface CoOrganizer {
  id: string;
  name: string;
  email?: string;
  status: "pending" | "accepted" | "declined";
  permissions: CoOrganizerPermission[];
}

interface CoOrganizerManagerProps {
  eventId: string;
  primaryOrganizerId: string;
  currentUserId: string;
  coOrganizers?: CoOrganizer[];

  onInvite?: (
    email: string,
    permissions: CoOrganizerPermission[],
    eventId: string
  ) => void | Promise<void>;

  onRemove?: (
    organizer: CoOrganizer,
    eventId: string
  ) => void | Promise<void>;

  onUpdatePermissions?: (
    organizer: CoOrganizer,
    permissions: CoOrganizerPermission[],
    eventId: string
  ) => void | Promise<void>;

  onInvitationResponse?: (
    organizer: CoOrganizer,
    accepted: boolean,
    eventId: string
  ) => void | Promise<void>;
}

const PERMISSIONS: {
  value: CoOrganizerPermission;
  label: string;
  description: string;
}[] = [
  {
    value: "manage_event",
    label: "Manage Event",
    description:
      "Edit event details and settings.",
  },
  {
    value: "manage_registrations",
    label: "Manage Registrations",
    description:
      "View and manage participant registrations.",
  },
  {
    value: "manage_resources",
    label: "Manage Resources",
    description:
      "Add, replace, or remove event resources.",
  },
  {
    value: "view_analytics",
    label: "View Analytics",
    description:
      "View available event statistics.",
  },
];

const CoOrganizerManager: React.FC<
  CoOrganizerManagerProps
> = ({
  eventId,
  primaryOrganizerId,
  currentUserId,
  coOrganizers = [],
  onInvite,
  onRemove,
  onUpdatePermissions,
  onInvitationResponse,
}) => {
  const [
    organizers,
    setOrganizers,
  ] = useState<CoOrganizer[]>(
    coOrganizers
  );

  const [showInvite, setShowInvite] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = useState<CoOrganizerPermission[]>(
    ["view_analytics"]
  );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const isPrimaryOrganizer =
    currentUserId ===
    primaryOrganizerId;

  const togglePermission = (
    permission: CoOrganizerPermission
  ) => {
    setSelectedPermissions(
      (previous) =>
        previous.includes(permission)
          ? previous.filter(
              (item) =>
                item !== permission
            )
          : [
              ...previous,
              permission,
            ]
    );
  };

  const handleInvite = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter the co-organizer's email address."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      selectedPermissions.length ===
      0
    ) {
      setError(
        "Select at least one permission."
      );
      return;
    }

    if (
      organizers.some(
        (organizer) =>
          organizer.email?.toLowerCase() ===
          normalizedEmail &&
          organizer.status !==
            "declined"
      )
    ) {
      setError(
        "This user has already been invited."
      );
      return;
    }

    setSubmitting(true);

    try {
      await onInvite?.(
        normalizedEmail,
        selectedPermissions,
        eventId
      );

      /*
       * This local fallback is only for UI
       * demonstration when no API callback
       * is connected.
       */
      if (!onInvite) {
        const newOrganizer: CoOrganizer =
          {
            id: `pending-${Date.now()}`,
            name: normalizedEmail,
            email:
              normalizedEmail,
            status: "pending",
            permissions:
              selectedPermissions,
          };

        setOrganizers(
          (previous) => [
            ...previous,
            newOrganizer,
          ]
        );
      }

      setEmail("");
      setSelectedPermissions([
        "view_analytics",
      ]);
      setShowInvite(false);
      setSuccess(
        "Co-organizer invitation sent successfully."
      );
    } catch {
      setError(
        "The invitation could not be sent. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (
    organizer: CoOrganizer
  ) => {
    if (!isPrimaryOrganizer) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${organizer.name} as a co-organizer?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await onRemove?.(
        organizer,
        eventId
      );

      if (!onRemove) {
        setOrganizers(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                organizer.id
            )
        );
      }

      setSuccess(
        `${organizer.name} was removed from the event.`
      );
    } catch {
      setError(
        "The co-organizer could not be removed."
      );
    }
  };

  const handlePermissionChange = async (
    organizer: CoOrganizer,
    permission: CoOrganizerPermission
  ) => {
    if (!isPrimaryOrganizer) {
      return;
    }

    const updatedPermissions =
      organizer.permissions.includes(
        permission
      )
        ? organizer.permissions.filter(
            (item) =>
              item !== permission
          )
        : [
            ...organizer.permissions,
            permission,
          ];

    if (
      updatedPermissions.length ===
      0
    ) {
      setError(
        "A co-organizer must have at least one permission."
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      await onUpdatePermissions?.(
        organizer,
        updatedPermissions,
        eventId
      );

      if (!onUpdatePermissions) {
        setOrganizers(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                organizer.id
                  ? {
                      ...item,
                      permissions:
                        updatedPermissions,
                    }
                  : item
            )
        );
      }

      setSuccess(
        `Permissions updated for ${organizer.name}.`
      );
    } catch {
      setError(
        "Permissions could not be updated."
      );
    }
  };

  const handleInvitationResponse = async (
    organizer: CoOrganizer,
    accepted: boolean
  ) => {
    setError("");
    setSuccess("");

    try {
      await onInvitationResponse?.(
        organizer,
        accepted,
        eventId
      );

      if (!onInvitationResponse) {
        setOrganizers(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                organizer.id
                  ? {
                      ...item,
                      status:
                        accepted
                          ? "accepted"
                          : "declined",
                    }
                  : item
            )
        );
      }

      setSuccess(
        accepted
          ? "Co-organizer invitation accepted."
          : "Co-organizer invitation declined."
      );
    } catch {
      setError(
        "The invitation response could not be updated."
      );
    }
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              👥
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Event Team
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Co-Organizers
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Collaborate with other users while
                keeping event ownership under the
                primary organizer.
              </p>
            </div>
          </div>

          {isPrimaryOrganizer && (
            <button
              type="button"
              onClick={() => {
                setShowInvite(
                  (previous) =>
                    !previous
                );
                setError("");
                setSuccess("");
              }}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Invite Co-Organizer
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Permission notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <span className="text-lg">
            🔐
          </span>

          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Controlled permissions
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-400">
              Co-organizers can only access features
              explicitly assigned to them. They cannot
              change ownership or primary organizer
              information.
            </p>
          </div>
        </div>

        {/* Invite form */}
        {showInvite &&
          isPrimaryOrganizer && (
            <form
              onSubmit={handleInvite}
              className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Invite a Co-Organizer
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the user's account email and
                select the permissions they should receive.
              </p>

              {/* Email */}
              <div className="mt-5">
                <label
                  htmlFor="co-organizer-email"
                  className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Email address
                </label>

                <input
                  id="co-organizer-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );
                    setError("");
                  }}
                  placeholder="organizer@example.com"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-950"
                />
              </div>

              {/* Permissions */}
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Permissions
                </legend>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {PERMISSIONS.map(
                    (permission) => {
                      const checked =
                        selectedPermissions.includes(
                          permission.value
                        );

                      return (
                        <label
                          key={
                            permission.value
                          }
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            checked
                              ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                togglePermission(
                                  permission.value
                                )
                              }
                              className="mt-1 h-4 w-4 accent-blue-600"
                            />

                            <span>
                              <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {
                                  permission.label
                                }
                              </span>

                              <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                                {
                                  permission.description
                                }
                              </span>
                            </span>
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>
              </fieldset>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowInvite(
                      false
                    )
                  }
                  disabled={submitting}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Sending..."
                    : "Send Invitation"}
                </button>
              </div>
            </form>
          )}

        {/* Messages */}
        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            ✓ {success}
          </div>
        )}

        {/* Empty state */}
        {organizers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl dark:bg-gray-700">
              👥
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
              No co-organizers yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {isPrimaryOrganizer
                ? "Invite trusted collaborators to help manage this event."
                : "The primary organizer has not added any co-organizers yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Event Team
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {organizers.length}{" "}
                  {organizers.length === 1
                    ? "co-organizer"
                    : "co-organizers"}
                </p>
              </div>
            </div>

            {organizers.map(
              (organizer) => (
                <article
                  key={organizer.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* User info */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {organizer.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {organizer.name}
                        </h4>

                        {organizer.email && (
                          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {organizer.email}
                          </p>
                        )}

                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            organizer.status ===
                            "accepted"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : organizer.status ===
                                "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {organizer.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPrimaryOrganizer &&
                      organizer.status !==
                        "declined" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                organizer
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Invitation actions */}
                  {organizer.status ===
                    "pending" &&
                    organizer.id ===
                      currentUserId && (
                      <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/40">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                          You have been invited as a
                          co-organizer.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleInvitationResponse(
                                organizer,
                                true
                              )
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleInvitationResponse(
                                organizer,
                                false
                              )
                            }
                            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Permissions */}
                  {organizer.status ===
                    "accepted" && (
                    <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          Permissions
                        </h5>

                        {!isPrimaryOrganizer && (
                          <span className="text-[11px] text-gray-400">
                            View only
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {PERMISSIONS.map(
                          (permission) => {
                            const enabled =
                              organizer.permissions.includes(
                                permission.value
                              );

                            return (
                              <label
                                key={
                                  permission.value
                                }
                                className={`flex items-center gap-3 rounded-xl border p-3 ${
                                  enabled
                                    ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    enabled
                                  }
                                  disabled={
                                    !isPrimaryOrganizer
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      organizer,
                                      permission.value
                                    )
                                  }
                                  className="h-4 w-4 accent-blue-600"
                                />

                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {
                                    permission.label
                                  }
                                </span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        )}
      </div>

      {/* Security footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🛡️
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ownership remains protected
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Co-organizers cannot change the primary
              organizer, transfer ownership, or modify
              ownership-related information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoOrganizerManager;