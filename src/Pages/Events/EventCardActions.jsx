import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const EventCardActions = ({ event }) => {
  return (
    <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60">

      <Link to={`/events/${event.id}/register`} className="group/btn">
        <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black text-white px-6 py-3 text-sm font-bold shadow-lg hover:bg-zinc-800 hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          <span className="relative">Register Now</span>
        </div>
      </Link>

      <Link to={`/events/${event.id}`} className="group/btn">
        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full backdrop-blur-sm">
          <span className="relative">View Details</span>
        </div>
      </Link>

      <a
        href={`mailto:${event.contactEmail}?subject=Inquiry about ${event.title}`}
        className="group/btn"
      >
        <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white px-6 py-3 text-sm font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300 w-full">
          <Mail size={16} />
          <span>Contact Now</span>
        </div>
      </a>

    </div>
  );
};

export default EventCardActions;