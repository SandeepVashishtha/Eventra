import {
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getCapacityStatus } from "../../utils/eventCapacityUtils";

const CapacityStatusBadge = ({
  capacity = 0,
  registered = 0,
  threshold = 90,
}) => {
  const status = getCapacityStatus(
    capacity,
    registered,
    threshold
  );

  const config = {
    Available: {
      icon: CheckCircle,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    "Almost Full": {
      icon: AlertTriangle,
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    Full: {
      icon: XCircle,
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  };

  const current = config[status] || config.Available;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
      role="status"
      aria-label={`Event capacity status: ${status}`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
};

export default CapacityStatusBadge;