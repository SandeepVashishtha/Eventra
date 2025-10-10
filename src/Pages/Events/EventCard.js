import { motion } from "framer-motion";
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

const EventCard = ({ event }) => {
  // Array of icons to choose from
  const icons = [
    <Star size={20} className="text-yellow-500" />,
    <Heart size={20} className="text-red-500" />,
    <Zap size={20} className="text-purple-500" />,
    <BookOpen size={20} className="text-indigo-500" />,
    <Gift size={20} className="text-pink-500" />,
  ];

  // Pick a random icon each render
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  
  // Generate sharing data for this event
  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id
  });

  return (
    <motion.div
      // AOS Implementation
      data-aos="zoom-in"
      data-aos-duration="1000"
      // Removed Framer Motion initial/animate/transition to prevent conflicts with parent container animation
      className="group relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-gray-900 dark:via-indigo-950/40 dark:to-purple-950/20 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl border border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-500 flex flex-col card-with-floating-elements"
      whileHover={{ 
        y: -8, 
        rotateX: 2,
        rotateY: 2,
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Animated gradient border overlay */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-sm -z-10"></div>
      
      {/* Action buttons container positioned at the top-right of the entire card */}
      <div className="absolute top-2 right-2 z-[200] flex space-x-2">
        {/* Share Menu */}
        <ShareMenu 
          shareData={eventSharingData} 
          position="bottom-right"
          menuClassName="!z-[999] shadow-2xl"
          buttonClassName=""
        >
          <motion.div 
            className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 group/share share-button-pop share-button-float"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Share2 size={18} className="text-gray-600" />
            
            {/* Tooltip */}
            <div className="absolute invisible group-hover/share:visible opacity-0 group-hover/share:opacity-100 transition-opacity duration-300 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              Share Event
            </div>
          </motion.div>
        </ShareMenu>
        
        {/* Google Calendar button */}
        <a 
          href={addEventToGoogleCalendar(event)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Add to Google Calendar"
          className="group/cal"
        >
          <motion.div 
            className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 share-button-pop share-button-float"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Calendar size={18} className="text-gray-600" />
            
            {/* Tooltip */}
            <div className="absolute invisible group-hover/cal:visible opacity-0 group-hover/cal:opacity-100 transition-opacity duration-300 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              Add to Google Calendar
            </div>
          </motion.div>
        </a>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-20 group-hover:animate-pulse"></div>
        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 group-hover:animate-bounce"></div>
        <div className="absolute bottom-4 right-1/4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:animate-ping"></div>
      </div>

      {/* --- Enhanced Header --- */}
      <div className="flex items-center px-8 py-6 gap-4 bg-gradient-to-r from-white/80 to-indigo-50/60 dark:from-gray-900/80 dark:to-indigo-950/60 border-b border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm">
        <motion.div 
          className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-indigo-900 rounded-2xl shadow-inner"
          whileHover={{ 
            scale: 1.1, 
            rotate: 10,
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {randomIcon}
        </motion.div>
        <h3 className="text-gray-800 dark:text-gray-100 font-bold text-xl truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          {event.title}
        </h3>
        <div className="ml-auto">
          {event.status === "upcoming" && (
            <motion.span 
              className="text-xs px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/60 dark:to-purple-900/60 text-indigo-700 dark:text-indigo-300 rounded-full font-medium shadow-sm border border-indigo-200/50 dark:border-indigo-700/50"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Upcoming
            </motion.span>
          )}
        </div>
      </div>

      {/* --- Enhanced Event Image --- */}
      <div className="relative h-64 card-content-overflow">
        <motion.img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.7 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
      </div>

      {/* --- Enhanced Description --- */}
      <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-indigo-50/30 dark:to-indigo-950/30">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
          {event.description}
        </p>
      </div>

      {/* --- Enhanced Info Section --- */}
      <div className="px-8 py-6 grid grid-cols-2 gap-6 text-gray-700 dark:text-gray-300 text-sm bg-gradient-to-br from-gray-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/30">
        <motion.div 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300"
          whileHover={{ x: 2 }}
        >
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <MapPin size={16} className="text-pink-500" />
          </div>
          <span className="truncate font-medium">{event.location}</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300"
          whileHover={{ x: 2 }}
        >
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock size={16} className="text-blue-500" />
          </div>
          <span className="font-medium">{event.time}</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300"
          whileHover={{ x: 2 }}
        >
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Tag size={16} className="text-purple-500" />
          </div>
          <span className="font-medium">{event.type}</span>
        </motion.div>
        
        

        <motion.div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300"
          whileHover={{ x: 2 }} 
          >
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Calendar size={16} className="text-indigo-500" />
          </div>
          <span className="font-medium">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </motion.div>
      </div>

      {/* --- Enhanced CTA Buttons --- */}
      <div className="px-8 py-6 flex gap-4 bg-gradient-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60">
        <Link
          to={`/events/${event.id}`}
          className="group/btn flex-1"
        >
          <motion.div
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            <span className="relative">Register Now</span>
          </motion.div>
        </Link>
        
        <Link
          to={`/events/${event.id}`}
          className="group/btn flex-1"
        >
          <motion.div
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full backdrop-blur-sm"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative">View Details</span>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;