import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const testimonials = [
  {
    quote:
      "Eventra transformed how we manage our college tech fest. The QR check-in system and real-time analytics made everything seamless for our 2000+ attendees.",
    author: "Sarah Chen",
    role: "Event Coordinator",
    company: "MIT Tech Society",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  },
  {
    quote:
      "As a startup, organizing multiple community events was challenging. Eventra's open-source platform gave us enterprise-level features without the cost.",
    author: "Marcus Johnson",
    role: "Community Manager",
    company: "DevHub",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  },
  {
    quote:
      "The waiting list automation and RSVP management saved us countless hours. Eventra handles the complexity so we can focus on creating great experiences.",
    author: "Priya Sharma",
    role: "Operations Lead",
    company: "TechMeetup Bangalore",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
  },
];

const floatingStars = [
  { top: "10%", left: "10%", size: 10, delay: 0 },
  { top: "20%", left: "50%", size: 12, delay: 0.5 },
  { top: "35%", left: "80%", size: 10, delay: 1 },
  { top: "50%", left: "20%", size: 11, delay: 1.5 },
  { top: "65%", left: "60%", size: 9, delay: 0.8 },
  { top: "80%", left: "35%", size: 10, delay: 1.2 },
];

const ModernTestimonialTrain = () => {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const speed = 0.5; // px per frame
    let animationFrame;

    const animate = () => {
      if (hoveredCard === null) {
        setOffset((prev) => {
          const containerWidth = containerRef.current?.scrollWidth / 2 || 0;
          const newOffset = prev - speed;
          return Math.abs(newOffset) >= containerWidth ? 0 : newOffset;
        });
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [hoveredCard]);

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Heading */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          Voices From Our Community
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Hear how Eventra empowers organizers and professionals to create
          impactful, seamless, and memorable events worldwide.
        </p>
      </div>

      {/* Floating stars */}
      {floatingStars.map((star, idx) => (
        <motion.div
          key={idx}
          className="absolute text-yellow-400 opacity-50"
          style={{ top: star.top, left: star.left, fontSize: star.size }}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 3 + Math.random() * 2,
            delay: star.delay,
            ease: "easeInOut",
          }}
        >
          <FaStar />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex gap-6 cursor-pointer"
          style={{ x: offset }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="
relative flex-shrink-0 w-80 p-6 rounded-2xl
bg-white/10 dark:bg-gray-800/20
backdrop-blur-xl
border border-white/20 dark:border-gray-700/40
shadow-lg
"
            >
              {/* Quote icon behind text */}
              <FaQuoteLeft className="absolute top-4 left-4 text-gray-300 dark:text-gray-800 text-4xl -z-10" />

              {/* Quote text */}
              <p className="mb-6 text-gray-900 dark:text-gray-100 relative z-10">
                {testimonial.quote}
              </p>

              {/* Author section */}
              <div className="flex items-center mt-auto pt-4 border-t border-gray-400 dark:border-gray-700">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-14 w-14 rounded-full object-cover border-2 border-white/20 dark:border-gray-600"
                />
                <div className="ml-4 text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {testimonial.company}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-1">
                <FaStar className="text-yellow-300 animate-pulse" />
                <FaStar className="text-yellow-400 animate-pulse delay-150" />
                <FaStar className="text-yellow-500 animate-pulse delay-300" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModernTestimonialTrain;
