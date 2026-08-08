import { Clock, X, CheckCircle, Bell } from "lucide-react";

const PromotionNotification = ({
  user,
  eventName,
  confirmationDeadline,
  onConfirm,
  onDismiss,
}) => {
  if (!user) return null;

  const deadline = confirmationDeadline
    ? new Date(confirmationDeadline).toLocaleString()
    : "Not available";

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md rounded-2xl border border-green-200 dark:border-green-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">

      {/* Header */}

      <div className="flex items-center justify-between bg-green-600 text-white px-5 py-4">

        <div className="flex items-center gap-2">
          <Bell size={22} />
          <h2 className="font-bold text-lg">
            Waitlist Promotion
          </h2>
        </div>

        <button
          onClick={onDismiss}
          className="hover:bg-green-700 rounded-full p-1 transition"
        >
          <X size={18} />
        </button>

      </div>

      {/* Body */}

      <div className="p-5">

        <div className="flex items-center gap-3 mb-4">

          <CheckCircle
            className="text-green-600"
            size={40}
          />

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Congratulations {user.name || "Participant"}!
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              A seat has become available for you.
            </p>
          </div>

        </div>

        <div className="space-y-3 text-sm">

          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Event
            </span>

            <p className="text-slate-600 dark:text-slate-400">
              {eventName}
            </p>
          </div>

          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">

            <Clock size={18} />

            <span>
              Confirm before <strong>{deadline}</strong>
            </span>

          </div>

        </div>

        {/* Buttons */}

        <div className="mt-6 flex gap-3">

          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 font-medium transition"
          >
            Confirm Registration
          </button>

          <button
            onClick={onDismiss}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 py-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Later
          </button>

        </div>

      </div>

    </div>
  );
};

export default PromotionNotification;