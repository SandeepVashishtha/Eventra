import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const comparisonFields = [
  { label: "Registration Deadline", key: "registrationDeadline" },
  { label: "Event Date", key: "date" },
  { label: "Venue", key: "location" },
  { label: "Organizer", key: "organizer" },
  { label: "Participation Fee", key: "fee" },
  { label: "Prize Pool", key: "prizePool" },
  { label: "Team Size", key: "teamSize" },
  { label: "Mode", key: "mode" },
  { label: "Category", key: "category" },
  { label: "Available Seats", key: "availableSeats" },
];

const getValue = (event, key) => {
  const value = event?.[key];

  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
};

const EventComparison = ({ events = [], onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
            <h2 className="text-2xl font-bold">
              Compare Events
            </h2>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="px-5 py-4 text-left sticky left-0 bg-indigo-600">
                    Feature
                  </th>

                  {events.map((event) => (
                    <th
                      key={event.id}
                      className="px-5 py-4 text-center min-w-[220px]"
                    >
                      <div className="font-bold text-lg">
                        {event.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonFields.map((field) => (
                  <tr
                    key={field.key}
                    className="border-b dark:border-slate-700"
                  >
                    <td className="font-semibold bg-gray-100 dark:bg-slate-800 px-5 py-4 sticky left-0">
                      {field.label}
                    </td>

                    {events.map((event) => (
                      <td
                        key={event.id + field.key}
                        className="text-center px-5 py-4"
                      >
                        {getValue(event, field.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventComparison;