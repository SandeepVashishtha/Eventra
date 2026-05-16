import { useEffect } from "react"; 
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Star,
  Heart,
  Zap,
  BookOpen,
  Gift,
  Share2,
} from "lucide-react";
import { addEventToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";

import CountdownTimer from "../../components/CountdownTimer"; // 👈 Yeh sahi path hai!
const EventCard = ({ event }) => {
  const icons = [
    <Star size={20} className="text-yellow-500" />,
    <Heart size={20} className="text-red-500" />,
    <Zap size={20} className="text-pink-500" />,
    <BookOpen size={20} className="text-indigo-500" />,
    <Gift size={20} className="text-pink-500" />,
  ];

  const randomIcon = icons[Math.floor(Math.random() * icons.length)];

  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id,
  });

  const handleCopyLink = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/events/${event.id}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Event link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <div
      data-aos="zoom-in"
      data-aos-duration="1000"
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl   
      backdrop-blur-sm transition-all duration-500 flex flex-col card-with-floating-elements z-10 hover:z-50"
    >
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-90 transition-opacity duration-500 bg-black/10 -z-10"></div>

      {/* Action buttons */}
      <div className="absolute top-24 right-4 z-[200] flex space-x-2">
        <ShareMenu shareData={eventSharingData} position="above" menuClassName="!z-[999] shadow-2xl">
          <div className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 group/share share-button-pop share-button-float">
            <Share2 size={18} className="text-gray-600" />
          </div>
        </ShareMenu>

        <div onClick={handleCopyLink} className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 group/copy share-button-pop share-button-float relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </div>

        <a href={addEventToGoogleCalendar(event)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="group/cal">
          <div className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 share-button-pop share-button-float">
            <Calendar size={18} className="text-gray-600" />
          </div>
        </a>
      </div>

      {/* Header with Countdown */}
      <div className="flex flex-col px-8 py-6 gap-2 bg-gradient-to-r from-white/80 to-indigo-50/60 dark:from-gray-900/80 dark:to-indigo-950/60 border-b border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 w-full">
          <div className="p-3 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-inner shrink-0">
            {randomIcon}
          </div>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-xl truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 flex-1">
            {event.title}
          </h3>
          <div className="ml-auto shrink-0">
            {event.status === "upcoming" && (
              <span className="text-xs px-4 py-2 bg-gradient-to-r from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                Upcoming
              </span>
            )}
          </div>
        </div>
        
        {/* Live Timer */}
        <div className="mt-2 w-full">
          <CountdownTimer targetDate={event.date} />
        </div>
      </div>

      {/* Event Image */}
      <div className="relative h-64 card-content-overflow">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
      </div>

      {/* Description */}
      <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-indigo-50/30 dark:to-indigo-950/30">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {event.description}
        </p>
      </div>

      {/* Info Section */}
      <div className="px-8 py-6 grid grid-cols-2 gap-6 text-gray-700 dark:text-gray-300 text-sm bg-gradient-to-br from-gray-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/30">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg"><MapPin size={16} className="text-pink-500" /></div>
          <span className="truncate font-medium">{event.location}</span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Clock size={16} className="text-blue-500" /></div>
          <span className="font-medium">{event.time}</span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg"><Tag size={16} className="text-green-500" /></div>
          <span className="font-medium">{event.type}</span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Calendar size={16} className="text-indigo-500" /></div>
          <span className="font-medium">
            {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-8 py-6 flex gap-4 bg-gradient-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 mt-auto">
        <Link to={`/events/${event.id}/register`} className="group/btn flex-1">
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black text-white px-6 py-3 text-sm font-bold shadow-lg hover:bg-zinc-800 hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            <span className="relative">Register Now</span>
          </div>
        </Link>

        <Link to={`/events/${event.id}`} className="group/btn flex-1">
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full backdrop-blur-sm">
            <span className="relative">View Details</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;