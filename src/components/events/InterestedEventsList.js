import { useEffect, useState } from "react";
import { Heart, Calendar, MapPin, UserPlus, Trash2 } from "lucide-react";
import {
  getInterestedEvents,
  removeInterestedEvent,
} from "../../utils/interestTrackerUtils";

const InterestedEventsList = ({ onQuickRegister }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadInterestedEvents();
  }, []);

  const loadInterestedEvents = () => {
    setEvents(getInterestedEvents());
  };

  const handleRemove = (eventId) => {
    const updated = removeInterestedEvent(eventId);
    setEvents(updated);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8 text-center">
        <Heart
          size={40}
          className="mx-auto text-gray-400 mb-4"
        />

        <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
          No Interested Events
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Events you mark as interested will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
        <Heart className="text-red-500" />
        Interested Events
      </h2>

      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-5 transition hover:shadow-lg"
        >

          <div className="flex justify-between items-start">

            <div>

              <h3 className="text-lg font-semibold">
                {event.title}
              </h3>

              <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">

                {event.date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {event.date}
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                )}

              </div>

            </div>

            <Heart
              size={22}
              fill="currentColor"
              className="text-red-500"
            />

          </div>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() =>
                onQuickRegister &&
                onQuickRegister(event)
              }
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
            >
              <UserPlus size={16} />
              Quick Register
            </button>

            <button
              onClick={() => handleRemove(event.id)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
            >
              <Trash2 size={16} />
              Remove
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default InterestedEventsList;