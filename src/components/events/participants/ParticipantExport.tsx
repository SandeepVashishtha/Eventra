import React, { useMemo, useState } from "react";

interface Participant {
  id: string | number;
  name: string;
  email?: string;
  registrationDate: string;
  status?: "registered" | "checked-in" | "cancelled";
  eventId: string | number;
}

interface ParticipantExportProps {
  eventId: string | number;
  eventName: string;
  participants?: Participant[];
  isOrganizer?: boolean;
}

const ParticipantExport: React.FC<
  ParticipantExportProps
> = ({
  eventId,
  eventName,
  participants = [],
  isOrganizer = false,
}) => {
  const [isExporting, setIsExporting] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "registered" | "checked-in"
    >("all");

  const [notification, setNotification] =
    useState("");

  /*
   * Only participants belonging to this event.
   */
  const eventParticipants = useMemo(() => {
    return participants.filter(
      (participant) =>
        String(participant.eventId) ===
        String(eventId)
    );
  }, [participants, eventId]);

  /*
   * Filter participants.
   */
  const filteredParticipants =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return eventParticipants.filter(
        (participant) => {
          const matchesSearch =
            !query ||
            participant.name
              .toLowerCase()
              .includes(query) ||
            participant.email
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            participant.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      eventParticipants,
      searchQuery,
      statusFilter,
    ]);

  /*
   * Export only safe participant information.
   *
   * Email is intentionally excluded to avoid
   * exposing unnecessary sensitive information.
   */
  const exportParticipants = () => {
    if (
      !isOrganizer ||
      filteredParticipants.length === 0 ||
      isExporting
    ) {
      return;
    }

    setIsExporting(true);

    try {
      const headers = [
        "Participant Name",
        "Registration Date",
        "Status",
      ];

      const rows =
        filteredParticipants.map(
          (participant) => [
            participant.name,
            participant.registrationDate,
            participant.status ||
              "registered",
          ]
        );

      const csvContent = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map((value) => {
              const safeValue = String(
                value ?? ""
              );

              return `"${safeValue.replace(
                /"/g,
                '""'
              )}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const safeEventName =
        eventName
          .replace(/[^a-z0-9]/gi, "-")
          .replace(
            /-+/g,
            "-"
          )
          .toLowerCase();

      link.download = `${safeEventName}-participants.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setNotification(
        `${filteredParticipants.length} participant${
          filteredParticipants.length !==
          1
            ? "s"
            : ""
        } exported successfully.`
      );

      window.setTimeout(() => {
        setNotification("");
      }, 4000);
    } finally {
      setIsExporting(false);
    }
  };

  /*
   * Format registration date.
   */
  const formatDate = (
    date: string
  ) => {
    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Status styling.
   */
  const getStatusStyle = (
    status?: Participant["status"]
  ) => {
    switch (status) {
      case "checked-in":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
  };

  /*
   * Unauthorized users should not see
   * participant export information.
   */
  if (!isOrganizer) {
    return (
      <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-900">
            🔒
          </div>

          <div>
            <h2 className="text-lg font-bold text-red-800 dark:text-red-300">
              Organizer Access Required
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
              Only authorized organizers can view
              or export participant information.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            📊
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Organizer Dashboard
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Participant Registration Export
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Export registered participants for{" "}
              <strong>{eventName}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportParticipants}
          disabled={
            filteredParticipants.length ===
              0 ||
            isExporting
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>⬇️</span>

          {isExporting
            ? "Exporting..."
            : "Export Participants"}
        </button>
      </div>

      {/* Privacy notice */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🔒
          </span>

          <div>
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
              Privacy Protected Export
            </h3>

            <p className="mt-1 text-xs leading-5 text-green-700 dark:text-green-400">
              The CSV contains only necessary
              participant information. Sensitive
              account information is excluded.
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              ✓
            </span>

            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {notification}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Total Participants
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {eventParticipants.length}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Checked In
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              eventParticipants.filter(
                (participant) =>
                  participant.status ===
                  "checked-in"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Exportable
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {filteredParticipants.length}
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Search Participants
          </label>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search by participant name..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Registration Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | "registered"
                  | "checked-in"
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">
              All Participants
            </option>

            <option value="registered">
              Registered
            </option>

            <option value="checked-in">
              Checked In
            </option>
          </select>
        </div>
      </div>

      {/* Participant table */}
      {filteredParticipants.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-gray-700">
            👥
          </div>

          <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
            No participants found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            There are no participants matching
            the current search or filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    #
                  </th>

                  <th className="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Participant
                  </th>

                  <th className="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Registration Date
                  </th>

                  <th className="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.map(
                  (
                    participant,
                    index
                  ) => (
                    <tr
                      key={
                        participant.id
                      }
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        {index + 1}
                      </td>

                      <td className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {participant.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="font-medium text-gray-900 dark:text-white">
                            {
                              participant.name
                            }
                          </span>
                        </div>
                      </td>

                      <td className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        {formatDate(
                          participant.registrationDate
                        )}
                      </td>

                      <td className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            participant.status
                          )}`}
                        >
                          {participant.status ===
                          "checked-in"
                            ? "Checked In"
                            : participant.status ===
                              "cancelled"
                            ? "Cancelled"
                            : "Registered"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export information */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            📄
          </span>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              CSV Export
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              The exported CSV contains participant
              name, registration date, and registration
              status for this event only. Email addresses
              and other sensitive account information are
              intentionally excluded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParticipantExport;