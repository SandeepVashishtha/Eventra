import { X, Calendar, Download } from "lucide-react";
import {
  openCalendarProvider,
  getCalendarProviders,
} from "../../utils/calendarUtils-jp";

const CalendarOptionsModal = ({ event, onClose }) => {
  const providers = getCalendarProviders();

  const handleSelect = (providerId) => {
    openCalendarProvider(providerId, event);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-5">

          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={22} />

            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Add to Calendar
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* Event */}

        <div className="px-6 pt-5">

          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {event?.title || "Event"}
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Choose your preferred calendar provider.
          </p>

        </div>

        {/* Providers */}

        <div className="p-6 space-y-3">

          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSelect(provider.id)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {provider.name}
              </span>

              {provider.id === "apple" ? (
                <Download
                  size={18}
                  className="text-indigo-600"
                />
              ) : (
                <Calendar
                  size={18}
                  className="text-indigo-600"
                />
              )}
            </button>
          ))}

        </div>

        {/* Footer */}

        <div className="border-t border-slate-200 dark:border-slate-700 p-5 flex justify-end">

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-700 px-5 py-2 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};

export default CalendarOptionsModal;