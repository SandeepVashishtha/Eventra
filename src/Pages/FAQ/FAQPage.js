import { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  BookOpen,
  Zap,
  Users,
  Shield,
  MessageCircle,
  Globe,
  Search,
  HelpCircle,
  X
} from "lucide-react";
import FAQCTA from "./FaqCTA";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Centralized FAQ entries classified under General, Hackathons, or Account categories
const faqs = [
  {
    category: "GETTING STARTED",
    tab: "Hackathons",
    icon: <Sparkles size={16} />,
    question: "How do I register for a hackathon or event?",
    answer:
      "Registering for events on Eventra is simple! Browse available events on our Events or Hackathons pages, click on the event you're interested in, and click the 'Register' or 'Join Event' button. You'll need to create an account if you don't have one. Follow the registration prompts, provide any required information, and you'll receive a confirmation email with event details.",
  },
  {
    category: "EVENT CREATION",
    tab: "Hackathons",
    icon: <Calendar size={16} />,
    question: "How can I create and host my own event on Eventra?",
    answer:
      "Creating your own event is easy! Sign up for an account, navigate to your dashboard, and click 'Create Event'. Choose your event type, fill in the event details like title, description, date, location, and capacity. Once published, your event will be visible to the community and you'll have access to management tools and analytics.",
  },
  {
    category: "EVENT TYPES",
    tab: "General",
    icon: <BookOpen size={16} />,
    question: "What is the difference between a workshop and a hackathon?",
    answer:
      "Workshops are typically educational sessions focused on learning specific topics or techniques (a few hours to a full day). Hackathons are competitive coding events where teams build hardware/software prototypes within a limited timeframe (usually 24-48 hours) often ending with judging and prizes.",
  },
  {
    category: "PRICING",
    tab: "General",
    icon: <Zap size={16} />,
    question: "Is it free to participate in or create an event?",
    answer:
      "Yes! Eventra is an open-source platform that's completely free to use for both participants and event organizers. You can join events, create your own events, and access most features without any cost. Core features remain completely free for communities and individual organizers.",
  },
  {
    category: "COMMUNITY",
    tab: "Hackathons",
    icon: <Users size={16} />,
    question: "How do the community links (Discord, Telegram, etc.) work?",
    answer:
      "Our community links connect you to chat platforms where Eventra users gather to discuss events, share opportunities, network, and find teammates. You can join these communities to stay updated and connect with like-minded people in your field of interest.",
  },
  {
    category: "ACCOUNT MANAGEMENT",
    tab: "Account",
    icon: <Shield size={16} />,
    question: "How do I edit my profile and manage my account?",
    answer:
      "After logging in, click on your profile picture in the top navigation bar and select 'Edit Profile'. From there, you can update your personal information, profile picture, bio, interests, and notification preferences. You can also track your participation history.",
  },
  {
    category: "TECHNICAL SUPPORT",
    tab: "General",
    icon: <MessageCircle size={16} />,
    question: "What should I do if I encounter technical issues?",
    answer:
      "If you experience problems, try refreshing your browser or clearing your cache. For persistent issues, contact our support team through the Contact page, join our Discord for real-time help, or report bugs directly on our GitHub repository.",
  },
  {
    category: "EVENT FEATURES",
    tab: "General",
    icon: <Globe size={16} />,
    question: "Can I host virtual or hybrid events?",
    answer:
      "Absolutely! Eventra supports in-person, virtual, and hybrid events. When creating an event, specify the format and add relevant video meeting links or platform requirements. Our platform handles registration and check-ins seamlessly for all styles.",
  },
  {
    category: "EVENT MANAGEMENT",
    tab: "Hackathons",
    icon: <Calendar size={16} />,
    question: "How do I manage attendees and check-ins?",
    answer:
      "Organizers gain access to a comprehensive dashboard with attendee lists, announcement systems, QR code generation for quick check-ins, real-time tracking, and analytics tools to review engagement and improvement data.",
  },
  {
    category: "PRIVACY & SECURITY",
    tab: "Account",
    icon: <Shield size={16} />,
    question: "How is my personal data protected?",
    answer:
      "We take security seriously. Eventra uses industry-standard encryption, secure user authentication, and GDPR compliance parameters. Your personal information is only used for coordinating platform functionality and event matching.",
  },
];

const NAVBAR_HEIGHT = 65;

