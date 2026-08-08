import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import CalendarOptionsModal from "./CalendarOptionsModal";

const CalendarExportButton = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!event) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all duration-300"
      >
        <CalendarPlus size={18} />
        Add to Calendar
      </button>

      {isOpen && (
        <CalendarOptionsModal
          event={event}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default CalendarExportButton;