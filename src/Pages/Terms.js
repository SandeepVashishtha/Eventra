import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

// ─── Section data ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Acceptance of Terms",
    color: "indigo",
    content: (
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        By accessing or using <span className="font-semibold text-indigo-600 dark:text-indigo-400">Eventra</span>,
        you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all
        applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
        using or accessing this platform. These terms apply to all visitors, users, and others who access or use
        the Service.
      </p>
    ),
  },
  {
    id: 2,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "User Responsibilities",
    color: "violet",
    content: (
      <>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          As a user of our platform, you agree to the following responsibilities:
        </p>
        <ul className="space-y-2.5">
          {[
            "Provide accurate, current, and complete information during registration and maintain its accuracy",
            "Maintain the security and confidentiality of your account credentials",
            "Accept responsibility for all activities that occur under your account",
            "Not engage in unauthorized use of the platform or interfere with its security features",
            "Comply with all applicable laws and regulations regarding your use of our services",
            "Not use the platform for any illegal or unauthorized purpose",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 3,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Intellectual Property",
    color: "sky",
    content: (
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        The <span className="font-semibold text-sky-600 dark:text-sky-400">Eventra</span> platform and its
        original content, features, and functionality are and will remain the exclusive property of Eventra and
        its licensors. Our platform is protected by copyright, trademark, and other laws of both the United States
        and foreign countries. Our trademarks and trade dress may not be used in connection with any product or
        service without the prior written consent of Eventra. You may not copy, distribute, create derivative
        works, or otherwise exploit any content without express authorization.
      </p>
    ),
  },
  {
    id: 4,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: "Limitation of Liability",
    color: "amber",
    content: (
      <>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          In no event shall Eventra, nor its directors, employees, partners, agents, suppliers, or affiliates,
          be liable for any indirect, incidental, special, consequential or punitive damages, including without
          limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="space-y-2.5">
          {[
            "Your access to or use of or inability to access or use the Service",
            "Any conduct or content of any third party on the Service",
            "Any unauthorized access to or use of our servers and/or personal information stored therein",
            "Any interruption or cessation of transmission to or from the Service",
            "Any bugs, viruses, Trojan horses, or the like that may be transmitted through our Service",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 5,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Changes to Terms",
    color: "emerald",
    content: (
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
        is material, we will provide at least <span className="font-semibold text-emerald-600 dark:text-emerald-400">30 days&apos; notice</span> prior
        to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        By continuing to access or use our Service after those revisions become effective, you agree to be bound
        by the revised terms. If you do not agree to the new terms, please stop using the Service.
      </p>
    ),
  },
  {
    id: 6,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Contact Information",
    color: "rose",
    content: (
      <>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Visit Contact Page
        </Link>
      </>
    ),
  },
];

// ─── Color map ───────────────────────────────────────────────────────────────
const COLOR = {
  indigo: {
    badge: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    icon: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-500/30",
    glow: "group-hover:shadow-indigo-500/10",
    num: "text-indigo-600 dark:text-indigo-400",
  },
  violet: {
    badge: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300",
    icon: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-500/30",
    glow: "group-hover:shadow-violet-500/10",
    num: "text-violet-600 dark:text-violet-400",
  },
  sky: {
    badge: "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300",
    icon: "text-sky-600 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-500/30",
    glow: "group-hover:shadow-sky-500/10",
    num: "text-sky-600 dark:text-sky-400",
  },
  amber: {
    badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
    glow: "group-hover:shadow-amber-500/10",
    num: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
    glow: "group-hover:shadow-emerald-500/10",
    num: "text-emerald-600 dark:text-emerald-400",
  },
  rose: {
    badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300",
    icon: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-500/30",
    glow: "group-hover:shadow-rose-500/10",
    num: "text-rose-600 dark:text-rose-400",
  },
};

// ─── Accordion Section Component ─────────────────────────────────────────────
const AccordionSection = ({ section, isOpen, onToggle, animateIn }) => {
  const contentRef = useRef(null);
  const c = COLOR[section.color];

  return (
    <section
      id={`section-${section.id}`}
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${section.id * 0.07}s, transform 0.5s ease ${section.id * 0.07}s`,
      }}
      className={`group relative rounded-2xl border bg-card-bg/60 backdrop-blur-sm
        shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
        hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${c.glow}
        ${isOpen ? c.border : "border-slate-200 dark:border-white/10"}
        transition-all duration-300`}
    >
      {/* Subtle left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${isOpen ? `bg-${section.color}-400 dark:bg-${section.color}-500` : "bg-transparent"} transition-all duration-300`} />

      {/* Header button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
       aria-label="button">
        <div className="flex items-center gap-4">
          {/* Numbered badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${c.badge} flex items-center justify-center font-bold text-sm transition-all duration-300`}>
            {section.id}
          </div>

          {/* Icon */}
          <span className={`flex-shrink-0 ${c.icon} transition-colors duration-300`}>
            {section.icon}
          </span>

          {/* Title */}
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            {section.title}
          </h2>
        </div>

        {/* Chevron */}
        <span className={`flex-shrink-0 p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10
          group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all duration-200`}>
          <svg
            className={`w-4 h-4 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Collapsible content */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? (contentRef.current ? contentRef.current.scrollHeight + 32 : 600) : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-5 pb-6 pt-1 border-t border-slate-100 dark:border-white/5">
          <div className="pt-4">{section.content}</div>
        </div>
      </div>
    </section>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Terms = () => {
  useDocumentTitle("Eventra | Terms of Service");
  const [openSection, setOpenSection] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const progress = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      setScrollProgress(Math.min(100, progress));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden">

      {/* ── Scroll progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Background ambient blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full
          bg-indigo-200/30 dark:bg-indigo-900/20 blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full
          bg-violet-200/30 dark:bg-violet-900/20 blur-[100px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full
          bg-sky-200/20 dark:bg-sky-900/10 blur-[80px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20">

        {/* ── Hero / Header ── */}
        <header
          className="text-center mb-16"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30
            text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Legal Document
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight
            text-slate-900 dark:text-white mb-4 leading-none">
            Terms of{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500
              dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400 bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-6">
            Please read these terms carefully before using the Eventra platform.
          </p>

          {/* Last updated pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
            text-slate-600 dark:text-slate-400 text-sm shadow-sm">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last updated:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* ── Intro Card ── */}
        <div
          className="relative rounded-2xl overflow-hidden mb-10 p-6 sm:p-8
            bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-700 dark:to-violet-900
            shadow-xl shadow-indigo-500/20 dark:shadow-indigo-900/40"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          {/* Decorative circles */}
          <div aria-hidden className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-md" />
          <div aria-hidden className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-white/10 border border-white/20 mt-0.5">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-2">Welcome to Eventra</h2>
              <p className="text-indigo-100 dark:text-indigo-200 leading-relaxed text-sm sm:text-base">
                By accessing or using our platform, you agree to be bound by the following terms and conditions
                that govern your use of our services. Please read these Terms of Service carefully before using
                our website and services.
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout: TOC + Sections ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sticky Table of Contents ── */}
          <aside
            className="lg:sticky lg:top-24 w-full lg:w-64 flex-shrink-0"
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "translateX(0)" : "translateX(-20px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div className="rounded-2xl border border-slate-200 dark:border-white/10
              bg-card-bg/60 backdrop-blur-sm shadow-sm
              dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {SECTIONS.map((s) => {
                  const c = COLOR[s.color];
                  const isActive = openSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        toggle(s.id);
                        document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 ${
                        isActive
                          ? `${c.badge} font-semibold`
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span className={`flex-shrink-0 font-bold text-xs ${isActive ? "" : "text-slate-400 dark:text-slate-500"}`}>
                        {String(s.id).padStart(2, "0")}
                      </span>
                      {s.title}
                    </button>
                  );
                })}
              </nav>

              {/* Expand/Collapse all */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex gap-2">
                <button
                  onClick={() => setOpenSection(null)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400
                    hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all"
                >
                  Collapse all
                </button>
              </div>
            </div>
          </aside>

          {/* ── Accordion Sections ── */}
          <div className="flex-1 space-y-4">
            {SECTIONS.map((section) => (
              <AccordionSection
                key={section.id}
                section={section}
                isOpen={openSection === section.id}
                onToggle={() => toggle(section.id)}
                animateIn={animateIn}
              />
            ))}
          </div>
        </div>

        {/* ── Footer acceptance banner ── */}
        <footer
          className="mt-16 rounded-2xl p-6 sm:p-8 text-center
            border border-slate-200 dark:border-white/10
            bg-card-bg/60 backdrop-blur-sm shadow-sm
            dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30
            flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
            By using Eventra, you agree to these Terms of Service.
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            If you have questions, visit our{" "}
            <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Contact Page
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Terms;