export default function FAQSection() {
  useDocumentTitle("Eventra | FAQ");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" ||
      faq.tab?.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const [cardStyles, setCardStyles] = useState(() =>
    faqs.map(() => ({ transform: "scale(1)", filter: "none" }))
  );

  const wrapperRefs = useRef([]);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [headerTop, setHeaderTop] = useState(0);

  useEffect(() => {
    wrapperRefs.current = [];
    setCardStyles(
      filteredFaqs.map(() => ({ transform: "scale(1)", filter: "none" }))
    );
  }, [searchTerm, selectedCategory, filteredFaqs.length]);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [searchTerm, selectedCategory, isHeaderFixed]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        const sectionRect = section.getBoundingClientRect();
        const naturalTop = sectionRect.top + NAVBAR_HEIGHT;

        if (naturalTop <= NAVBAR_HEIGHT) {
          setIsHeaderFixed(true);
          setHeaderTop(NAVBAR_HEIGHT);
        } else {
          setIsHeaderFixed(false);
        }

        const viewportCenter = window.innerHeight / 2;

        const nextStyles = wrapperRefs.current.map((wrapper) => {
          if (!wrapper) {
            return {
              transform: "scale(1)",
              filter: "none",
            };
          }

          const rect = wrapper.getBoundingClientRect();
          const scrollProgress = viewportCenter - rect.top;

          if (scrollProgress > 0) {
            const factor = Math.min(
              scrollProgress / window.innerHeight,
              1
            );

            const scale = 1 - factor * 0.04;
            const blur = factor * 2;

            return {
              transform: `scale(${scale}) translateY(${factor * -10}px)`,
              filter: `blur(${blur}px) brightness(${1 - factor * 0.05})`,
              opacity: 1 - factor * 0.15,
            };
          }

          return {
            transform: "scale(1)",
            filter: "none",
          };
        });

        setCardStyles(nextStyles);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [headerHeight]);

  return (
    <>
      <style>{`
        .faq-section-root {
          transition: background-color 0.3s ease, color 0.3s ease;
          --bg-primary: #f9fafb;
          --text-primary: #111827;
          --card-bg: #ffffff;
          --card-border: #e5e7eb;
          --cat-color: #4f46e5;
          --heading-color: #111827;
          --subtext-color: #6b7280;
          --answer-color: #4b5563;
          --heading-bg: rgba(249, 249, 251, 0.95);
          --heading-border: rgba(0, 0, 0, 0.07);
          --icon-bg: #e0e7ff;
          --icon-color: #4f46e5;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
        }

        .dark .faq-section-root {
          --bg-primary: linear-gradient(to bottom, #020617, #0f172a, #111827);
          --text-primary: #f9fafb;
          --card-bg: #0f172a;
          --card-border: rgba(255,255,255,0.08);
          --cat-color: #818cf8;
          --heading-color: #f3f4f6;
          --subtext-color: #9ca3af;
          --answer-color: #d1d5db;
          --heading-bg: rgba(2, 6, 23, 0.92);
          --heading-border: rgba(255, 255, 255, 0.07);
          --icon-bg: #312e81;
          --icon-color: #818cf8;
        }

        .faq-heading-block {
          text-align: center;
          padding: 60px 20px 32px;
          background: var(--heading-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 90;
          width: 100%;
          box-sizing: border-box;
          transition: transform 0.5s ease, opacity 0.5s ease, padding 0.5s ease, background 0.5s ease;
        }

        .faq-heading-block.is-fixed {
          position: fixed;
          left: 0;
          right: 0;
          border-bottom: 1px solid var(--heading-border);
          padding: 20px 20px 16px;
        }

        .faq-heading-block h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 10px;
          color: var(--heading-color);
        }

        .faq-heading-block p {
          color: var(--subtext-color);
          font-size: 1.05rem;
          margin: 0 auto;
          max-width: 600px;
        }

        .faq-heading-spacer { width: 100%; }

        .faq-cards-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px 0;
        }

        .card-pin-wrapper {
          position: relative;
          width: 100%;
          max-width: 820px;
          margin-bottom: 90px;
        }

        .faq-card-inner {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease;
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          box-sizing: border-box;
        }

        .dark .faq-card-inner { box-shadow: 0 10px 40px rgba(0,0,0,0.3); }

        .faq-card-inner:hover {
          transform: translateY(-6px);
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 20px 60px rgba(79,70,229,0.18);
        }

        .faq-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .faq-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--icon-bg);
          color: var(--icon-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .faq-cat {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--cat-color);
          text-transform: uppercase;
        }

        .faq-card-inner h3 {
          font-size: 1.45rem;
          line-height: 1.4;
          letter-spacing: -0.02em;
          color: var(--heading-color);
          margin: 0 0 10px;
          font-weight: 600;
        }

        .faq-card-inner p {
          color: var(--answer-color);
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
        }

        .scroll-spacer {
          height: 50vh;
          pointer-events: none;
        }
      `}</style>

      <div
        className="faq-section-root text-slate-900 dark:text-gray-100"
        ref={sectionRef}
      >
        <div
          ref={headerRef}
          className={`faq-heading-block${isHeaderFixed ? " is-fixed" : ""}`}
          style={isHeaderFixed ? { top: headerTop } : {}}
        >
          <h2>Frequently Asked Questions</h2>
          <p className="mb-6">
            Everything you need to know about using Eventra, from getting
            started to hosting your own events.
          </p>

          <div className="max-w-2xl mx-auto mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-3/5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search hackathons, bookmarks, accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-gray-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {["All", "General", "Hackathons", "Account"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/10"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isHeaderFixed && (
          <div
            className="faq-heading-spacer"
            style={{ height: headerHeight }}
          />
        )}

        <div className="faq-cards-container">
          {filteredFaqs.length === 0 ? (
            <div className="max-w-[820px] w-full mx-auto mt-8 mb-16 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md animate-pulse">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                No matching FAQs found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                We couldn't find any questions matching "{searchTerm}" under the {selectedCategory} category. Try broadening your keywords.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Clear Active Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="card-pin-wrapper"
                ref={(el) => {
                  if (el) wrapperRefs.current[index] = el;
                }}
              >
                <div
                  className="faq-card-inner"
                  style={cardStyles[index] || { transform: "scale(1)", filter: "none" }}
                >
                  <div className="faq-card-header">
                    <span className="faq-icon">{faq.icon}</span>
                    <span className="faq-cat">{faq.category}</span>
                  </div>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))
          )}
          {filteredFaqs.length > 0 && <div className="scroll-spacer" />}
        </div>
        <FAQCTA />
      </div>
    </>
  );
}