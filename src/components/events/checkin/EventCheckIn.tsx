import React, { useMemo, useState } from "react";

interface Participant {
  id: string | number;
  name: string;
  email: string;
  eventId: string | number;
  eventName: string;
  registered: boolean;
  checkedIn: boolean;
  checkedInAt?: string;
}

interface EventCheckInProps {
  participant?: Participant;
  participants?: Participant[];
  isOrganizer?: boolean;
}

const EventCheckIn: React.FC<EventCheckInProps> = ({
  participant,
  participants = [],
  isOrganizer = false,
}) => {
  const [checkedIn, setCheckedIn] = useState(
    participant?.checkedIn ?? false
  );

  const [scanValue, setScanValue] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * Generate a unique check-in code.
   */
  const checkInCode = useMemo(() => {
    if (!participant) {
      return "";
    }

    return `EVENTRA-CHECKIN-${participant.eventId}-${participant.id}`;
  }, [participant]);

  /*
   * Create a QR-like visual using a CSS grid.
   *
   * This keeps the component dependency-free.
   */
  const qrPattern = useMemo(() => {
    const pattern: boolean[][] = [];

    let seed = checkInCode.length || 1;

    for (let row = 0; row < 21; row++) {
      const currentRow: boolean[] = [];

      for (let column = 0; column < 21; column++) {
        seed = (seed * 9301 + 49297) % 233280;

        const value = seed / 233280;

        const inTopLeft =
          row < 7 && column < 7;

        const inTopRight =
          row < 7 && column >= 14;

        const inBottomLeft =
          row >= 14 && column < 7;

        if (inTopLeft || inTopRight || inBottomLeft) {
          currentRow.push(false);
        } else {
          currentRow.push(value > 0.5);
        }
      }

      pattern.push(currentRow);
    }

    /*
     * Add QR finder patterns.
     */
    const addFinderPattern = (
      startRow: number,
      startColumn: number
    ) => {
      for (let row = 0; row < 7; row++) {
        for (let column = 0; column < 7; column++) {
          const edge =
            row === 0 ||
            row === 6 ||
            column === 0 ||
            column === 6;

          const center =
            row >= 2 &&
            row <= 4 &&
            column >= 2 &&
            column <= 4;

          pattern[startRow + row][startColumn + column] =
            edge || center;
        }
      }
    };

    addFinderPattern(0, 0);
    addFinderPattern(0, 14);
    addFinderPattern(14, 0);

    return pattern;
  }, [checkInCode]);

  /*
   * Participant check-in.
   */
  const handleParticipantCheckIn = () => {
    if (!participant) {
      return;
    }

    if (!participant.registered) {
      setScanMessage(
        "You cannot check in because you are not registered for this event."
      );

      return;
    }

    if (checkedIn) {
      setScanMessage(
        "You have already checked in to this event."
      );

      return;
    }

    setCheckedIn(true);

    setScanMessage(
      `Successfully checked in to ${participant.eventName}.`
    );
  };

  /*
   * Organizer scans / enters a QR code.
   */
  const handleOrganizerCheckIn = () => {
    setScanMessage("");

    if (!scanValue.trim()) {
      setScanMessage(
        "Please enter or scan a participant check-in code."
      );

      return;
    }

    const scannedParticipant = participants.find(
      (item) =>
        `EVENTRA-CHECKIN-${item.eventId}-${item.id}` ===
        scanValue.trim()
    );

    if (!scannedParticipant) {
      setScanMessage(
        "Invalid QR code. The participant could not be verified."
      );

      return;
    }

    if (!scannedParticipant.registered) {
      setScanMessage(
        "This participant is not registered for the event."
      );

      return;
    }

    if (scannedParticipant.checkedIn) {
      setScanMessage(
        `${scannedParticipant.name} has already checked in.`
      );

      return;
    }

    scannedParticipant.checkedIn = true;
    scannedParticipant.checkedInAt =
      new Date().toLocaleString();

    setScanMessage(
      `${scannedParticipant.name} successfully checked in.`
    );

    setScanValue("");
  };

  /*
   * Filter participants for organizer dashboard.
   */
  const filteredParticipants = participants.filter(
    (item) => {
      const query = searchQuery.toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
      );
    }
  );

  const checkedInCount = participants.filter(
    (item) => item.checkedIn
  ).length;

  /*
   * Participant view.
   */
  if (!isOrganizer) {
    if (!participant) {
      return (
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📱
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Check-in Unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Participant information could not be found.
          </p>
        </div>
      );
    }

    /*
     * User is not registered.
     */
    if (!participant.registered) {
      return (
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            🔒
          </div>

          <h2 className="text-xl font-bold text-red-800">
            Check-in Not Available
          </h2>

          <p className="mt-2 text-sm text-red-600">
            You are not registered for this event and cannot
            check in.
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Event Check-in
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {participant.eventName}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Show this QR code to the event organizer for
                attendance verification.
              </p>
            </div>

            {checkedIn ? (
              <span className="inline-flex w-fit items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                ✓ Checked In
              </span>
            ) : (
              <span className="inline-flex w-fit items-center rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
                Not Checked In
              </span>
            )}
          </div>
        </div>

        {/* Main check-in card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* QR Code */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Check-in QR
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Present this code at the event entrance.
              </p>
            </div>

            <div className="mx-auto mt-6 flex w-fit rounded-xl border-8 border-white bg-white p-3 shadow-lg ring-1 ring-gray-200">
              <div
                className="grid h-64 w-64"
                style={{
                  gridTemplateColumns:
                    "repeat(21, minmax(0, 1fr))",
                  gridTemplateRows:
                    "repeat(21, minmax(0, 1fr))",
                }}
                aria-label="Event check-in QR code"
              >
                {qrPattern.flatMap((row, rowIndex) =>
                  row.map((isBlack, columnIndex) => (
                    <span
                      key={`${rowIndex}-${columnIndex}`}
                      className={
                        isBlack
                          ? "bg-black"
                          : "bg-white"
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Code */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Check-in Code
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                {checkInCode}
              </p>
            </div>

            {/* Manual check-in */}
            {!checkedIn && (
              <button
                type="button"
                onClick={handleParticipantCheckIn}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Check In
              </button>
            )}
          </div>

          {/* Participant details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Registration Details
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Participant
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {participant.name}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Email
                </p>

                <p className="mt-1 break-all font-semibold text-gray-800">
                  {participant.email}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Event
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {participant.eventName}
                </p>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  checkedIn
                    ? "bg-green-50"
                    : "bg-yellow-50"
                }`}
              >
                <p className="text-xs font-medium uppercase text-gray-400">
                  Attendance Status
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    checkedIn
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {checkedIn
                    ? "Successfully Checked In"
                    : "Not Checked In"}
                </p>
              </div>

              {participant.checkedInAt && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Check-in Time
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {participant.checkedInAt}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {scanMessage && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              scanMessage.toLowerCase().includes("success")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {scanMessage}
          </div>
        )}
      </div>
    );
  }

  /*
   * Organizer dashboard.
   */
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Organizer Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Organizer Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Event Check-in
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Verify participant attendance using their unique
              check-in code.
            </p>
          </div>

          {/* Attendance stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {participants.length}
              </p>

              <p className="mt-1 text-xs font-medium text-blue-600">
                Registered
              </p>
            </div>

            <div className="rounded-xl bg-green-50 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {checkedInCount}
              </p>

              <p className="mt-1 text-xs font-medium text-green-600">
                Checked In
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Scan Participant QR
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Scan the participant QR code or enter the check-in
            code manually.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Scanner placeholder */}
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
              📷
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              QR Scanner
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Use the QR scanner available in your Eventra
              application to scan participant codes.
            </p>

            <p className="mt-4 rounded-lg bg-yellow-50 px-4 py-2 text-xs text-yellow-700">
              Camera scanning can be connected to the project's
              existing QR scanner.
            </p>
          </div>

          {/* Manual code */}
          <div className="flex flex-col justify-center">
            <label
              htmlFor="checkin-code"
              className="text-sm font-semibold text-gray-700"
            >
              Enter Check-in Code
            </label>

            <input
              id="checkin-code"
              type="text"
              value={scanValue}
              onChange={(event) =>
                setScanValue(event.target.value)
              }
              placeholder="EVENTRA-CHECKIN-..."
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={handleOrganizerCheckIn}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              ✓ Verify Check-in
            </button>

            {scanMessage && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                {scanMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participant list */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View registered participants and their check-in
                status.
              </p>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search participant..."
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredParticipants.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No participants found.
            </div>
          ) : (
            filteredParticipants.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      item.checkedIn
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-yellow-200 bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {item.checkedIn
                      ? "Checked In"
                      : "Pending"}
                  </span>
                </div>

                {item.checkedInAt && (
                  <p className="mt-3 text-xs text-gray-400">
                    Checked in at {item.checkedInAt}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 p-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Participant
                </th>

                <th className="border-b border-gray-200 p-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Email
                </th>

                <th className="border-b border-gray-200 p-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Registration
                </th>

                <th className="border-b border-gray-200 p-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Attendance
                </th>

                <th className="border-b border-gray-200 p-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Check-in Time
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-sm text-gray-500"
                  >
                    No participants found.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="border-b border-gray-100 p-4">
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>
                    </td>

                    <td className="border-b border-gray-100 p-4 text-sm text-gray-600">
                      {item.email}
                    </td>

                    <td className="border-b border-gray-100 p-4">
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        Registered
                      </span>
                    </td>

                    <td className="border-b border-gray-100 p-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          item.checkedIn
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-yellow-200 bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.checkedIn
                          ? "✓ Checked In"
                          : "Pending"}
                      </span>
                    </td>

                    <td className="border-b border-gray-100 p-4 text-sm text-gray-600">
                      {item.checkedInAt || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer information */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Check-in security:</strong> Only registered
          participants with a valid Eventra check-in code can be
          marked as checked in. Duplicate check-ins are prevented.
        </p>
      </div>
    </div>
  );
};

export default EventCheckIn;