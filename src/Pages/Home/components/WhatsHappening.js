import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";

// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";

const WhatsHappening = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Combine and format events and hackathons data
  const formatEventsData = (events) => {
    return events
      .filter(event => event.status !== 'past')
      .map(event => ({
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        date: new Date(event.date).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        type: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        status: event.status === 'upcoming' ? 'Registration Open' : 'Live Event',
        link: "/events",
        featured: event.attendees > 200,
        location: event.location,
        attendees: event.attendees
      }));
  };

  const formatHackathonsData = (hackathons) => {
    return hackathons
      .filter(hackathon => hackathon.status !== 'ended')
      .map(hackathon => ({
        id: `hackathon-${hackathon.id}`,
        title: hackathon.title,
        description: hackathon.description,
        date: `${new Date(hackathon.startDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${new Date(hackathon.endDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}`,
        type: "Hackathon",
        status: hackathon.status === 'live' ? 'Live Now' : 'Registration Open',
        link: "/hackathons",
        featured: hackathon.prize && parseInt(hackathon.prize.replace(/[$,]/g, '')) > 30000,
        location: hackathon.location,
        prize: hackathon.prize,
        participants: hackathon.participants
      }));
  };

  // Combine all events and hackathons
  const upcomingEvents = [
    ...formatEventsData(eventsData),
    ...formatHackathonsData(hackathonsData)
  ].sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

  // UPDATED: Added dark mode classes for all statuses
  const statusColors = {
    "Registration Open":
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    "Coming Soon":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    "Live Now":
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    "Live Event":
      "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    Planning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  };

  // Auto-slide functionality - now moves 3 cards at a time
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 3) % upcomingEvents.length);
  }, [upcomingEvents.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => {
      const newIndex = prev - 3;
      return newIndex < 0 ? Math.max(0, upcomingEvents.length - 3) : newIndex;
    });
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || upcomingEvents.length <= 3) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2500); // Change slide every 2.5 seconds (faster)

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, upcomingEvents.length]);

  // Resume auto-play after 10 seconds of no interaction
  useEffect(() => {
    if (isAutoPlaying) return;

    const timeout = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isAutoPlaying]);

  const cardVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 300 : -300, // Increased distance for 3-card layout
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -300 : 300, // Increased distance for 3-card layout
    }),
  };

  return (
    // UPDATED: Section background
    <section
      ref={ref}
      className="py-12 sm:py-16 bg-gradient-to-t from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* UPDATED: Text colors */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            What's Happening Now
          </h2>
          <p className="mt-2 sm:mt-3 max-w-xl mx-auto text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            Stay updated with {upcomingEvents.length} upcoming events, community programs, and
            opportunities to contribute to Eventra
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Auto-play indicator */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 rounded-full bg-white/90 dark:bg-gray-700/90 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              title={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
            >
              {isAutoPlaying ? (
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 4.1l8.4 5.4c.4.3.4.8 0 1l-8.4 5.4c-.5.3-1.1-.1-1.1-.6V4.7c0-.5.6-.9 1.1-.6z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 z-10 text-gray-700 dark:text-gray-200 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </button>

          <button
            onClick={() => {
              setDirection(1);
              setCurrent((prev) => (prev + 3) % upcomingEvents.length);
              setIsAutoPlaying(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 z-10 text-gray-700 dark:text-gray-200 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Cards Container */}
          <div 
            className="overflow-hidden px-16"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={Math.floor(current / 3)}
                variants={cardVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) {
                    prevSlide();
                  } else if (info.offset.x < -100) {
                    setDirection(1);
                    setCurrent((prev) => (prev + 3) % upcomingEvents.length);
                    setIsAutoPlaying(false);
                  }
                }}
              >
                {/* Show 3 cards at a time */}
                {upcomingEvents.slice(current, current + 3).concat(
                  current + 3 > upcomingEvents.length 
                    ? upcomingEvents.slice(0, (current + 3) % upcomingEvents.length)
                    : []
                ).slice(0, 3).map((event, index) => (
                  <div
                    key={event.id}
                    className={`flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-black/60 transform hover:scale-105 ${
                      event.featured
                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400"
                        : "border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            statusColors[event.status] ||
                            "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {event.status}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {event.type}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex-1 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">
                        {event.description}
                      </p>

                      {/* Additional info for hackathons */}
                      {event.prize && (
                        <div className="flex items-center text-xs sm:text-sm text-purple-600 dark:text-purple-400 mb-2">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          {event.prize}
                        </div>
                      )}

                      {/* Participants/Attendees info */}
                      {(event.participants || event.attendees) && (
                        <div className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-2">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                          </svg>
                          {event.participants 
                            ? `${event.participants} participants`
                            : `${event.attendees} attendees`
                          }
                        </div>
                      )}

                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
                            00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {event.date}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
                      <a
                        href={event.link}
                        className={`w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium transition-colors ${
                          event.featured
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 border-indigo-100 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600"
                        }`}
                        target={
                          event.link.startsWith("http")
                            ? "_blank"
                            : "_self"
                        }
                        rel={
                          event.link.startsWith("http")
                            ? "noopener noreferrer"
                            : ""
                        }
                      >
                        {event.featured ? "Join Now" : "Learn More"}
                        <svg
                          className="ml-1 sm:ml-2 -mr-1 w-3 h-3 sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 
                            4a1 1 0 010 1.414l-4 4a1 1 
                            0 01-1.414-1.414L12.586 11H5a1 
                            1 0 110-2h7.586l-2.293-2.293a1 
                            1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots with progress indicator - Updated for 3-card pagination */}
        <div className="flex justify-center items-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(upcomingEvents.length / 3) }, (_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrent(index * 3);
                setDirection(index * 3 > current ? 1 : -1);
                setIsAutoPlaying(false);
              }}
              className="relative group"
            >
              <div
                className={`w-8 h-2.5 sm:w-10 sm:h-3 rounded-full transition-colors duration-300 ${
                  Math.floor(current / 3) === index
                    ? "bg-indigo-600 dark:bg-indigo-400"
                    : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
                }`}
              />
              {/* Auto-play progress indicator for current slide group */}
              {Math.floor(current / 3) === index && isAutoPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-indigo-600 dark:border-indigo-400">
                  <div 
                    className="w-full h-full rounded-full bg-indigo-600/20 dark:bg-indigo-400/20"
                    style={{
                      animation: 'progress 2.5s linear infinite'
                    }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Add progress animation keyframes - Updated timing */}
        <style jsx>{`
          @keyframes progress {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1.2);
            }
          }
        `}</style>

        {/* Info Section */}
        <motion.div
          // UPDATED: Info box background
          className="mt-12 sm:mt-16 bg-indigo-50 dark:bg-gray-800 rounded-xl p-6 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1 md:pr-8">
              {/* UPDATED: Text colors */}
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Eventra is participating in GirlScript Summer of Code 2025!
              </h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                We're excited to mentor contributors and welcome new developers
                to our open-source community. Join us in building the future of
                event management!
              </p>
            </div>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:space-x-4 gap-2 sm:gap-0">
              {/* Primary button is fine for both themes */}
              <a
                href="https://gssoc.girlscript.tech/"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply to GSSOC
              </a>
              {/* UPDATED: Secondary button styles */}
              <a
                href="https://github.com/sandeepvashishtha/Eventra/issues"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-sm sm:text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Issues
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsHappening;
