const EventRegistrationProgress = ({ attendees = 0, maxAttendees = 0 }) => {
  if (!maxAttendees || maxAttendees <= 0) return null;

  const percent = Math.min(
    Math.round((attendees / maxAttendees) * 100),
    100
  );

  const remaining = Math.max(maxAttendees - attendees, 0);

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">
          Registration Progress
        </span>

        <span>
          {attendees}/{maxAttendees}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>{percent}% Filled</span>

        <span>{remaining} Seats Remaining</span>
      </div>
    </div>
  );
};

export default EventRegistrationProgress;