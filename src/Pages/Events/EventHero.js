import { Search, X, Rocket, Users, Award, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventHero({
  searchQuery,
  handleSearch,
  filteredEvents,
  scrollToCard,
}) {
  const floatingCircles = [
    { size: 42, x: 20, y: 90, color: "#dbeafe" },
    { size: 56, x: 130, y: 40, color: "#bfdbfe" },
    { size: 30, x: 260, y: 150, color: "#dcfce7" },
    { size: 50, x: 390, y: 70, color: "#bae6fd" },
    { size: 26, x: 520, y: 170, color: "#fbcfe8" },
    { size: 48, x: 640, y: 40, color: "#fed7aa" },
    { size: 34, x: 720, y: 150, color: "#e9d5ff" },
    { size: 58, x: 70, y: 330, color: "#fecdd3" },
    { size: 28, x: 220, y: 430, color: "#bbf7d0" },
    { size: 64, x: 420, y: 360, color: "#fde68a" },
    { size: 32, x: 620, y: 440, color: "#bae6fd" },
    { size: 30, x: 760, y: 320, color: "#fecaca" },
    { size: 24, x: 120, y: 560, color: "#c7d2fe" },
    { size: 38, x: 360, y: 620, color: "#fbcfe8" },
    { size: 30, x: 680, y: 560, color: "#bbf7d0" },
  ];

  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {floatingCircles.map((circle, idx) => (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              width: circle.size,
              height: circle.size,
              top: circle.y,
              left: circle.x,
              backgroundColor: circle.color,
              opacity: 0.28,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center z-10">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight px-4 sm:px-0 text-black"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Discover <span className="text-black">Amazing Events</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
          "Discover exciting events, compete with talented participants, learn
          new skills, and <span className="font-semibold text-black dark:text-white">win amazing rewards</span>."
        </p>

        <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 px-4 sm:px-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center z-10 pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 transition-colors" />
            </div>

            <input
              type="text"
              placeholder="Search events by name, location, or tags..."
              className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3 px-2">
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {["AI", "Blockchain", "Web", "DevOps", "React", "UX", "Development"].map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="px-2 sm:px-3 py-1 text-xs font-medium text-black dark:text-white bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-black dark:text-white font-semibold whitespace-nowrap">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 flex justify-center gap-3 sm:gap-5 flex-wrap px-4 sm:px-0">
          <button
            className="relative px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold text-black shadow-lg overflow-hidden group bg-blue-100 hover:bg-blue-200 transition-all duration-300"
            onClick={scrollToCard}
          >
            <span className="relative flex items-center">
              <Rocket className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Explore Events
            </span>
          </button>

          <button
            onClick={() => navigate("/create-event")}
            className="relative px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium text-black shadow-md hover:shadow-lg bg-green-100 hover:bg-green-200 transition-all duration-300"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Host an Event
            </span>
          </button>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20 mb-8 sm:mb-12 md:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {[
          {
            label: "Events Hosted",
            value: "120+",
            icon: Rocket,
            cardBg: "from-blue-50 to-white",
            iconBg: "from-blue-200 to-blue-100",
            iconColor: "text-blue-700",
            glow: "from-blue-300/20 to-blue-400/10",
          },
          {
            label: "Active Participants",
            value: "50k+",
            icon: Users,
            cardBg: "from-green-50 to-white",
            iconBg: "from-green-200 to-green-100",
            iconColor: "text-green-700",
            glow: "from-green-300/20 to-green-400/10",
          },
          {
            label: "Projects Created",
            value: "8k+",
            icon: Code2,
            cardBg: "from-yellow-50 to-white",
            iconBg: "from-yellow-200 to-yellow-100",
            iconColor: "text-yellow-700",
            glow: "from-yellow-300/20 to-yellow-400/10",
          },
          {
            label: "Total Prizes",
            value: "$1M+",
            icon: Award,
            cardBg: "from-pink-50 to-white",
            iconBg: "from-pink-200 to-pink-100",
            iconColor: "text-pink-700",
            glow: "from-pink-300/20 to-pink-400/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`relative bg-gradient-to-br ${stat.cardBg} dark:from-gray-800 dark:to-gray-800 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300`}
          >
            <div className={`mb-3 sm:mb-4 flex items-center justify-center h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-tr ${stat.iconBg} shadow-md`}>
              <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.iconColor}`} />
            </div>

            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>

            <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${stat.glow} dark:from-gray-500/20 dark:to-gray-600/10 blur-2xl opacity-40 -z-10`} />
          </div>
        ))}
      </div>
    </div>
  );
}
