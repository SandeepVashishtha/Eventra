import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { HomeCardSkeleton } from "../../../components/common/SkeletonLoaders";
import { CheckCircle2, Hourglass } from "lucide-react";

import useReducedMotion from "../../../hooks/useReducedMotion.js";
// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";

const WhatsHappening = () => {
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsAutoPlaying(false);
    }
  }, [prefersReducedMotion]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const formatEventsData = (events) => {
    return events
      .filter((event) => new Date(event.date) >= new Date())
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        rawDate: event.date,
        type: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        status:
          event.status === "upcoming" ? "Registration Open" : "Live Event",
        link: `/events/${event.id}`,
        featured: event.attendees > 200,

        location: event.location,
        attendees: event.attendees,
        timeLeft: `${Math.ceil(
       (new Date(event.rawDate || event.date) - new Date()) /(1000 * 60 * 60 * 24))} days`,
      }));
  };

  const formatHackathonsData = (hackathons) => {
    return hackathons
      .filter((hackathon) => hackathon.status !== "ended")
      .map((hackathon) => ({
        id: `hackathon-${hackathon.id}`,
        title: hackathon.title,
        description: hackathon.description,

        timeLeft:
  new Date(hackathon.endDate) < new Date()
    ? "Ended"
    : `${Math.ceil(
        (new Date(hackathon.startDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      )} days`,
        
        date: `${new Date(hackathon.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${new Date(hackathon.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        rawDate: hackathon.startDate,
        type: "Hackathon",
        status: hackathon.status === "live" ? "Live Now" : "Registration Open",
        link: `/hackathons/${hackathon.id}`,
        featured:
          hackathon.prize &&
          parseInt(hackathon.prize.replace(/[$,]/g, "")) > 30000,
        location: hackathon.location,
        prize: hackathon.prize,
        participants: hackathon.participants,
      }));
  };

  const upcomingEvents = [
    ...formatEventsData(eventsData),
    ...formatHackathonsData(hackathonsData),
  ].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));


  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + cardsPerView) % upcomingEvents.length);
  }, [upcomingEvents.length, cardsPerView]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => {
      const newIndex = prev - cardsPerView;
      return newIndex < 0
        ? Math.max(0, upcomingEvents.length - cardsPerView)
        : newIndex;
    });
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        nextSlide();
      }, 2500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, nextSlide]);

  useEffect(() => {
    if (isAutoPlaying) return;
    const timeout = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isAutoPlaying]);

  const cardVariants = {
    enter: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : (dir > 0 ? 300 : -300) }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : (dir > 0 ? -300 : 300) }),
  };

  const activeDotIndex =
    Math.floor(current / cardsPerView) %
    Math.ceil(upcomingEvents.length / cardsPerView);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 text-slate-900 dark:text-gray-100 border-t border-slate-200/50 dark:border-slate-800/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            What's Happening Now
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Stay updated with {upcomingEvents.length} upcoming events, community
            programs, and opportunities to contribute to Eventra
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Play/Pause Button */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 shadow-md backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
            >
              {isAutoPlaying ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 4.1l8.4 5.4c.4.3.4.8 0 1l-8.4 5.4c-.5.3-1.1-.1-1.1-.6V4.7c0-.5.6-.9 1.1-.6z" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800 shadow-lg hover:bg-white dark:hover:bg-slate-800 z-10 text-slate-700 dark:text-slate-250 transition-all hover:scale-105"
            aria-label="Previous events"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            onClick={() => {
              setDirection(1);
              setCurrent(
                (prev) => (prev + cardsPerView) % upcomingEvents.length,
              );
              setIsAutoPlaying(false);
            }}
            className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800 shadow-lg hover:bg-white dark:hover:bg-slate-800 z-10 text-slate-700 dark:text-slate-250 transition-all hover:scale-105"
            aria-label="Next events"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Content Area */}
          <div
            className="overflow-hidden px-4 sm:px-8 py-5"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={Math.floor(current / cardsPerView)}
                variants={cardVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto relative z-10"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) {
                    prevSlide();
                  } else if (info.offset.x < -100) {
                    setDirection(1);
                    setCurrent(
                      (prev) => (prev + cardsPerView) % upcomingEvents.length,
                    );
                    setIsAutoPlaying(false);
                  }
                }}
              >
                {isLoading
                  ? [...Array(cardsPerView)].map((_, i) => (
                      <HomeCardSkeleton key={`skeleton-${i}`} />
                    ))
                  : upcomingEvents
                      .slice(current, current + cardsPerView)
                      .concat(
                        current + cardsPerView > upcomingEvents.length
                          ? upcomingEvents.slice(
                              0,
                              (current + cardsPerView) % upcomingEvents.length,
                            )
                          : [],
                      )
                      .slice(0, cardsPerView)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="group relative w-full flex flex-col rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 p-5 sm:p-6 shadow-md shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all duration-300 flex-1 min-h-[340px] pointer-events-auto"
                          onMouseEnter={() => setIsAutoPlaying(false)}
                          onMouseLeave={() => setIsAutoPlaying(true)}
                        >
                          {/* Card Content */}
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-4 gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  event.status === "Live Now" || event.status === "Live Event"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    : event.status === "Registration Open"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {event.status}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                {event.type}
                              </span>
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {event.title}
                            </h3>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                              {event.description}
                            </p>

                            <div className="flex flex-wrap gap-2.5 mb-4">
                              {event.prize && (
                                <div className="inline-flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/10">
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.251-.11a3.375 3.375 0 000-6.166l-.251-.1a3.375 3.375 0 000 6.166zm6 0l.251-.11a3.375 3.375 0 000-6.166l-.251-.1a3.375 3.375 0 000 6.166z" />
                                  </svg>
                                  {event.prize}
                                </div>
                              )}

                              {(event.participants || event.attendees) && (
                                <div className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-xl border border-indigo-500/10">
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0112.75 21.5h-1.5a2.25 2.25 0 01-2.25-2.263V19.13m-2.625.372A9.336 9.336 0 011.5 18.552a4.125 4.125 0 017.533-2.493m0 0a9.38 9.38 0 012.625.372 9.336 9.336 0 004.121-.952m-4.121.952v-.002c0-1.113-.285-2.16-.786-3.07M9 10.125c0 .621.504 1.125 1.125 1.125h1.75c.621 0 1.125-.504 1.125-1.125V8.875c0-.621-.504-1.125-1.125-1.125h-1.75C9.504 7.75 9 8.254 9 8.875v1.25z" />
                                  </svg>
                                  {event.participants ? `${event.participants} participants` : `${event.attendees} attendees`}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                              <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                <svg className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                {event.date}
                              </div>

                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20">
                                {event.timeLeft === "Ended" ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Ended
                                  </>
                                ) : (
                                  <>
                                    <Hourglass className="w-3.5 h-3.5" /> {event.timeLeft}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            to={event.link}
                            className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-white dark:text-indigo-300 text-sm font-semibold transition-all duration-200 border border-transparent dark:border-indigo-500/20 hover:scale-[1.02]"
                          >
                            {event.featured ? "Register Now" : "Learn More"}
                            <svg className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </Link>
                        </div>
                      ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          {Array.from(
            { length: Math.ceil(upcomingEvents.length / cardsPerView) },
            (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrent(index * cardsPerView);
                  setDirection(index * cardsPerView > current ? 1 : -1);
                  setIsAutoPlaying(false);
                }}
                className="relative group focus:outline-none"
                aria-label={`Go to slide group ${index + 1}`}
              >
                <div
                  className={`w-6 h-1.5 sm:w-8 sm:h-1.5 rounded-full transition-colors duration-300 ${
                    activeDotIndex === index
                      ? "bg-indigo-600 dark:bg-indigo-500"
                      : "bg-slate-300 dark:bg-slate-800 group-hover:bg-slate-400 dark:group-hover:bg-slate-700"
                  }`}
                />
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default WhatsHappening;
