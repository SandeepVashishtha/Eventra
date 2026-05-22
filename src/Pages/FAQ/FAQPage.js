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
} from "lucide-react";
import FAQCTA from "./FaqCTA";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const faqs = [
  {
    category: "GETTING STARTED",
    icon: <Sparkles size={16} />,
    question: "How do I register for a hackathon or event?",
    answer:
      "Registering for events on Eventra is simple! Browse available events on our Events or Hackathons pages, click on the event you're interested in, and click the 'Register' or 'Join Event' button. You'll need to create an account if you don't have one. Follow the registration prompts, provide any required information, and you'll receive a confirmation email with event details.",
  },
  {
    category: "EVENT CREATION",
    icon: <Calendar size={16} />,
    question: "How can I create and host my own event on Eventra?",
    answer:
      "Creating your own event is easy! Sign up for an account, navigate to your dashboard, and click 'Create Event'. Choose your event type, fill in the event details like title, description, date, location, and capacity. Once published, your event will be visible to the community and you'll have access to management tools and analytics.",
  },
  {
    category: "EVENT TYPES",
    icon: <BookOpen size={16} />,
    question: "What is the difference between a workshop and a hackathon?",
    answer:
      "Workshops are typically educational sessions focused on learning specific topics or techniques (a few hours to a full day). Hackathons are competitive coding events where teams build hardware/software prototypes within a limited timeframe (usually 24-48 hours) often ending with judging and prizes.",
  },
  {
    category: "PRICING",
    icon: <Zap size={16} />,
    question: "Is it free to participate in or create an event?",
    answer:
      "Yes! Eventra is an open-source platform that's completely free to use for both participants and event organizers. You can join events, create your own events, and access most features without any cost. Core features remain completely free for communities and individual organizers.",
  },
  {
    category: "COMMUNITY",
    icon: <Users size={16} />,
    question: "How do the community links (Discord, Telegram, etc.) work?",
    answer:
      "Our community links connect you to chat platforms where Eventra users gather to discuss events, share opportunities, network, and find teammates. You can join these communities to stay updated and connect with like-minded people in your field of interest.",
  },
  {
    category: "ACCOUNT MANAGEMENT",
    icon: <Shield size={16} />,
    question: "How do I edit my profile and manage my account?",
    answer:
      "After logging in, click on your profile picture in the top navigation bar and select 'Edit Profile'. From there, you can update your personal information, profile picture, bio, interests, and notification preferences. You can also track your participation history.",
  },
  {
    category: "TECHNICAL SUPPORT",
    icon: <MessageCircle size={16} />,
    question: "What should I do if I encounter technical issues?",
    answer:
      "If you experience problems, try refreshing your browser or clearing your cache. For persistent issues, contact our support team through the Contact page, join our Discord for real-time help, or report bugs directly on our GitHub repository.",
  },
  {
    category: "EVENT FEATURES",
    icon: <Globe size={16} />,
    question: "Can I host virtual or hybrid events?",
    answer:
      "Absolutely! Eventra supports in-person, virtual, and hybrid events. When creating an event, specify the format and add relevant video meeting links or platform requirements. Our platform handles registration and check-ins seamlessly for all styles.",
  },
  {
    category: "EVENT MANAGEMENT",
    icon: <Calendar size={16} />,
    question: "How do I manage attendees and check-ins?",
    answer:
      "Organizers gain access to a comprehensive dashboard with attendee lists, announcement systems, QR code generation for quick check-ins, real-time tracking, and analytics tools to review engagement and improvement data.",
  },
  {
    category: "PRIVACY & SECURITY",
    icon: <Shield size={16} />,
    question: "How is my personal data protected?",
    answer:
      "We take security seriously. Eventra uses industry-standard encryption, secure user authentication, and GDPR compliance parameters. Your personal information is only used for coordinating platform functionality and event matching.",
  },
];


const NAVBAR_HEIGHT = 65;


export default function FAQSection() {
  useDocumentTitle("Eventra | FAQ");

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
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

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

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      wrapperRefs.current = [];
    };
  }, [headerHeight]);


  const cardStickyTop = NAVBAR_HEIGHT + headerHeight;

  return (
    <>
      <style>{`
        /* ── CSS variables (light mode defaults) ── */
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

        /*
         * Dark mode — Eventra uses Tailwind's class strategy: a .dark class is
         * toggled on <html> by the navbar sun/moon button. We target that here
         * instead of the OS media query so the toggle is respected immediately.
         */
        .dark .faq-section-root {
          --bg-primary: linear-gradient(
  to bottom,
  #020617,
  #0f172a,
  #111827
);
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

        /* ── The heading block ── */
        .faq-heading-block {
          text-align: center;
          padding: 60px 20px 32px;
          background: var(--heading-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 90;
          width: 100%;
          box-sizing: border-box;
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

        .faq-heading-spacer {
          width: 100%;
        }

        /* ── Cards ── */
        .faq-cards-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px 0;
        }

        .card-pin-wrapper {
          position: sticky;
          width: 100%;
          max-width: 820px;
          margin-bottom: 90px;
        }

        .faq-card-inner {
        transition:
  transform 0.35s ease,
  box-shadow 0.35s ease,
  border-color 0.35s ease,
  background 0.35s ease;
          width: 100%;
          background: rgba(15, 23, 42, 0.75);
border: 1px solid rgba(255,255,255,0.08);
backdrop-filter: blur(14px);
-webkit-backdrop-filter: blur(14px);
          border-radius: 16px;
          padding: 36px;
          box-shadow:
  0 10px 40px rgba(0,0,0,0.25);
          box-sizing: border-box;
        }


        .faq-card-inner:hover {
  transform: translateY(-6px);
  border-color: rgba(99,102,241,0.4);
  box-shadow:
    0 20px 60px rgba(79,70,229,0.18);
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
          line-height: 1.6;
          font-size: 1rem;
line-height: 1.8;
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


        {/* ── Heading — becomes fixed once section reaches the navbar ── */}
        <div
          ref={headerRef}
          className={`faq-heading-block${isHeaderFixed ? " is-fixed" : ""}`}
          style={isHeaderFixed ? { top: headerTop } : {}}
        >
          <h2>Frequently Asked Questions</h2>
          <p>
            Everything you need to know about using Eventra, from getting
            started to hosting your own events.
          </p>
        </div>

        {/* Spacer holds layout space when heading is fixed */}
        {isHeaderFixed && (
          <div
            className="faq-heading-spacer"
            style={{ height: headerHeight }}
          />
        )}

        {/* ── Stacking Cards ── */}
        <div className="faq-cards-container">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="card-pin-wrapper"
              // FIX 5: Ref callback that appends without overwriting
              ref={(el) => {
                if (el) wrapperRefs.current[index] = el;
              }}
              style={{ top: cardStickyTop + 16 }}
            >
              {/* FIX 3: Style applied via React state, not direct DOM write */}
              <div className="faq-card-inner" style={cardStyles[index]}>
                {/* FIX 4: Icons re-added with category label */}
                <div className="faq-card-header">
                  <span className="faq-icon">{faq.icon}</span>
                  <span className="faq-cat">{faq.category}</span>
                </div>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
          <div className="scroll-spacer" />
        </div>
        <FAQCTA />
      </div>
    </>
  );
} 
