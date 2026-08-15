import React, { useMemo } from "react";

export interface CheckInRecord {
  id: string;
  eventId: string;
  eventName: string;
  checkedInAt: string;
  location?: string;
}

interface CheckInHistoryProps {
  records?: CheckInRecord[];
  isOrganizer?: boolean;
  eventId?: string;
  className?: string;
}

const formatDateTime = (
  value: string
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

const CheckInHistory: React.FC<
  CheckInHistoryProps
> = ({
  records = [],
  isOrganizer = false,
  eventId,
  className = "",
}) => {
  const filteredRecords = useMemo(() => {
    const relevantRecords =
      eventId
        ? records.filter(
            (record) =>
              record.eventId ===
              eventId
          )
        : records;

    const uniqueRecords =
      new Map<
        string,
        CheckInRecord
      >();

    relevantRecords.forEach(
      (record) => {
        const key =
          record.eventId;

        if (
          !uniqueRecords.has(
            key
          )
        ) {
          uniqueRecords.set(
            key,
            record
          );
        }
      }
    );

    return Array.from(
      uniqueRecords.values()
    ).sort(
      (a, b) =>
        new Date(
          b.checkedInAt
        ).getTime() -
        new Date(
          a.checkedInAt
        ).getTime()
    );
  }, [records, eventId]);

  return (
    <section
      className={`
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
        ${className}
      `}
    >
      <div
        className="
          flex
          flex-col
          gap-2
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
            Check-in History
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Successful event attendance
            check-ins
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-green-100
            px-3
            py-1
            text-xs
            font-semibold
            text-green-700
            dark:bg-green-900/30
            dark:text-green-300
          "
        >
          {filteredRecords.length}{" "}
          {filteredRecords.length === 1
            ? "check-in"
            : "check-ins"}
        </span>
      </div>

      {filteredRecords.length ===
      0 ? (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-dashed
            border-gray-300
            p-8
            text-center
            dark:border-gray-700
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-gray-100
              text-xl
              dark:bg-gray-800
            "
          >
            ✓
          </div>

          <h3
            className="
              mt-4
              text-base
              font-semibold
              text-gray-800
              dark:text-gray-200
            "
          >
            No check-ins yet
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Successful event check-ins
            will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="
              divide-y
              divide-gray-200
              dark:divide-gray-800
            "
          >
            {filteredRecords.map(
              (record) => (
                <article
                  key={record.id}
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
                  <div
                    className="
                      flex
                      min-w-0
                      items-start
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-green-100
                        text-green-700
                        dark:bg-green-900/30
                        dark:text-green-300
                      "
                    >
                      ✓
                    </div>

                    <div className="min-w-0">
                      <h3
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {record.eventName}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-600
                          dark:text-gray-400
                        "
                      >
                        Checked in{" "}
                        {formatDateTime(
                          record.checkedInAt
                        )}
                      </p>

                      {record.location && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-500
                            dark:text-gray-500
                          "
                        >
                          {record.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className="
                      w-fit
                      rounded-full
                      bg-green-50
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-green-700
                      dark:bg-green-950/30
                      dark:text-green-300
                    "
                  >
                    Attendance Confirmed
                  </span>
                </article>
              )
            )}
          </div>
        </div>
      )}

      {isOrganizer && (
        <div
          className="
            mt-6
            rounded-xl
            bg-blue-50
            p-4
            dark:bg-blue-950/20
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-blue-800
              dark:text-blue-300
            "
          >
            Organizer attendance view
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-blue-700
              dark:text-blue-400
            "
          >
            Only attendance records for
            events you are authorized to
            manage should be provided to
            this component.
          </p>
        </div>
      )}
    </section>
  );
};

export default CheckInHistory;