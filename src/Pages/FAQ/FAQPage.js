import { useRef, useState, useEffect, useMemo } from "react";
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
  X,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import FAQCTA from "./FaqCTA";
import SEOHead from "../../components/SEOHead";
import { useTranslation } from "react-i18next";
import { logger } from "../../utils/logger";
import { safeJsonParse } from "../../utils/safeJsonParse";

const NAVBAR_HEIGHT = 65;

export default function FAQSection() {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title={t("faq.pageTitle")}
        description={t("faq.pageDescription")}
        url={window.location.href}
      />
      <FAQSectionInner />
    </>
  );
}

function FAQSectionInner() {
  const { t } = useTranslation();

  const faqs = useMemo(
    () => [
      {
        category: t("faq.categories.gettingStarted"),
        tab: "Hackathons",
        icon: <Sparkles size={18} />,
        question: t("faqQuestions.q1"),
        answer: t("faqQuestions.a1"),
      },
      {
        category: t("faq.categories.eventCreation"),
        tab: "Hackathons",
        icon: <Calendar size={18} />,
        question: t("faqQuestions.q2"),
        answer: t("faqQuestions.a2"),
      },
      {
        category: t("faq.categories.eventTypes"),
        tab: "General",
        icon: <BookOpen size={18} />,
        question: t("faqQuestions.q3"),
        answer: t("faqQuestions.a3"),
      },
      {
        category: t("faq.categories.pricing"),
        tab: "General",
        icon: <Zap size={18} />,
        question: t("faqQuestions.q4"),
        answer: t("faqQuestions.a4"),
      },
      {
        category: t("faq.categories.community"),
        tab: "Hackathons",
        icon: <Users size={18} />,
        question: t("faqQuestions.q5"),
        answer: t("faqQuestions.a5"),
      },
      {
        category: t("faq.categories.accountManagement"),
        tab: "Account",
        icon: <Shield size={18} />,
        question: t("faqQuestions.q6"),
        answer: t("faqQuestions.a6"),
      },
      {
        category: t("faq.categories.technicalSupport"),
        tab: "General",
        icon: <MessageCircle size={18} />,
        question: t("faqQuestions.q7"),
        answer: t("faqQuestions.a7"),
      },
      {
        category: t("faq.categories.eventFeatures"),
        tab: "General",
        icon: <Globe size={18} />,
        question: t("faqQuestions.q8"),
        answer: t("faqQuestions.a8"),
      },
      {
        category: t("faq.categories.eventManagement"),
        tab: "Hackathons",
        icon: <Calendar size={18} />,
        question: t("faqQuestions.q9"),
        answer: t("faqQuestions.a9"),
      },
      {
        category: t("faq.categories.privacySecurity"),
        tab: "Account",
        icon: <Shield size={18} />,
        question: t("faqQuestions.q10"),
        answer: t("faqQuestions.a10"),
      },
    ],
    [t]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.tab?.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, faqs]);

  const suggestions = faqs
    .filter((faq) => {
      const q = searchTerm.toLowerCase().trim();
      return q.length >= 2 && faq.question.toLowerCase().includes(q);
    })
    .slice(0, 5);

  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem("eventra_faq_ratings");
      if (saved) return safeJsonParse(saved, {});
    } catch (e) {
      logger.error("Failed to load FAQ ratings", e);
    }

    const initial = {};
    faqs.forEach((faq, idx) => {
      const yes = 12 + ((idx * 9) % 38);
      const no = 1 + ((idx * 2) % 6);
      initial[faq.question] = { yes, no, voted: null };
    });
    return initial;
  });

  const handleVote = (question, voteType) => {
    setRatings((prev) => {
      const current = prev[question] || { yes: 10, no: 2, voted: null };
      let newYes = current.yes;
      let newNo = current.no;
      let newVoted = voteType;

      if (current.voted === voteType) {
        if (voteType === "yes") newYes = Math.max(0, newYes - 1);
        if (voteType === "no") newNo = Math.max(0, newNo - 1);
        newVoted = null;
      } else {
        if (current.voted === "yes") newYes = Math.max(0, newYes - 1);
        if (current.voted === "no") newNo = Math.max(0, newNo - 1);

        if (voteType === "yes") newYes += 1;
        if (voteType === "no") newNo += 1;
      }

      const updated = {
        ...prev,
        [question]: { yes: newYes, no: newNo, voted: newVoted },
      };

      try {
        localStorage.setItem("eventra_faq_ratings", JSON.stringify(updated));
      } catch (err) {
        logger.error("Failed to save FAQ ratings", err);
      }
      return updated;
    });
  };

  const toggleAccordion = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const wrapperRefs = useRef([]);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [headerTop, setHeaderTop] = useState(0);

  useEffect(() => {
    wrapperRefs.current = [];
  }, [searchTerm, selectedCategory, filteredFaqs]);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .faq-section-root {
          transition: background-color 0.3s ease, color 0.3s ease;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
          --shadow-lg: 0 8px 24px rgba(0,0,0,0.15);
          --shadow-xl: 0 16px 40px rgba(0,0,0,0.18);
          --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
          --bg-secondary: rgba(0,0,0,0.03);
          --text-muted: #9ca3af;
          --bg-primary: #fafbfc;
          --bg-secondary: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --card-bg: #ffffff;
          --card-border: #e2e8f0;
          --card-hover-border: #cbd5e1;
          --accent-primary: #6366f1;
          --accent-secondary: #8b5cf6;
          --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          --icon-bg: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
          --icon-color: #6366f1;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: relative;
          min-height: 100vh;
        }

        .dark .faq-section-root {
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
          --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
          --shadow-xl: 0 16px 40px rgba(0,0,0,0.6);
          --bg-secondary: rgba(255,255,255,0.03);
          --text-muted: #6b7280;
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --text-muted: #64748b;
          --card-bg: #1e293b;
          --card-border: #334155;
          --card-hover-border: #475569;
          --accent-primary: #818cf8;
          --accent-secondary: #a78bfa;
          --accent-gradient: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          --icon-bg: linear-gradient(135deg, #312e81 0%, #3b0764 100%);
          --icon-color: #818cf8;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        }

        .faq-background-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .dark .faq-background-pattern {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(129, 140, 248, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.08) 0%, transparent 50%);
        }

        .faq-heading-block {
          text-align: center;
          padding: 72px 20px 40px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .faq-heading-inner {
          max-width: 760px;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .faq-heading-block.is-fixed {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 90;
          border-bottom: 1px solid var(--card-border);
          padding: 16px 20px 20px;
          background: var(--bg-primary);
          box-shadow: var(--shadow-lg);
        }

        .faq-heading-block h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 16px;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .faq-heading-block p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin: 0 auto 32px;
          max-width: 600px;
          line-height: 1.6;
          font-weight: 400;
        }

        .faq-heading-spacer { width: 100%; }

        .faq-cards-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px 60px;
          max-width: 860px;
          margin: 0 auto;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

        .card-pin-wrapper {
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }

        .faq-accordion-item {
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }

        .faq-accordion-item:hover {
          border-color: var(--card-hover-border);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .faq-accordion-header {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 26px 28px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          background: var(--card-bg);
          border: none;
          width: 100%;
          text-align: left;
        }

        .faq-accordion-header:focus-visible {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }

        .faq-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--icon-bg);
          color: var(--icon-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }

        .faq-accordion-item:hover .faq-icon {
          transform: scale(1.05);
          box-shadow: var(--shadow-md);
        }

        .faq-accordion-title-group {
          flex: 1;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .faq-cat {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent-primary);
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .faq-accordion-header h3 {
          font-size: 1.125rem;
          line-height: 1.5;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
          font-weight: 600;
        }

        .faq-chevron {
          width: 28px;
          height: 28px;
          color: var(--accent-primary);
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 8px;
        }

        .dark .faq-chevron {
          background: rgba(129, 140, 248, 0.1);
        }

        .faq-accordion-item.expanded .faq-chevron {
          transform: rotate(180deg);
        }

        .faq-accordion-content {
          max-height: 0;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-top: 1px solid transparent;
        }

        .faq-accordion-item.expanded .faq-accordion-content {
          border-top: 1px solid var(--card-border);
        }

        .faq-answer-wrapper {
          padding: 26px 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .faq-accordion-content p {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
        }

        .faq-helpfulness {
          margin-top: 8px;
          padding-top: 24px;
          border-top: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-helpfulness-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .faq-vote-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .faq-vote-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--card-bg);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .faq-vote-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .faq-vote-btn.voted-yes {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
          border-color: #22c55e;
          color: #16a34a;
        }

        .faq-vote-btn.voted-no {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
          border-color: #ef4444;
          color: #dc2626;
        }

        .faq-vote-btn:not(.voted-yes):not(.voted-no) {
          background: var(--bg-secondary);
          border-color: var(--card-border);
          color: var(--text-secondary);
        }

        .faq-vote-btn:not(.voted-yes):not(.voted-no):hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .scroll-spacer {
          height: 40px;
          pointer-events: none;
        }

        .search-wrap {
          position: relative;
          width: 100%;
          max-width: 560px;
          margin: 0 auto 28px;
        }

        .search-input {
          width: 100%;
          padding: 16px 52px 16px 52px;
          border-radius: 14px;
          border: 2px solid var(--card-border);
          background: var(--card-bg);
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
          color: var(--text-primary);
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), var(--shadow-md);
        }

        .dark .search-input:focus {
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1), var(--shadow-md);
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          transition: color 0.2s ease;
        }

        .search-input:focus + .search-icon {
          color: var(--accent-primary);
        }

        .clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          padding: 8px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .suggestions {
          position: absolute;
          top: calc(100% + 8px);
          width: 100%;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          box-shadow: var(--shadow-xl);
          z-index: 60;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .suggestion-item {
          padding: 14px 18px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--card-border);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        }

        .dark .suggestion-item:hover {
          background: linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
        }

        .category-filters {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .category-btn {
          padding: 10px 24px;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          cursor: pointer;
          background: var(--card-bg);
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
        }

        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .category-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .dark .category-btn.active {
          box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
        }

        .empty-state {
          max-width: 600px;
          width: 100%;
          margin: 32px auto 64px;
          text-align: center;
          padding: 48px 32px;
          border-radius: 20px;
          border: 2px dashed var(--card-border);
          background: var(--card-bg);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-state-icon {
          display: inline-flex;
          padding: 16px;
          border-radius: 16px;
          background: var(--icon-bg);
          color: var(--icon-color);
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .empty-state p {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 400px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .empty-state-btn {
          padding: 12px 32px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: var(--accent-gradient);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .empty-state-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        @media (max-width: 768px) {
          .faq-heading-block {
            padding: 60px 16px 32px;
          }

          .faq-heading-block h2 {
            font-size: 2rem;
          }

          .faq-heading-block p {
            font-size: 1rem;
          }

          .faq-accordion-header {
            padding: 22px 20px;
            gap: 16px;
          }

          .faq-answer-wrapper {
            padding: 22px 20px 28px;
          }

          .faq-accordion-header h3 {
            font-size: 1.05rem;
          }

          .faq-cards-container {
            padding: 28px 16px 50px;
          }

          .card-pin-wrapper {
            margin-bottom: 16px;
          }

          .search-input {
            padding: 14px 48px 14px 48px;
            font-size: 14px;
          }

          .category-btn {
            padding: 8px 18px;
            font-size: 0.8125rem;
          }
        }

        @media (max-width: 480px) {
          .faq-heading-block h2 {
            font-size: 1.75rem;
          }

          .faq-icon {
            width: 40px;
            height: 40px;
          }

          .faq-vote-btn {
            padding: 8px 16px;
            font-size: 0.8125rem;
          }
        }
      `}</style>

      <div className="faq-section-root" ref={sectionRef}>
        <div className="faq-background-pattern" />

        <div
          ref={headerRef}
          className={`faq-heading-block${isHeaderFixed ? " is-fixed" : ""}`}
          style={isHeaderFixed ? { top: headerTop } : {}}
        >
          <div className="faq-heading-inner">
            <h2>{t("faq.heading")}</h2>
            <p>{t("faq.subtitle")}</p>

            <div className="search-wrap">
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={t("faq.searchPlaceholder")}
                className="search-input"
                aria-label="Search FAQ"
              />
              <Search className="search-icon h-5 w-5" aria-hidden="true" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setShowSuggestions(false);
                  }}
                  className="clear-btn"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions" ref={suggestionsRef} role="listbox">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      role="option"
                      onClick={() => {
                        setSearchTerm(s.question);
                        setShowSuggestions(false);
                      }}
                    >
                      <Search size={14} aria-hidden="true" />
                      {s.question}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="category-filters" role="tablist" aria-label="Filter FAQ categories">
              {[
                { key: "All", label: t("faq.filterAll") },
                { key: "General", label: t("faq.filterGeneral") },
                { key: "Hackathons", label: t("faq.filterHackathons") },
                { key: "Account", label: t("faq.filterAccount") },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`category-btn${selectedCategory === c.key ? " active" : ""}`}
                  role="tab"
                  aria-selected={selectedCategory === c.key}
                  aria-controls="faq-list"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isHeaderFixed && <div style={{ height: headerHeight }} />}

        <div className="faq-cards-container" id="faq-list" role="tabpanel">
          {filteredFaqs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <HelpCircle className="h-10 w-10" />
              </div>
              <h3>{t("faq.emptyTitle")}</h3>
              <p>{t("faq.emptyDescription", { searchTerm, selectedCategory })}</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="empty-state-btn"
              >
                {t("faq.emptyClearFilters")}
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedItems.has(index);

              return (
                <div
                  key={index}
                  className="card-pin-wrapper"
                  ref={(el) => {
                    if (el) wrapperRefs.current[index] = el;
                  }}
                >
                  <div className={`faq-accordion-item${isExpanded ? " expanded" : ""}`}>
                    <button
                      className="faq-accordion-header"
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={isExpanded}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="faq-icon" aria-hidden="true">
                        {faq.icon}
                      </span>
                      <div className="faq-accordion-title-group">
                        <span className="faq-cat">{faq.category}</span>
                        <h3>{faq.question}</h3>
                      </div>
                      <div className="faq-chevron" aria-hidden="true">
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    <div
                      className="faq-accordion-content"
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      style={{
                        maxHeight: isExpanded ? "2000px" : "0px",
                      }}
                    >
                      <div className="faq-answer-wrapper">
                        <p>{faq.answer}</p>

                        <div className="faq-helpfulness">
                          <span className="faq-helpfulness-label">{t("faq.helpfulnessLabel")}</span>
                          <div className="faq-vote-buttons">
                            <button
                              onClick={() => handleVote(faq.question, "yes")}
                              className={`faq-vote-btn ${
                                ratings[faq.question]?.voted === "yes" ? "voted-yes" : ""
                              }`}
                              aria-pressed={ratings[faq.question]?.voted === "yes"}
                            >
                              <ThumbsUp size={16} />
                              {t("common.yes")} ({ratings[faq.question]?.yes || 0})
                            </button>
                            <button
                              onClick={() => handleVote(faq.question, "no")}
                              className={`faq-vote-btn ${
                                ratings[faq.question]?.voted === "no" ? "voted-no" : ""
                              }`}
                              aria-pressed={ratings[faq.question]?.voted === "no"}
                            >
                              <ThumbsDown size={16} />
                              {t("common.no")} ({ratings[faq.question]?.no || 0})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {filteredFaqs.length > 0 && <div className="scroll-spacer" />}
        </div>
        <FAQCTA />
      </div>
    </>
  );
}
