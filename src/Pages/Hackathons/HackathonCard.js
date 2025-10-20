import { motion } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { addHackathonToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";

const HackathonCard = ({ hackathon, isFeatured = false, ...props }) => {
  const stats = {
    participants: hackathon.status === "live" ? hackathon.participants : 0,
    teams: hackathon.status === "live" ? hackathon.teams : 0,
    submissions: hackathon.status === "live" ? hackathon.submissions : 0,
  };

  // Generate sharing data for this hackathon
  const hackathonSharingData = generateEventSharingData({
    ...hackathon,
    title: hackathon.title,
    description: hackathon.description,
    date: hackathon.startDate,
    id: hackathon.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 15, scale: 0.95 }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      viewport={{ once: true, amount: 0.3 }} // triggers when 30% visible
      whileHover={{ y: -4, scale: 1.02 }} // keeps your hover lift effect
      className={`bg-gradient-to-br from-white to-white dark:from-gray-800 dark:to-black rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-indigo-300 dark:border-gray-700 relative card-with-floating-elements ${
        isFeatured ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : ""
      }`}
      {...props}
    >
      {/* Featured Ribbon */}
      {isFeatured && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          Featured
        </div>
      )}

      {/* Share button in top-right corner */}
      <div className="absolute -top-4 -right-4 z-[200]">
        <ShareMenu
          shareData={hackathonSharingData}
          position="bottom-right"
          menuClassName="!z-[999] shadow-2xl"
          buttonClassName=""
        >
          <motion.div
            className="
  bg-white dark:bg-gray-800 
  rounded-full p-3 
  shadow-lg cursor-pointer hover:shadow-xl 
  border border-gray-200 dark:border-gray-600 
  group/share
"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ShareIcon className="w-4 h-4 text-gray-400" />

            {/* Tooltip */}
            <div className="absolute invisible group-hover/share:visible opacity-0 group-hover/share:opacity-100 transition-opacity duration-300 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
              Share Hackathon
            </div>
          </motion.div>
        </ShareMenu>
      </div>

      <div className="p-6 flex flex-col gap-5 min-h-[500px]">
        {/* Header: Status, Difficulty, Prize */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              // UPDATED: Status tag colors
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                hackathon.status === "live"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                  : hackathon.status === "upcoming"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              }`}
            >
              {hackathon.status.charAt(0).toUpperCase() +
                hackathon.status.slice(1)}
            </span>
            {/* UPDATED: Difficulty tag colors */}
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-xs font-medium">
              {hackathon.difficulty}
            </span>
          </div>
          <span className="text-white text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 animate-gradient">
            {hackathon.prize}
          </span>
        </div>

        {/* Divider */}
        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Title & Description */}
        <div>
          {/* UPDATED: Text colors */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {hackathon.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {hackathon.description}
          </p>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Organizer */}
        {/* UPDATED: Text color */}
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm gap-1.5">
          <BuildingLibraryIcon className="w-4 h-4 text-purple-500" />
          <span>{hackathon.organizer}</span>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Date & Location */}
        {/* UPDATED: Text color */}
        <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-red-500" />
            {new Date(hackathon.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(hackathon.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-green-500" />
            {hackathon.location}
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Time Left:</span>{" "}
            {hackathon.status === "live"
              ? hackathon.timeLeft
              : hackathon.status === "upcoming"
              ? "Starts Soon"
              : "Ended"}
          </div>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Tech Stack */}
        <div>
          {/* UPDATED: Text color */}
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tech Stack:
          </h4>
          <div className="flex flex-wrap gap-2">
            {hackathon.techStack.map((tech, index) => (
              <span
                key={index}
                // UPDATED: Tech tag colors
                className="px-3 py-1 border border-indigo-300 dark:border-indigo-700 bg-indigo-100 dark:bg-indigo-900/60 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Rules */}
        {/* UPDATED: Text colors */}
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <h4 className="font-medium mb-1 flex items-center gap-1.5">
            <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
            Rules
          </h4>
          <ul className="list-disc list-inside text-xs line-clamp-3">
            {hackathon.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Stats */}
        {/* UPDATED: Background and text colors */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg min-h-[60px]">
          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-500">
              {stats.participants || "--"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Participants
            </div>
          </div>
          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-green-500 mx-auto mb-1 rotate-90" />
            <div className="text-lg font-bold text-green-500">
              {stats.teams || "--"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Teams
            </div>
          </div>
          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-500">
              {stats.submissions || "--"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Submissions
            </div>
          </div>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Winner */}
        {/* UPDATED: Background, border, and text colors */}
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/40 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 min-h-[48px]">
          <TrophyIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium">Winner:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {hackathon.status === "completed" && hackathon.winner
              ? hackathon.winner
              : "Announced soon"}
          </span>
        </div>

        {/* UPDATED: Divider color */}
        <div className="border-b border-gray-400 dark:border-gray-700" />

        {/* Action Buttons */}
        <div className="pt-3">
          {hackathon.status === "live" ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors">
                Join Now
              </button>
              {/* UPDATED: Secondary button colors */}
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Submit Project
              </button>
            </div>
          ) : hackathon.status === "upcoming" ? (
            <div className="grid grid-cols-1 gap-3">
              {/* Action buttons row */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors">
                  Register
                </button>

                {/* Google Calendar integration */}
                <a
                  href={addHackathonToGoogleCalendar(hackathon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group/calendar relative"
                  onClick={(e) => e.stopPropagation()}
                  title="Add to Google Calendar"
                >
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                    <span className="hidden sm:inline">Set Reminder</span>
                  </button>

                  {/* Tooltip */}
                  <div className="absolute invisible group-hover/calendar:visible opacity-0 group-hover/calendar:opacity-100 transition-opacity duration-300 -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                    Add to Google Calendar
                  </div>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-400 text-white text-sm font-medium rounded-lg hover:from-indigo-400 hover:to-indigo-700 transition-colors">
                View Results
              </button>
              {/* UPDATED: Secondary button colors */}
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Resources
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonCard;
