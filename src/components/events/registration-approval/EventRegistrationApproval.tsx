import React, { useMemo, useState } from "react";

export type RegistrationApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface RegistrationApprovalItem {
  id: string;
  participantName: string;
  participantEmail: string;
  submittedAt: string;
  status: RegistrationApprovalStatus;
}

interface EventRegistrationApprovalProps {
  eventId: string;
  initialEnabled?: boolean;
  initialRegistrations?: RegistrationApprovalItem[];
  organizer?: boolean;
  onApprovalModeChange?: (
    eventId: string,
    enabled: boolean,
  ) => Promise<void> | void;
  onApprove?: (
    eventId: string,
    registrationId: string,
  ) => Promise<void> | void;
  onReject?: (
    eventId: string,
    registrationId: string,
  ) => Promise<void> | void;
}

const EventRegistrationApproval: React.FC<
  EventRegistrationApprovalProps
> = ({
  eventId,
  initialEnabled = false,
  initialRegistrations = [],
  organizer = false,
  onApprovalModeChange,
  onApprove,
  onReject,
}) => {
  const [approvalEnabled, setApprovalEnabled] =
    useState(initialEnabled);

  const [registrations, setRegistrations] =
    useState<RegistrationApprovalItem[]>(
      initialRegistrations,
    );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [success, setSuccess] = useState<string | null>(
    null,
  );

  const pendingCount = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === "pending",
      ).length,
    [registrations],
  );

  const approvedCount = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === "approved",
      ).length,
    [registrations],
  );

  const rejectedCount = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === "rejected",
      ).length,
    [registrations],
  );

  const handleApprovalModeChange = async (
    enabled: boolean,
  ) => {
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      if (onApprovalModeChange) {
        await onApprovalModeChange(
          eventId,
          enabled,
        );
      }

      setApprovalEnabled(enabled);

      setSuccess(
        enabled
          ? "Registration approval has been enabled."
          : "Registration approval has been disabled.",
      );
    } catch (changeError) {
      console.error(
        "Unable to update registration approval mode:",
        changeError,
      );

      setError(
        "Unable to update registration approval mode.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateRegistrationStatus = (
    registrationId: string,
    status: RegistrationApprovalStatus,
  ) => {
    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === registrationId
          ? {
              ...registration,
              status,
            }
          : registration,
      ),
    );
  };

  const handleApprove = async (
    registrationId: string,
  ) => {
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      if (onApprove) {
        await onApprove(
          eventId,
          registrationId,
        );
      }

      updateRegistrationStatus(
        registrationId,
        "approved",
      );

      setSuccess(
        "Registration approved successfully.",
      );
    } catch (approveError) {
      console.error(
        "Unable to approve registration:",
        approveError,
      );

      setError(
        "Unable to approve registration.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (
    registrationId: string,
  ) => {
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      if (onReject) {
        await onReject(
          eventId,
          registrationId,
        );
      }

      updateRegistrationStatus(
        registrationId,
        "rejected",
      );

      setSuccess(
        "Registration rejected successfully.",
      );
    } catch (rejectError) {
      console.error(
        "Unable to reject registration:",
        rejectError,
      );

      setError(
        "Unable to reject registration.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
      "
      aria-labelledby="registration-approval-title"
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
          <h2
            id="registration-approval-title"
            className="
              text-2xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Registration Approval
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Review participant registrations before
            accepting them.
          </p>
        </div>

        <div
          className="
            rounded-lg
            bg-gray-100
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            dark:bg-gray-800
            dark:text-gray-300
          "
        >
          Event ID: {eventId}
        </div>
      </div>

      {organizer && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            p-5
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
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
                Require registration approval
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                New registrations will remain pending
                until an organizer reviews them.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={approvalEnabled}
              disabled={saving}
              onClick={() =>
                handleApprovalModeChange(
                  !approvalEnabled,
                )
              }
              className={`
                relative
                h-7
                w-12
                shrink-0
                rounded-full
                transition
                ${
                  approvalEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }
                ${
                  saving
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow
                  transition
                  ${
                    approvalEnabled
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>
        </div>
      )}

      <div
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-3
        "
      >
        <div
          className="
            rounded-xl
            border
            border-yellow-200
            bg-yellow-50
            p-4
            dark:border-yellow-900
            dark:bg-yellow-900/20
          "
        >
          <p
            className="
              text-sm
              text-yellow-700
              dark:text-yellow-300
            "
          >
            Pending
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-yellow-800
              dark:text-yellow-200
            "
          >
            {pendingCount}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-green-200
            bg-green-50
            p-4
            dark:border-green-900
            dark:bg-green-900/20
          "
        >
          <p
            className="
              text-sm
              text-green-700
              dark:text-green-300
            "
          >
            Approved
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-green-800
              dark:text-green-200
            "
          >
            {approvedCount}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            dark:border-red-900
            dark:bg-red-900/20
          "
        >
          <p
            className="
              text-sm
              text-red-700
              dark:text-red-300
            "
          >
            Rejected
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-red-800
              dark:text-red-200
            "
          >
            {rejectedCount}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="
            mt-6
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
            dark:border-red-900
            dark:bg-red-900/20
            dark:text-red-300
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="
            mt-6
            rounded-lg
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
            dark:border-green-900
            dark:bg-green-900/20
            dark:text-green-300
          "
        >
          {success}
        </div>
      )}

      {!approvalEnabled && !organizer && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-5
            dark:border-blue-900
            dark:bg-blue-900/20
          "
        >
          <h3
            className="
              font-semibold
              text-blue-900
              dark:text-blue-200
            "
          >
            Registration is automatic
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-blue-700
              dark:text-blue-300
            "
          >
            This event does not require manual
            registration approval.
          </p>
        </div>
      )}

      {organizer && approvalEnabled && (
        <div className="mt-6">
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h3
                className="
                  text-lg
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                Registration Requests
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Review pending participant
                registrations.
              </p>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                p-8
                text-center
                dark:border-gray-700
              "
            >
              <h4
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                No registrations yet
              </h4>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                New registration requests will
                appear here.
              </p>
            </div>
          ) : (
            <div
              className="
                overflow-x-auto
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
              "
            >
              <table
                className="
                  min-w-full
                  divide-y
                  divide-gray-200
                  dark:divide-gray-700
                "
              >
                <thead
                  className="
                    bg-gray-50
                    dark:bg-gray-800
                  "
                >
                  <tr>
                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Participant
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Submitted
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-4
                        py-3
                        text-right
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody
                  className="
                    divide-y
                    divide-gray-200
                    bg-white
                    dark:divide-gray-700
                    dark:bg-gray-900
                  "
                >
                  {registrations.map(
                    (registration) => (
                      <tr
                        key={
                          registration.id
                        }
                      >
                        <td className="px-4 py-4">
                          <div
                            className="
                              font-medium
                              text-gray-900
                              dark:text-white
                            "
                          >
                            {
                              registration.participantName
                            }
                          </div>

                          <div
                            className="
                              mt-1
                              text-sm
                              text-gray-500
                              dark:text-gray-400
                            "
                          >
                            {
                              registration.participantEmail
                            }
                          </div>
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-4
                            py-4
                            text-sm
                            text-gray-600
                            dark:text-gray-400
                          "
                        >
                          {new Date(
                            registration.submittedAt,
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              ${
                                registration.status ===
                                "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : ""
                              }
                              ${
                                registration.status ===
                                "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : ""
                              }
                              ${
                                registration.status ===
                                "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : ""
                              }
                            `}
                          >
                            {registration.status
                              .charAt(0)
                              .toUpperCase() +
                              registration.status.slice(
                                1,
                              )}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {registration.status ===
                          "pending" ? (
                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  handleReject(
                                    registration.id,
                                  )
                                }
                                className="
                                  rounded-lg
                                  border
                                  border-red-200
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-red-600
                                  hover:bg-red-50
                                  disabled:opacity-50
                                  dark:border-red-900
                                  dark:text-red-400
                                  dark:hover:bg-red-900/20
                                "
                              >
                                Reject
                              </button>

                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  handleApprove(
                                    registration.id,
                                  )
                                }
                                className="
                                  rounded-lg
                                  bg-green-600
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-white
                                  hover:bg-green-700
                                  disabled:opacity-50
                                "
                              >
                                Approve
                              </button>
                            </div>
                          ) : (
                            <div
                              className="
                                text-right
                                text-xs
                                text-gray-400
                              "
                            >
                              Reviewed
                            </div>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EventRegistrationApproval;