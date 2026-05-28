import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaStar, FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaShareAlt, FaCheckCircle } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

// 🎯 Enhanced testimonials data with more metadata
const testimonials = [
  {
    id: 1,
    quote: "Eventra transformed how we manage our college tech fest. The QR check-in system and real-time analytics made everything seamless for our 2000+ attendees.",
    shortQuote: "Eventra transformed how we manage our college tech fest...",
    author: "Sarah Chen",
    role: "Event Coordinator",
    company: "MIT Tech Society",
    companyLogo: "https://via.placeholder.com/40x20?text=MIT",
    rating: 5,
    category: "conference",
    verified: true,
    date: "2024-03",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Love+Eventra!",
  },
  {
    id: 2,
    quote: "As a startup, organizing multiple community events was challenging. Eventra's open-source platform gave us enterprise-level features without the cost.",
    shortQuote: "As a startup, organizing multiple community events was challenging...",
    author: "Marcus Johnson",
    role: "Community Manager",
    company: "DevHub",
    companyLogo: "https://via.placeholder.com/40x20?text=DevHub",
    rating: 5,
    category: "workshop",
    verified: true,
    date: "2024-02",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Eventra+is+awesome!",
  },
  {
    id: 3,
    quote: "The waiting list automation and RSVP management saved us countless hours. Eventra handles the complexity so we can focus on creating great experiences.",
    shortQuote: "The waiting list automation and RSVP management saved us countless hours...",
    author: "Priya Sharma",
    role: "Operations Lead",
    company: "TechMeetup Bangalore",
    companyLogo: "https://via.placeholder.com/40x20?text=TechMeetup",
    rating: 5,
    category: "meetup",
    verified: true,
    date: "2024-01",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Eventra+rocks!",
  },
  {
    id: 4,
    quote: "The analytics dashboard gives us incredible insights into attendee behavior. We've improved our event planning by 40% using data-driven decisions.",
    shortQuote: "The analytics dashboard gives us incredible insights...",
    author: "James Rodriguez",
    role: "Event Organizer",
    company: "Global Tech Events",
    companyLogo: "https://via.placeholder.com/40x20?text=GlobalTech",
    rating: 5,
    category: "conference",
    verified: false,
    date: "2023-12",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Data+driven+events+with+Eventra!",
  },
  {
    id: 5,
    quote: "Eventra's team collaboration features are outstanding. Our entire organizing committee stays in sync, making event management a breeze.",
    shortQuote: "Eventra's team collaboration features are outstanding...",
    author: "Emily Watson",
    role: "Conference Director",
    company: "Innovation Summit",
    companyLogo: "https://via.placeholder.com/40x20?text=Innovation",
    rating: 4,
    category: "conference",
    verified: true,
    date: "2023-11",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Team+collab+made+easy!",
  },
  {
    id: 6,
    quote: "Best event management platform I've used! The attendee experience is smooth, and the backend tools are powerful yet easy to use.",
    shortQuote: "Best event management platform I've used!...",
    author: "David Kim",
    role: "Attendee & Developer",
    company: "Tech Enthusiast",
    companyLogo: "https://via.placeholder.com/40x20?text=Tech",
    rating: 5,
    category: "workshop",
    verified: false,
    date: "2023-10",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
    shareUrl: "https://twitter.com/share?text=Best+platform+ever!",
  },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "conference", label: "🎤 Conferences" },
  { key: "workshop", label: "🛠️ Workshops" },
  { key: "meetup", label: "🤝 Meetups" },
];

const floatingStars = [
  { top: "10%", left: "10%", size: 10, delay: 0 },
  { top: "20%", left: "50%", size: 12, delay: 0.5 },
  { top: "35%", left: "80%", size: 10, delay: 1 },
  { top: "50%", left: "20%", size: 11, delay: 1.5 },
  { top: "65%", left: "60%", size: 9, delay: 0.8 },
  { top: "80%", left: "35%", size: 10, delay: 1.2 },
];

// 🎨 Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transition: { duration: 0.2 }
  }
};

