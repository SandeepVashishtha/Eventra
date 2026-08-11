import { CheckCircle, Circle, Clock } from "lucide-react";

const STATUS_STYLES = {
  completed: {
    icon: <CheckCircle size={22} />,
    iconBg: "bg-green-500",
    line: "bg-green-500",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    title: "text-green-600 dark:text-green-400",
  },
  current: {
    icon: <Clock size={22} />,
    iconBg: "bg-blue-500 animate-pulse",
    line: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    title: "text-blue-600 dark:text-blue-400",
  },
  upcoming: {
    icon: <Circle size={20} />,
    iconBg: "bg-gray-400",
    line: "bg-gray-300 dark:bg-gray-700",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    title: "text-gray-500 dark:text-gray-400",
  },
};

const TimelineMilestone = ({
  title,
  date,
  status = "upcoming",
  description = "",
  isLast = false,
}) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.upcoming;

  return (
    <div className="flex items-start gap-4 relative">

      {/* Timeline Line */}
      {!isLast && (
        <div
          className={`absolute left-[17px] top-10 w-1 h-full ${style.line}`}
        />
      )}

      {/* Timeline Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md z-10 ${style.iconBg}`}
      >
        {style.icon}
      </div>

      {/* Timeline Content */}
      <div className="flex-1 pb-8">

        <div className="flex flex-wrap items-center gap-2">

          <h3
            className={`font-semibold text-lg ${style.title}`}
          >
            {title}
          </h3>

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${style.badge}`}
          >
            {status}
          </span>

        </div>

        {date && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            📅 {date}
          </p>
        )}

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
            {description}
          </p>
        )}

      </div>
    </div>
  );
};

export default TimelineMilestone;