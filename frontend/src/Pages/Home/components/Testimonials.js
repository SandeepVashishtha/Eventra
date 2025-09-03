import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
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

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Stories from our community
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Join thousands of professionals who trust Eventra for their events
          </p>
        </motion.div>

        {/* Train Container */}
        <div className="overflow-hidden relative">
          <motion.div
            className="flex gap-6"
            style={{ display: "flex" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            whileHover={{ transition: { duration: 0 } }}
          >
            {/* Duplicate for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 p-7 rounded-xl bg-white border-2 border-gray-100 shadow-sm"
              >
                <FaQuoteLeft className="absolute top-6 right-6 text-gray-100 text-4xl -z-10" />
                <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
