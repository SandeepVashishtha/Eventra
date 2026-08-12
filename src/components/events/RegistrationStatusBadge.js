import { CheckCircle, XCircle } from "lucide-react";
import { getRegistrationStatus } from "../../utils/registrationDeadlineUtils";

const RegistrationStatusBadge = ({ deadline }) => {
  const status = getRegistrationStatus(deadline);

  const isOpen = status === "Registration Open";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isOpen
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      }`}
    >
      {isOpen ? (
        <CheckCircle size={14} />
      ) : (
        <XCircle size={14} />
      )}

      {status}
    </span>
  );
};

export default RegistrationStatusBadge;