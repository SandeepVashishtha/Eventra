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
    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;

    const getEventTimeLeft = (event) => {
      const startDate = new Date(event.startDate || event.date);
      const endDate = event.endDate
        ? new Date(event.endDate)
        : new Date(new Date(event.date).setHours(23, 59, 59, 999));

      if (now < startDate) {
        const daysUntilStart = Math.ceil((startDate - now) / dayMs);
        return `${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`;
      }
      if (now <= endDate) {
        return "Live Now";
      }
      return "Ended";
    };

    return events
      .filter((event) => {
        const endDate = event.endDate
          ? new Date(event.endDate)
          : new Date(new Date(event.date).setHours(23, 59, 59, 999));
        return endDate >= now;
      })
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        rawDate: event.startDate || event.date,
        type: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        status: event.status === "upcoming" ? "Registration Open" : "Live Event",
        link: `/events/${event.id}`,
        featured: event.attendees > 200,
        location: event.location,
        attendees: event.attendees,
        timeLeft: getEventTimeLeft(event),
      }));
  };

  const formatHackathonsData = (hackathons) => {
    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;

    const getHackathonTimeLeft = (hackathon) => {
      const startDate = new Date(hackathon.startDate);
      const endDate = new Date(hackathon.endDate);

      if (now < startDate) {
        const daysUntilStart = Math.ceil((startDate - now) / dayMs);
        return `${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`;
      }
      if (now <= endDate) {
        return "Live Now";
      }
      return "Ended";
    };

    return hackathons
      .filter((hackathon) => hackathon.status !== "ended" && new Date(hackathon.endDate) >= now)
      .map((hackathon) => ({
        id: `hackathon-${hackathon.id}`,
        title: hackathon.title,
        description: hackathon.description,
        timeLeft: getHackathonTimeLeft(hackathon),
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
        featured: hackathon.prize && parseInt(hackathon.prize.replace(/[$,]/g, ""), 10) > 30000,
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
      return newIndex < 0 ? Math.max(0, upcomingEvents.length - cardsPerView) : newIndex;
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
    enter: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : dir > 0 ? 300 : -300 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : dir > 0 ? -300 : 300 }),
  };

  const activeDotIndex =
    Math.floor(current / cardsPerView) % Math.ceil(upcomingEvents.length / cardsPerView);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-slate-200/60 py-16 text-slate-900 transition-colors duration-300 sm:py-20 dark:border-slate-800/60 dark:text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--bg-color, #F8FBFD) 0%, rgba(109, 40, 217, 0.02) 42%, rgba(109, 40, 217, 0.05) 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-950/40" />
        <div className="absolute top-10 left-8 h-40 w-40 rounded-full bg-white/35 blur-3xl dark:bg-slate-800/10" />
        <div className="dark:bg-brand-violet/5 absolute top-24 right-8 h-52 w-52 rounded-full bg-sky-100/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            What&apos;s Happening Now
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            Stay updated with {upcomingEvents.length} upcoming events, community programs, and
            opportunities to contribute to Eventra
          </p>
        </motion.div>

        {/* MODIFIED: The Carousel Outside Container now has a rich border-2 violet framing and tint */}
        <div
          className="border-brand-violet/30 dark:border-brand-violet/40 relative mx-auto w-full max-w-7xl rounded-[28px] border-2 bg-white/80 px-3 py-4 shadow-[0_20px_60px_rgba(109,40,217,0.05)] backdrop-blur-md sm:px-5 sm:py-5 dark:bg-slate-900/70 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          style={{ borderColor: "rgba(139, 92, 246, 0.35)" }}
        >
          {/* Play/Pause Button */}
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="rounded-full border border-slate-200 bg-white/90 p-2.5 text-slate-600 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
            >
              {isAutoPlaying ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 4.1l8.4 5.4c.4.3.4.8 0 1l-8.4 5.4c-.5.3-1.1-.1-1.1-.6V4.7c0-.5.6-.9 1.1-.6z" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-slate-700 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-xl sm:-left-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Previous events"
          >
            <svg
              className="h-5 w-5"
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
              setCurrent((prev) => (prev + cardsPerView) % upcomingEvents.length);
              setIsAutoPlaying(false);
            }}
            className="absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-3 text-slate-700 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-xl sm:-right-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Next events"
          >
            <svg
              className="h-5 w-5"
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
            className="overflow-hidden px-4 py-6 sm:px-8"
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
                className="pointer-events-auto relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) {
                    prevSlide();
                  } else if (info.offset.x < -100) {
                    setDirection(1);
                    setCurrent((prev) => (prev + cardsPerView) % upcomingEvents.length);
                    setIsAutoPlaying(false);
                  }
                }}
              >
                {isLoading
                  ? [...Array(cardsPerView)].map((_, i) => (
                      <div
                        key={`skeleton-wrap-${i}`}
                        className="border-brand-violet/20 rounded-[24px] border-2 p-1"
                        style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
                      >
                        <HomeCardSkeleton />
                      </div>
                    ))
                  : upcomingEvents
                      .slice(current, current + cardsPerView)
                      .concat(
                        current + cardsPerView > upcomingEvents.length
                          ? upcomingEvents.slice(
                              0,
                              (current + cardsPerView) % upcomingEvents.length
                            )
                          : []
                      )
                      .slice(0, cardsPerView)
                      .map((event) => (
                        <motion.div
                          key={event.id}
                          whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -6 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}
                          transition={{ type: "spring", stiffness: 300, damping: 24 }}
                          className="group border-brand-violet/50 dark:border-brand-violet/60 hover:border-brand-violet dark:hover:border-brand-violet pointer-events-auto relative flex min-h-[340px] w-full flex-1 flex-col overflow-hidden rounded-[24px] border-2 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(109,40,217,0.25)] sm:p-6 dark:bg-slate-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                          style={{ borderColor: "rgba(139, 92, 246, 0.55)" }}
                          onMouseEnter={() => setIsAutoPlaying(false)}
                          onMouseLeave={() => setIsAutoPlaying(true)}
                        >
                          {/* Card Content */}
                          <div className="flex flex-1 flex-col">
                            <div className="mb-4 flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  event.status === "Live Now" || event.status === "Live Event"
                                    ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : event.status === "Registration Open"
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {event.status}
                              </span>
                              <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300">
                                {event.type}
                              </span>
                            </div>

                            <h3
                              title={event.title}
                              className="group-hover:text-brand-violet dark:group-hover:text-brand-violet mb-2 line-clamp-2 min-w-0 text-lg leading-snug font-semibold break-words text-slate-900 transition-colors sm:text-xl dark:text-white"
                            >
                              {event.title}
                            </h3>

                            <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {event.description}
                            </p>

                            <div className="mb-4 flex flex-wrap gap-2.5">
                              {event.prize && (
                                <div className="inline-flex items-center rounded-xl border border-rose-500/10 bg-rose-500/5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                  <svg
                                    className="mr-1 h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 6v12m-3-2.818l.251-.11a3.375 3.375 0 000-6.166l-.251-.1a3.375 3.375 0 000 6.166zm6 0l.251-.11a3.375 3.375 0 000-6.166l-.251-.1a3.375 3.375 0 000 6.166z"
                                    />
                                  </svg>
                                  {event.prize}
                                </div>
                              )}

                              {(event.participants || event.attendees) && (
                                <div className="inline-flex items-center rounded-xl border border-sky-500/10 bg-sky-500/5 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                                  <svg
                                    className="mr-1 h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0112.75 21.5h-1.5a2.25 2.25 0 01-2.25-2.263V19.13m-2.625.372A9.336 9.336 0 011.5 18.552a4.125 4.125 0 017.533-2.493m0 0a9.38 9.38 0 012.625.372 9.336 9.336 0 004.121-.952m-4.121.952v-.002c0-1.113-.285-2.16-.786-3.07M9 10.125c0 .621.504 1.125 1.125 1.125h1.75c.621 0 1.125-.504 1.125-1.125V8.875c0-.621-.504-1.125-1.125-1.125h-1.75C9.504 7.75 9 8.254 9 8.875v1.25z"
                                    />
                                  </svg>
                                  {event.participants
                                    ? `${event.participants} participants`
                                    : `${event.attendees} attendees`}
                                </div>
                              )}
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                              <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                <svg
                                  className="mr-1.5 h-4 w-4 text-slate-400 dark:text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                                  />
                                </svg>
                                {event.date}
                              </div>

                              <div
                                className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold ${
                                  event.timeLeft === "Ended"
                                    ? "border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400"
                                    : event.timeLeft === "Live Now"
                                      ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                                      : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                {event.timeLeft === "Ended" ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Ended
                                  </>
                                ) : event.timeLeft === "Live Now" ? (
                                  <>
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />{" "}
                                    Live Now
                                  </>
                                ) : (
                                  <>
                                    <Hourglass className="h-3.5 w-3.5" /> {event.timeLeft}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            to={event.link}
                            className="hover:bg-brand-violet dark:hover:bg-brand-violet focus-visible:ring-brand-violet/50 mt-4 inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 dark:bg-slate-800"
                          >
                            {event.featured ? "Register Now" : "Learn More"}
                            <svg
                              className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </Link>
                        </motion.div>
                      ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          {Array.from({ length: Math.ceil(upcomingEvents.length / cardsPerView) }, (_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrent(index * cardsPerView);
                setDirection(index * cardsPerView > current ? 1 : -1);
                setIsAutoPlaying(false);
              }}
              className="group relative focus:outline-none"
              aria-label={`Go to slide group ${index + 1}`}
            >
              <div
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 sm:h-1.5 sm:w-8 ${
                  activeDotIndex === index
                    ? "dark:bg-brand-violet bg-slate-900"
                    : "bg-slate-300 group-hover:bg-slate-400 dark:bg-slate-700 dark:group-hover:bg-slate-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsHappening;
