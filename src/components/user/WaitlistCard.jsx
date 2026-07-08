// src/components/user/WaitlistCard.jsx
import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import LazyImage from "../common/LazyImage";

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: prefersReducedMotion ? 0 : i * 0.06,
      duration: prefersReducedMotion ? 0 : 0.4,
      ease: "easeOut",
    },
  }),
});

const WaitlistCard = memo(({ event, index, onLeaveWaitlist }) => {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const { user } = useAuth();
  const [queuePos, setQueuePos] = useState(-1);

  useEffect(() => {
    if (!user) return;
    import("../../utils/waitlistUtils")
      .then(({ getQueuePosition }) => {
        setQueuePos(getQueuePosition(event.id, user.id || user.email));
      })
      .catch(() => setQueuePos(-1));
  }, [event.id, user]);

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] flex flex-col z-10 overflow-hidden"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="16/9"
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
      <div className="px-6 py-4 flex-1">
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[56px] leading-snug mb-1">
          {event.title}
        </h4>
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} /> {event.date || "TBD"}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} /> {event.location || "Online"}
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          Waitlist Position #{queuePos > 0 ? queuePos : "..."}
        </span>
        <button
          onClick={() => onLeaveWaitlist(event.id)}
          className="text-xs font-bold text-red-650 hover:text-red-750 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
        >
          Leave Waitlist
        </button>
      </div>
    </motion.div>
  );
});

WaitlistCard.displayName = "WaitlistCard";

export default WaitlistCard;