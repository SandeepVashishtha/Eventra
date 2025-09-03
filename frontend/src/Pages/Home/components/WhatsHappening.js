import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

const WhatsHappening = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const upcomingEvents = [
    {
      id: 1,
      title: "GirlScript Summer of Code 2025",
      description:
        "Join the largest open-source program for students. Contribute to Eventra and other amazing projects!",
      date: "March 15 - June 15, 2025",
      type: "Open Source Program",
      status: "Registration Open",
      link: "https://gssoc.girlscript.tech/",
      featured: true,
    },
    {
      id: 2,
      title: "Eventra Community Meetup",
      description:
        "Virtual meetup to discuss roadmap, features, and community contributions to the platform.",
      date: "February 10, 2025",
      type: "Community Event",
      status: "Coming Soon",
      link: "#",
      featured: false,
    },
    {
      id: 3,
      title: "Open Source Workshop",
      description:
        "Learn how to contribute to Eventra. Perfect for beginners wanting to get started with open source.",
      date: "February 20, 2025",
      type: "Workshop",
      status: "Planning",
      link: "#",
      featured: false,
    },
  ];

  const statusColors = {
    "Registration Open": "bg-green-100 text-green-800",
    "Coming Soon": "bg-blue-100 text-blue-800",
    Planning: "bg-yellow-100 text-yellow-800",
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % upcomingEvents.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? upcomingEvents.length - 1 : prev - 1));
  };

  const cardVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 100 : -100,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -100 : 100,
    }),
  };

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            What's Happening Now
          </h2>
          <p className="mt-2 sm:mt-3 max-w-xl mx-auto text-sm sm:text-lg text-gray-500">
            Stay updated with upcoming events, community programs, and
            opportunities to contribute to Eventra
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-md sm:max-w-xl mx-auto flex items-center">
          {/* Prev Button */}
          <button
            onClick={prevSlide}
            className="absolute -left-6 sm:-left-12 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10 text-sm sm:text-base"
          >
            ◀
          </button>

          {/* Card */}
          <div className="flex-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={upcomingEvents[current].id}
                variants={cardVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className={`flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
                  upcomingEvents[current].featured
                    ? "ring-2 ring-indigo-500"
                    : "border border-gray-100"
                }`}
              >
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        statusColors[upcomingEvents[current].status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {upcomingEvents[current].status}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {upcomingEvents[current].type}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {upcomingEvents[current].title}
                  </h3>
                  <p className="text-gray-600 flex-1 mb-3 sm:mb-4 text-sm sm:text-base">
                    {upcomingEvents[current].description}
                  </p>

                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
                    {upcomingEvents[current].date}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                  <a
                    href={upcomingEvents[current].link}
                    className={`w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium ${
                      upcomingEvents[current].featured
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "text-indigo-600 bg-white border-indigo-100 hover:bg-indigo-50"
                    }`}
                    target={
                      upcomingEvents[current].link.startsWith("http")
                        ? "_blank"
                        : "_self"
                    }
                    rel={
                      upcomingEvents[current].link.startsWith("http")
                        ? "noopener noreferrer"
                        : ""
                    }
                  >
                    {upcomingEvents[current].featured
                      ? "Join Now"
                      : "Learn More"}
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
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute -right-6 sm:-right-12 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10 text-sm sm:text-base"
          >
            ▶
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {upcomingEvents.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                current === i ? "bg-indigo-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          className="mt-12 sm:mt-16 bg-indigo-50 rounded-xl p-6 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1 md:pr-8">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                Eventra is participating in GirlScript Summer of Code 2025!
              </h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">
                We're excited to mentor contributors and welcome new developers to our open-source community. 
                Join us in building the future of event management!
              </p>
            </div>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:space-x-4 gap-2 sm:gap-0">
              <a
                href="https://gssoc.girlscript.tech/"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply to GSSOC
              </a>
              <a
                href="https://github.com/sandeepvashishtha/Eventra/issues"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
