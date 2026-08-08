import { Users, Clock, CheckCircle, ArrowUpCircle } from "lucide-react";
import { getEventQueue } from "../../utils/waitlistPromotionUtils";

const WaitlistQueue = ({ eventId }) => {
  const queue = getEventQueue(eventId);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
            <CheckCircle size={14} />
            Confirmed
          </span>
        );

      case "promoted":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
            <ArrowUpCircle size={14} />
            Promoted
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium">
            <Clock size={14} />
            Waiting
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Users
          size={26}
          className="text-indigo-600"
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Waitlist Queue
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            First-come, first-served promotion system.
          </p>
        </div>

      </div>

      {/* Empty State */}

      {queue.length === 0 ? (
        <div className="text-center py-10">

          <Users
            size={48}
            className="mx-auto text-slate-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Users in Waitlist
          </h3>

          <p className="text-slate-500 mt-2">
            Users joining the waitlist will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {queue.map((user, index) => (
            <div
              key={`${user.userId}-${index}`}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition"
            >

              <div>

                <h3 className="font-semibold text-slate-800 dark:text-white">
                  #{index + 1} {user.name || user.userId}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Joined{" "}
                  {new Date(user.joinedAt).toLocaleString()}
                </p>

              </div>

              {getStatusBadge(user.status)}

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default WaitlistQueue;