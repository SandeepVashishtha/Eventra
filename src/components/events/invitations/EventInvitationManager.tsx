import React, { useMemo, useState } from "react";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined";

export interface EventInvitation {
  id: string;
  eventId: string;
  eventTitle: string;
  invitedUserId: string;
  invitedUserName: string;
  invitedUserEmail?: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt?: string;
}

interface EventInvitationManagerProps {
  eventId: string;
  eventTitle: string;
  invitations?: EventInvitation[];
  isOrganizer?: boolean;

  onInvite?: (
    userId: string,
    userName: string,
    userEmail?: string
  ) => void;

  onAccept?: (
    invitationId: string
  ) => void;

  onDecline?: (
    invitationId: string
  ) => void;

  onCancel?: (
    invitationId: string
  ) => void;
}

const EventInvitationManager: React.FC<
  EventInvitationManagerProps
> = ({
  eventId,
  eventTitle,
  invitations = [],
  isOrganizer = false,
  onInvite,
  onAccept,
  onDecline,
  onCancel,
}) => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const eventInvitations = useMemo(() => {
    return invitations.filter(
      (invitation) =>
        invitation.eventId === eventId
    );
  }, [invitations, eventId]);

  const pendingCount =
    eventInvitations.filter(
      (invitation) =>
        invitation.status === "pending"
    ).length;

  const acceptedCount =
    eventInvitations.filter(
      (invitation) =>
        invitation.status === "accepted"
    ).length;

  const declinedCount =
    eventInvitations.filter(
      (invitation) =>
        invitation.status === "declined"
    ).length;

  const hasExistingInvitation = (
    invitedUserId: string
  ) => {
    return eventInvitations.some(
      (invitation) =>
        invitation.invitedUserId ===
          invitedUserId &&
        invitation.status !==
          "declined"
    );
  };

  const handleInvite = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedUserId =
      userId.trim();

    const trimmedName =
      userName.trim();

    const trimmedEmail =
      userEmail.trim();

    if (!trimmedUserId) {
      setError(
        "Please enter a user ID."
      );
      return;
    }

    if (!trimmedName) {
      setError(
        "Please enter the user's name."
      );
      return;
    }

    if (
      hasExistingInvitation(
        trimmedUserId
      )
    ) {
      setError(
        "This user already has an invitation for this event."
      );
      return;
    }

    onInvite?.(
      trimmedUserId,
      trimmedName,
      trimmedEmail || undefined
    );

    setUserId("");
    setUserName("");
    setUserEmail("");

    setSuccess(
      "Invitation created successfully."
    );
  };

  const getStatusClasses = (
    status: InvitationStatus
  ) => {
    switch (status) {
      case "accepted":
        return `
          bg-green-100
          text-green-700
          dark:bg-green-900/30
          dark:text-green-300
        `;

      case "declined":
        return `
          bg-red-100
          text-red-700
          dark:bg-red-900/30
          dark:text-red-300
        `;

      default:
        return `
          bg-yellow-100
          text-yellow-700
          dark:bg-yellow-900/30
          dark:text-yellow-300
        `;
    }
  };

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  if (!isOrganizer) {
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
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-blue-700
              dark:bg-blue-900/30
              dark:text-blue-300
            "
          >
            ✉
          </div>

          <div>
            <h2
              className="
                text-lg
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Event Invitations
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Invitations for this event
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {eventInvitations.length ===
          0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                p-6
                text-center
                dark:border-gray-700
              "
            >
              <p
                className="
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                You do not have any
                invitations for this
                event.
              </p>
            </div>
          ) : (
            eventInvitations.map(
              (invitation) => (
                <article
                  key={invitation.id}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    p-5
                    dark:border-gray-700
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
                      <h3
                        className="
                          font-semibold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {invitation.eventTitle}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        Invitation received{" "}
                        {formatDate(
                          invitation.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`
                        w-fit
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${getStatusClasses(
                          invitation.status
                        )}
                      `}
                    >
                      {invitation.status
                        .charAt(0)
                        .toUpperCase() +
                        invitation.status.slice(
                          1
                        )}
                    </span>
                  </div>

                  {invitation.status ===
                    "pending" && (
                    <div
                      className="
                        mt-5
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onAccept?.(
                            invitation.id
                          )
                        }
                        className="
                          rounded-lg
                          bg-green-600
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-green-700
                        "
                      >
                        Accept Invitation
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDecline?.(
                            invitation.id
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-gray-300
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-gray-700
                          transition
                          hover:bg-gray-50
                          dark:border-gray-600
                          dark:text-gray-200
                          dark:hover:bg-gray-800
                        "
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {invitation.status ===
                    "accepted" && (
                    <div
                      className="
                        mt-4
                        rounded-lg
                        bg-green-50
                        p-3
                        text-sm
                        text-green-700
                        dark:bg-green-950/20
                        dark:text-green-300
                      "
                    >
                      Invitation accepted.
                      You can continue with
                      event registration.
                    </div>
                  )}
                </article>
              )
            )
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        w-full
        space-y-6
      "
    >
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
              Event Invitations
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Invite selected users to{" "}
              {eventTitle}
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-3
              gap-2
            "
          >
            <div
              className="
                rounded-lg
                bg-yellow-50
                px-3
                py-2
                text-center
                dark:bg-yellow-950/20
              "
            >
              <p
                className="
                  text-lg
                  font-bold
                  text-yellow-700
                  dark:text-yellow-300
                "
              >
                {pendingCount}
              </p>

              <p
                className="
                  text-xs
                  text-yellow-600
                  dark:text-yellow-400
                "
              >
                Pending
              </p>
            </div>

            <div
              className="
                rounded-lg
                bg-green-50
                px-3
                py-2
                text-center
                dark:bg-green-950/20
              "
            >
              <p
                className="
                  text-lg
                  font-bold
                  text-green-700
                  dark:text-green-300
                "
              >
                {acceptedCount}
              </p>

              <p
                className="
                  text-xs
                  text-green-600
                  dark:text-green-400
                "
              >
                Accepted
              </p>
            </div>

            <div
              className="
                rounded-lg
                bg-red-50
                px-3
                py-2
                text-center
                dark:bg-red-950/20
              "
            >
              <p
                className="
                  text-lg
                  font-bold
                  text-red-700
                  dark:text-red-300
                "
              >
                {declinedCount}
              </p>

              <p
                className="
                  text-xs
                  text-red-600
                  dark:text-red-400
                "
              >
                Declined
              </p>
            </div>
          </div>
        </div>
      </div>

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
        <h3
          className="
            text-lg
            font-bold
            text-gray-900
            dark:text-white
          "
        >
          Invite a User
        </h3>

        <form
          onSubmit={handleInvite}
          className="
            mt-5
            space-y-4
          "
        >
          <div>
            <label
              htmlFor="invited-user-id"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
              "
            >
              User ID
            </label>

            <input
              id="invited-user-id"
              value={userId}
              onChange={(event) =>
                setUserId(
                  event.target.value
                )
              }
              placeholder="Enter user ID"
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2.5
                text-sm
                text-gray-900
                outline-none
                focus:border-gray-500
                dark:border-gray-600
                dark:bg-gray-800
                dark:text-white
              "
            />
          </div>

          <div>
            <label
              htmlFor="invited-user-name"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
              "
            >
              User Name
            </label>

            <input
              id="invited-user-name"
              value={userName}
              onChange={(event) =>
                setUserName(
                  event.target.value
                )
              }
              placeholder="Enter user name"
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2.5
                text-sm
                text-gray-900
                outline-none
                focus:border-gray-500
                dark:border-gray-600
                dark:bg-gray-800
                dark:text-white
              "
            />
          </div>

          <div>
            <label
              htmlFor="invited-user-email"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
              "
            >
              Email
            </label>

            <input
              id="invited-user-email"
              type="email"
              value={userEmail}
              onChange={(event) =>
                setUserEmail(
                  event.target.value
                )
              }
              placeholder="Enter email address"
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2.5
                text-sm
                text-gray-900
                outline-none
                focus:border-gray-500
                dark:border-gray-600
                dark:bg-gray-800
                dark:text-white
              "
            />
          </div>

          {error && (
            <div
              className="
                rounded-lg
                bg-red-50
                p-3
                text-sm
                text-red-700
                dark:bg-red-950/20
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="
                rounded-lg
                bg-green-50
                p-3
                text-sm
                text-green-700
                dark:bg-green-950/20
                dark:text-green-300
              "
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="
              w-full
              rounded-lg
              bg-gray-900
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-700
              dark:bg-white
              dark:text-gray-900
              dark:hover:bg-gray-200
              sm:w-auto
            "
          >
            Send Invitation
          </button>
        </form>
      </div>

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
        <h3
          className="
            text-lg
            font-bold
            text-gray-900
            dark:text-white
          "
        >
          Invitation Status
        </h3>

        <div
          className="
            mt-5
            divide-y
            divide-gray-200
            dark:divide-gray-800
          "
        >
          {eventInvitations.length ===
          0 ? (
            <p
              className="
                py-6
                text-center
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              No invitations have
              been sent yet.
            </p>
          ) : (
            eventInvitations.map(
              (invitation) => (
                <article
                  key={invitation.id}
                  className="
                    flex
                    flex-col
                    gap-4
                    py-5
                    first:pt-0
                    last:pb-0
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <h4
                      className="
                        font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {
                        invitation.invitedUserName
                      }
                    </h4>

                    {invitation.invitedUserEmail && (
                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        {
                          invitation.invitedUserEmail
                        }
                      </p>
                    )}

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-500
                        dark:text-gray-500
                      "
                    >
                      Sent{" "}
                      {formatDate(
                        invitation.createdAt
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${getStatusClasses(
                          invitation.status
                        )}
                      `}
                    >
                      {invitation.status
                        .charAt(0)
                        .toUpperCase() +
                        invitation.status.slice(
                          1
                        )}
                    </span>

                    {invitation.status ===
                      "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          onCancel?.(
                            invitation.id
                          )
                        }
                        className="
                          text-xs
                          font-semibold
                          text-red-600
                          hover:underline
                          dark:text-red-400
                        "
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              )
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default EventInvitationManager;