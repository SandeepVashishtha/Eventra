import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  isInterested,
  addInterestedEvent,
  removeInterestedEvent,
} from "../../utils/interestTrackerUtils";

const InterestedButton = ({ event }) => {
  const [interested, setInterested] = useState(false);

  useEffect(() => {
    if (event?.id) {
      setInterested(isInterested(event.id));
    }
  }, [event]);

  const handleToggle = () => {
    if (!event) return;

    if (interested) {
      removeInterestedEvent(event.id);
      setInterested(false);
    } else {
      addInterestedEvent(event);
      setInterested(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm
      ${
        interested
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
      }`}
    >
      <Heart
        size={18}
        fill={interested ? "currentColor" : "none"}
      />

      {interested ? "Interested" : "Mark Interested"}
    </button>
  );
};

export default InterestedButton;