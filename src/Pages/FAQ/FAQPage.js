import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    category: "GETTING STARTED",
    question: "How do I register for a hackathon or event?",
    answer:
      "Registering for events on Eventra is simple! Browse available events on our Events or Hackathons pages, click on the event you're interested in, and click the 'Register' or 'Join Event' button. You'll need to create an account if you don't have one. Follow the registration prompts, provide any required information, and you'll receive a confirmation email with event details.",
  },
  {
    category: "EVENT CREATION",
    question: "How can I create and host my own event on Eventra?",
    answer:
      "Creating your own event is easy! Sign up for an account, navigate to your dashboard, and click 'Create Event'. Choose your event type, fill in the event details like title, description, date, location, and capacity. Once published, your event will be visible to the community and you'll have access to management tools and analytics.",
  },
  {
    category: "EVENT TYPES",
    question: "What is the difference between a workshop and a hackathon?",
    answer:
      "Workshops are typically educational sessions focused on learning specific topics or techniques (a few hours to a full day). Hackathons are competitive coding events where teams build hardware/software prototypes within a limited timeframe (usually 24-48 hours) often ending with judging and prizes.",
  },
  {
    category: "PRICING",
    question: "Is it free to participate in or create an event?",
    answer:
      "Yes! Eventra is an open-source platform that's completely free to use for both participants and event organizers. You can join events, create your own events, and access most features without any cost. Core features remain completely free for communities and individual organizers.",
  },
  {
    category: "COMMUNITY",
    question: "How do the community links (Discord, Telegram, etc.) work?",
    answer:
      "Our community links connect you to chat platforms where Eventra users gather to discuss events, share opportunities, network, and find teammates. You can join these communities to stay updated and connect with like-minded people in your field of interest.",
  },
  {
    category: "ACCOUNT MANAGEMENT",
    question: "How do I edit my profile and manage my account?",
    answer:
      "After logging in, click on your profile picture in the top navigation bar and select 'Edit Profile'. From there, you can update your personal information, profile picture, bio, interests, and notification preferences. You can also track your participation history.",
  },
  {
    category: "TECHNICAL SUPPORT",
    question: "What should I do if I encounter technical issues?",
    answer:
      "If you experience problems, try refreshing your browser or clearing your cache. For persistent issues, contact our support team through the Contact page, join our Discord for real-time help, or report bugs directly on our GitHub repository.",
  },
  {
    category: "EVENT FEATURES",
    question: "Can I host virtual or hybrid events?",
    answer:
      "Absolutely! Eventra supports in-person, virtual, and hybrid events. When creating an event, specify the format and add relevant video meeting links or platform requirements. Our platform handles registration and check-ins seamlessly for all styles.",
  },
  {
    category: "EVENT MANAGEMENT",
    question: "How do I manage attendees and check-ins?",
    answer:
      "Organizers gain access to a comprehensive dashboard with attendee lists, announcement systems, QR code generation for quick check-ins, real-time tracking, and analytics tools to review engagement and improvement data.",
  },
  {
    category: "PRIVACY & SECURITY",
    question: "How is my personal data protected?",
    answer:
      "We take security seriously. Eventra uses industry-standard encryption, secure user authentication, and GDPR compliance parameters. Your personal information is only used for coordinating platform functionality and event matching.",
  },
];

// ─── IMPORTANT: Set this to your navbar's height in px ───────────────────────
const NAVBAR_HEIGHT = 65;
// ─────────────────────────────────────────────────────────────────────────────

export default function FAQSection() {
  const wrapperRefs = useRef([]);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [headerTop, setHeaderTop] = useState(0);

  // Measure the header once it mounts
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const sectionRect = section.getBoundingClientRect();

      // The natural top of the header block relative to viewport
      const naturalTop = sectionRect.top + NAVBAR_HEIGHT;

      if (naturalTop <= NAVBAR_HEIGHT) {
        // Section has scrolled up enough — fix the header just below navbar
        setIsHeaderFixed(true);
        setHeaderTop(NAVBAR_HEIGHT);
      } else {
        // Section hasn't reached the navbar yet — header flows normally
        setIsHeaderFixed(false);
      }

      // Card stacking effect
      const viewportCenter = window.innerHeight / 2;
      wrapperRefs.current.forEach((wrapper) => {
        if (!wrapper) return;
        const card = wrapper.querySelector(".faq-card-inner");
        if (!card) return;
        const rect = wrapper.getBoundingClientRect();
        const scrollProgress = viewportCenter - rect.top;

        if (scrollProgress > 0) {
          const factor = Math.min(scrollProgress / window.innerHeight, 1);
          const scale = 1 - factor * 0.02;
          const blur = factor * 1;
          card.style.transform = `scale(${scale})`;
          card.style.filter = `blur(${blur}px) brightness(${1 - factor * 0.05})`;
        } else {
          card.style.transform = "scale(1)";
          card.style.filter = "none";
        }
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

  // top offset for cards = navbar + fixed header height
  const cardStickyTop = NAVBAR_HEIGHT + headerHeight;

  return (
    <>
      <style>{`
        .faq-section-root {
          background-color: #f9fafb;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111827;
          position: relative;
        }

        /* ── The heading block ── */
        .faq-heading-block {
          text-align: center;
          padding: 60px 20px 32px;
          background: rgba(249, 249, 251, 0.95);
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
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          padding: 20px 20px 16px;
        }

        .faq-heading-block h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 10px;
          color: #111827;
        }

        .faq-heading-block p {
          color: #6b7280;
          font-size: 1.05rem;
          margin: 0 auto;
          max-width: 600px;
        }

        /* Spacer that takes the heading's place in flow when it goes fixed */
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
          max-width: 760px;
          margin-bottom: 60px;
        }

        .faq-card-inner {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.03);
          box-sizing: border-box;
        }

        .faq-cat {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #4f46e5;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .faq-card-inner h3 {
          font-size: 1.25rem;
          color: #111827;
          margin: 0 0 10px;
          font-weight: 600;
        }

        .faq-card-inner p {
          color: #4b5563;
          line-height: 1.6;
          font-size: 0.95rem;
          margin: 0;
        }

        .scroll-spacer {
          height: 50vh;
          pointer-events: none;
        }
      `}</style>

      <div className="faq-section-root" ref={sectionRef}>

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

        {/* Spacer holds the layout space when heading is fixed */}
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
              ref={(el) => (wrapperRefs.current[index] = el)}
              style={{ top: cardStickyTop + 16 }}
            >
              <div className="faq-card-inner">
                <span className="faq-cat">{faq.category}</span>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
          <div className="scroll-spacer" />
        </div>
      </div>
    </>
  );
}