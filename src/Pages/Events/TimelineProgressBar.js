import { CheckCircle, Clock, Circle } from "lucide-react";

const TimelineProgressBar = ({ milestones = [] }) => {
  const getIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={22} className="text-white" />;
      case "current":
        return <Clock size={22} className="text-white animate-pulse" />;
      default:
        return <Circle size={20} className="text-white" />;
    }
  };

  const getCircleColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const getLineColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      default:
        return "bg-gray-300 dark:bg-gray-700";
    }
  };

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex items-start justify-between min-w-[700px]">

        {milestones.map((milestone, index) => (
          <div
            key={index}
            className="flex items-center flex-1"
          >
            {/* Timeline Node */}
            <div className="flex flex-col items-center">

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${getCircleColor(
                  milestone.status
                )}`}
              >
                {getIcon(milestone.status)}
              </div>

              <h4 className="mt-3 text-sm font-semibold text-center text-slate-800 dark:text-slate-100">
                {milestone.title}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {milestone.date}
              </p>

              <span
                className={`mt-2 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  milestone.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : milestone.status === "current"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {milestone.status}
              </span>
            </div>

            {/* Connecting Line */}
            {index < milestones.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${getLineColor(
                  milestone.status
                )}`}
              />
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

export default TimelineProgressBar;