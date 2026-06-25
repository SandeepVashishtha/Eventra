import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "No Data Found",
  description = "There is nothing to display right now.",
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox size={48} className="text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
