import React, {
  useMemo,
  useState,
} from "react";

export interface RegistrationQRTicketProps {
  registrationId: string;
  eventId: string;
  eventName: string;
  participantName?: string;
  eventDate?: string | Date;
  venue?: string;
  ticketCode?: string;
  status?: "confirmed" | "used" | "cancelled" | "invalid";
  className?: string;
  onOpen?: () => void;
}

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodePlaceholder: React.FC<QRCodeProps> = ({
  value,
  size = 220,
}) => {
  const cells = useMemo(() => {
    const result: boolean[][] = [];

    for (let row = 0; row < 21; row += 1) {
      const currentRow: boolean[] = [];

      for (let column = 0; column < 21; column += 1) {
        const seed =
          value.charCodeAt(
            (row * 21 + column) %
              Math.max(value.length, 1)
          ) || 0;

        const pattern =
          (row * 7 +
            column * 11 +
            seed) %
          5;

        const finder =
          (row < 7 &&
            column < 7) ||
          (row < 7 &&
            column >= 14) ||
          (row >= 14 &&
            column < 7);

        if (finder) {
          const localRow =
            row < 7
              ? row % 7
              : row - 14;

          const localColumn =
            column < 7
              ? column
              : column - 14;

          const outer =
            localRow === 0 ||
            localRow === 6 ||
            localColumn === 0 ||
            localColumn === 6;

          const inner =
            localRow >= 2 &&
            localRow <= 4 &&
            localColumn >= 2 &&
            localColumn <= 4;

          currentRow.push(
            outer || inner
          );
        } else {
          currentRow.push(
            pattern === 0 ||
              pattern === 2
          );
        }
      }

      result.push(currentRow);
    }

    return result;
  }, [value]);

  const cellSize =
    size / 21;

  return (
    <div
      className="inline-flex rounded-xl bg-white p-3 shadow-sm"
      aria-label="Registration QR ticket"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="QR ticket code"
      >
        <rect
          width={size}
          height={size}
          fill="white"
        />

        {cells.map(
          (row, rowIndex) =>
            row.map(
              (enabled, columnIndex) =>
                enabled && (
                  <rect
                    key={`${rowIndex}-${columnIndex}`}
                    x={
                      columnIndex *
                      cellSize
                    }
                    y={
                      rowIndex *
                      cellSize
                    }
                    width={cellSize}
                    height={cellSize}
                    fill="black"
                  />
                )
            )
        )}
      </svg>
    </div>
  );
};

const formatEventDate = (
  value?: string | Date
) => {
  if (!value) {
    return "Date to be announced";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const RegistrationQRTicket: React.FC<
  RegistrationQRTicketProps
> = ({
  registrationId,
  eventId,
  eventName,
  participantName,
  eventDate,
  venue,
  ticketCode,
  status = "confirmed",
  className = "",
  onOpen,
}) => {
  const [showTicket, setShowTicket] =
    useState(false);

  const generatedTicketCode =
    ticketCode ||
    `EVT-${eventId}-${registrationId}`;

  const isConfirmed =
    status === "confirmed";

  const isUsed =
    status === "used";

  const isCancelled =
    status === "cancelled";

  const isInvalid =
    status === "invalid";

  const statusLabel =
    isConfirmed
      ? "Confirmed"
      : isUsed
      ? "Already Used"
      : isCancelled
      ? "Cancelled"
      : "Invalid Ticket";

  const qrValue =
    JSON.stringify({
      registrationId,
      eventId,
      ticketCode:
        generatedTicketCode,
    });

  const handleOpen = () => {
    setShowTicket(true);
    onOpen?.();
  };

  const handleClose = () => {
    setShowTicket(false);
  };

  return (
    <>
      <div
        className={`
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
          ${className}
        `}
      >
        <div
          className="
            border-b
            border-gray-200
            bg-gradient-to-r
            from-blue-50
            to-purple-50
            p-5
            dark:border-gray-700
            dark:from-blue-950/40
            dark:to-purple-950/40
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-xl
                text-white
              "
            >
              🎟️
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-600
                  dark:text-blue-400
                "
              >
                Event Ticket
              </p>

              <h2
                className="
                  mt-1
                  truncate
                  text-lg
                  font-bold
                  text-gray-900
                  dark:text-white
                "
              >
                {eventName}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Registration
              </p>

              <p
                className="
                  mt-1
                  break-all
                  text-sm
                  font-semibold
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {registrationId}
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Status
              </p>

              <span
                className={`
                  mt-1
                  inline-flex
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${
                    isConfirmed
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : isUsed
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }
                `}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div
            className="
              mt-5
              grid
              gap-4
              rounded-xl
              bg-gray-50
              p-4
              dark:bg-gray-800
            "
          >
            {participantName && (
              <div>
                <p className="text-xs text-gray-400">
                  Participant
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  {participantName}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400">
                Event Date
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {formatEventDate(
                  eventDate
                )}
              </p>
            </div>

            {venue && (
              <div>
                <p className="text-xs text-gray-400">
                  Venue
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  {venue}
                </p>
              </div>
            )}
          </div>

          {isConfirmed ? (
            <button
              type="button"
              onClick={handleOpen}
              className="
                mt-5
                w-full
                rounded-xl
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
                dark:focus:ring-offset-gray-900
              "
            >
              Open QR Ticket
            </button>
          ) : (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-center
                text-sm
                font-medium
                text-red-700
                dark:border-red-900
                dark:bg-red-950/40
                dark:text-red-300
              "
            >
              This ticket is not available
              for entry verification.
            </div>
          )}
        </div>
      </div>

      {showTicket &&
        isConfirmed && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/60
              p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-ticket-title"
          >
            <div
              className="
                max-h-[90vh]
                w-full
                max-w-md
                overflow-y-auto
                rounded-2xl
                bg-white
                shadow-2xl
                dark:bg-gray-900
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-gray-200
                  p-5
                  dark:border-gray-700
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-blue-600
                    "
                  >
                    Registration Ticket
                  </p>

                  <h2
                    id="qr-ticket-title"
                    className="
                      mt-1
                      text-lg
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    {eventName}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-gray-500
                    hover:bg-gray-100
                    hover:text-gray-700
                    dark:hover:bg-gray-800
                  "
                  aria-label="Close ticket"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-center">
                  <QRCodePlaceholder
                    value={qrValue}
                    size={240}
                  />
                </div>

                <div
                  className="
                    mt-5
                    text-center
                  "
                >
                  <p
                    className="
                      text-sm
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Show this QR code at
                    the event entrance
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    The organizer can scan this
                    ticket to verify your
                    registration.
                  </p>
                </div>

                <div
                  className="
                    mt-5
                    rounded-xl
                    bg-gray-50
                    p-4
                    dark:bg-gray-800
                  "
                >
                  <div>
                    <p className="text-xs text-gray-400">
                      Ticket Code
                    </p>

                    <p
                      className="
                        mt-1
                        break-all
                        text-sm
                        font-bold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {generatedTicketCode}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-400">
                      Registration ID
                    </p>

                    <p
                      className="
                        mt-1
                        break-all
                        text-xs
                        text-gray-600
                        dark:text-gray-300
                      "
                    >
                      {registrationId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    mt-5
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    hover:bg-gray-50
                    dark:border-gray-600
                    dark:text-gray-200
                    dark:hover:bg-gray-800
                  "
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default RegistrationQRTicket;