const ModernTestimonialTrain = () => {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔁 Filter testimonials by category
  const filteredTestimonials = useMemo(() => {
    return activeCategory === "all" 
      ? testimonials 
      : testimonials.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  // 🔄 Create duplicated array for seamless infinite scroll
  const scrollItems = useMemo(() => {
    return [...filteredTestimonials, ...filteredTestimonials];
  }, [filteredTestimonials]);

  // 🎮 Auto-scroll animation with pause control
  useEffect(() => {
    if (!isPlaying) return;
    
    const speed = 0.4;
    let animationFrame;

    const animate = () => {
      setOffset((prev) => {
        const containerWidth = containerRef.current?.querySelector('.testimonial-track')?.scrollWidth / 2 || 0;
        const newOffset = prev - speed;
        return Math.abs(newOffset) >= containerWidth ? 0 : newOffset;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, filteredTestimonials]);

  // ⌨️ Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setIsPlaying(false);
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setIsPlaying(false);
        setCurrentIndex(prev => Math.min(filteredTestimonials.length - 1, prev + 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredTestimonials.length]);

  // 🎯 Jump to specific testimonial
  const jumpToIndex = useCallback((index) => {
    setIsPlaying(false);
    setCurrentIndex(index);
    const cardWidth = 336; // w-80 + gap-6 ≈ 336px
    setOffset(-index * cardWidth);
  }, []);

  // 🔗 Share testimonial handler
  const handleShare = useCallback(async (testimonial) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Testimonial by ${testimonial.author}`,
          text: testimonial.quote,
          url: testimonial.shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${testimonial.quote} — ${testimonial.author}, ${testimonial.company}`);
      // Could show toast here
    }
  }, []);

  // 📱 Touch swipe support (basic)
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setIsPlaying(false);
      setCurrentIndex(prev => {
        const newIndex = diff > 0 
          ? Math.min(filteredTestimonials.length - 1, prev + 1) 
          : Math.max(0, prev - 1);
        jumpToIndex(newIndex);
        return newIndex;
      });
    }
  };

  return (
    <section 
      className="relative py-20 px-4 bg-gradient-to-b from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black text-gray-900 dark:text-gray-100 overflow-hidden"
      aria-label="Community Testimonials"
    >
      {/* 🎨 Floating decorative stars */}
      {floatingStars.map((star, idx) => (
        <motion.div
          key={idx}
          className="absolute text-yellow-400 opacity-50 pointer-events-none"
          style={{ top: star.top, left: star.left, fontSize: star.size }}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5], rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, delay: star.delay, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <FaStar />
        </motion.div>
      ))}

      {/* 📰 Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <motion.h2 
          className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Voices From Our Community
        </motion.h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Hear how Eventra empowers organizers and professionals to create impactful, seamless, and memorable events worldwide.
        </p>
      </div>

      {/* 🏷️ Category Filter Chips */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setIsPlaying(true); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeCategory === cat.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
            aria-pressed={activeCategory === cat.key}
          >
            {cat.label}
            {activeCategory === cat.key && <motion.span layoutId="activeCategory" className="w-1.5 h-1.5 bg-white rounded-full" />}
          </button>
        ))}
      </div>

      {/* 🎮 Controls: Play/Pause + Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPlaying(prev => !prev)}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          aria-label={isPlaying ? "Pause auto-scroll" : "Play auto-scroll"}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <FaPause className="text-indigo-600 dark:text-indigo-400" /> : <FaPlay className="text-indigo-600 dark:text-indigo-400 ml-0.5" />}
        </button>
        
        <button
          onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); jumpToIndex(Math.max(0, currentIndex - 1)); }}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-40"
          disabled={currentIndex === 0}
          aria-label="Previous testimonial"
          title="← Arrow Key"
        >
          <FaChevronLeft className="text-gray-700 dark:text-gray-300" />
        </button>
        
        <button
          onClick={() => { setCurrentIndex(prev => Math.min(filteredTestimonials.length - 1, prev + 1)); jumpToIndex(Math.min(filteredTestimonials.length - 1, currentIndex + 1)); }}
          className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-40"
          disabled={currentIndex === filteredTestimonials.length - 1}
          aria-label="Next testimonial"
          title="Arrow Key →"
        >
          <FaChevronRight className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* 🎠 Testimonial Carousel */}
      <div className="max-w-7xl mx-auto overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <motion.div
          ref={containerRef}
          className="testimonial-track flex gap-6"
          style={{ x: offset }}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <AnimatePresence>
            {scrollItems.map((testimonial, index) => {
              const isOriginal = index < filteredTestimonials.length;
              const displayIndex = isOriginal ? index : index - filteredTestimonials.length;
              
              return (
                <motion.div
                  key={`${testimonial.id}-${index}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="relative flex-shrink-0 w-80 p-6 rounded-2xl bg-white/10 dark:bg-gray-800/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/40 shadow-lg cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                  role="article"
                  aria-label={`Testimonial from ${testimonial.author}`}
                >
                  {/* ✅ Verified Badge */}
                  {testimonial.verified && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md" title="Verified Organizer">
                      <FaCheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}

                  {/* 💬 Quote Icon */}
                  <FaQuoteLeft className="absolute top-4 left-4 text-gray-300 dark:text-gray-800 text-4xl -z-10 opacity-50" aria-hidden="true" />

                  {/* 📝 Quote Text with Expand */}
                  <p className="mb-6 text-gray-900 dark:text-gray-100 relative z-10 text-sm leading-relaxed">
                    {expandedCard === index ? testimonial.quote : testimonial.shortQuote}
                    {testimonial.quote.length > 100 && (
                      <button 
                        className="text-indigo-600 dark:text-indigo-400 text-xs font-medium ml-1 hover:underline"
                        onClick={(e) => { e.stopPropagation(); setExpandedCard(expandedCard === index ? null : index); }}
                        aria-expanded={expandedCard === index}
                      >
                        {expandedCard === index ? "Show less" : "Read more"}
                      </button>
                    )}
                  </p>

                  {/* 👤 Author Section */}
                  <div className="flex items-center mt-auto pt-4 border-t border-gray-400/30 dark:border-gray-700/50">
                    <img 
                      loading="lazy"
                      src={testimonial.image}
                      alt={`${testimonial.author} from ${testimonial.company}`}
                      className="h-14 w-14 rounded-full object-cover border-2 border-white/30 dark:border-gray-600"
                    />
                    <div className="ml-4 text-left flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{testimonial.author}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{testimonial.role}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{testimonial.company}</span>
                        {testimonial.companyLogo && (
                          <img src={testimonial.companyLogo} alt={`${testimonial.company} logo`} className="h-4 opacity-70" loading="lazy" />
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">{testimonial.date}</div>
                    </div>
                  </div>

                  {/* ⭐ Rating Stars */}
                  <div className="absolute bottom-4 right-4 flex gap-0.5" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${i < testimonial.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300 dark:text-gray-600'} text-xs`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {/* 🔗 Share Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(testimonial); }}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/40 dark:hover:bg-gray-600/40 transition-colors"
                    aria-label={`Share ${testimonial.author}'s testimonial`}
                    title="Share this testimonial"
                  >
                    <FaShareAlt className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🔘 Navigation Dots */}
      <div className="max-w-7xl mx-auto mt-8 flex justify-center gap-2">
        {filteredTestimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => jumpToIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
              currentIndex === idx 
                ? "bg-indigo-600 dark:bg-indigo-400 w-6" 
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
            aria-current={currentIndex === idx ? "true" : "false"}
          />
        ))}
      </div>

      {/* 📣 CTA: Share Your Story */}
      <motion.div 
        className="max-w-7xl mx-auto mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Have a story to share?
          </span>
          <a
            href="/submit-testimonial"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Share Your Story <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {/* ♿ Keyboard Hint */}
      <p className="sr-only" aria-live="polite">
        Use left and right arrow keys to navigate testimonials. Press space to play or pause auto-scroll.
      </p>
    </section>
  );
};

export default ModernTestimonialTrain;