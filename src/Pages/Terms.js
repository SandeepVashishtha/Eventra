import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

// ─── Section data ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Acceptance of Terms",
    color: "indigo",
    content: (
      <p className="text-text-light leading-relaxed">
        By accessing or using <span className="text-primary font-semibold">Eventra</span>, you
        acknowledge that you have read, understood, and agree to be bound by these Terms of Service
        and all applicable laws and regulations. If you do not agree with any of these terms, you
        are prohibited from using or accessing this platform. These terms apply to all visitors,
        users, and others who access or use the Service.
      </p>
    ),
  },
  {
    id: 2,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    title: "User Responsibilities",
    color: "violet",
    content: (
      <>
        <p className="text-text-light mb-4 leading-relaxed">
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
            <li key={i} className="text-text-light flex items-start gap-3 text-sm">
              <span className="bg-secondary/15 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <svg
                  className="text-secondary h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
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
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: "Intellectual Property",
    color: "sky",
    content: (
      <p className="text-text-light leading-relaxed">
        The <span className="text-primary font-semibold">Eventra</span> platform and its original
        content, features, and functionality are and will remain the exclusive property of Eventra
        and its licensors. Our platform is protected by copyright, trademark, and other laws of both
        the United States and foreign countries. Our trademarks and trade dress may not be used in
        connection with any product or service without the prior written consent of Eventra. You may
        not copy, distribute, create derivative works, or otherwise exploit any content without
        express authorization.
      </p>
    ),
  },
  {
    id: 4,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    title: "Limitation of Liability",
    color: "amber",
    content: (
      <>
        <p className="text-text-light mb-4 leading-relaxed">
          In no event shall Eventra, nor its directors, employees, partners, agents, suppliers, or
          affiliates, be liable for any indirect, incidental, special, consequential or punitive
          damages, including without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from:
        </p>
        <ul className="space-y-2.5">
          {[
            "Your access to or use of or inability to access or use the Service",
            "Any conduct or content of any third party on the Service",
            "Any unauthorized access to or use of our servers and/or personal information stored therein",
            "Any interruption or cessation of transmission to or from the Service",
            "Any bugs, viruses, Trojan horses, or the like that may be transmitted through our Service",
          ].map((item, i) => (
            <li key={i} className="text-text-light flex items-start gap-3 text-sm">
              <span className="bg-secondary/15 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <svg
                  className="text-secondary h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    title: "Changes to Terms",
    color: "emerald",
    content: (
      <p className="text-text-light leading-relaxed">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
        If a revision is material, we will provide at least{" "}
        <span className="text-primary font-semibold">30 days&apos; notice</span> prior to any new
        terms taking effect. What constitutes a material change will be determined at our sole
        discretion. By continuing to access or use our Service after those revisions become
        effective, you agree to be bound by the revised terms. If you do not agree to the new terms,
        please stop using the Service.
      </p>
    ),
  },
  {
    id: 6,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Contact Information",
    color: "rose",
    content: (
      <>
        <p className="text-text-light mb-4 leading-relaxed">
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <Link
          to="/contact"
          className="bg-secondary/10 border-secondary/20 text-secondary inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
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
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
    border: "border-primary/30",
    glow: "group-hover:shadow-primary/10",
    num: "text-primary",
  },
  violet: {
    badge: "bg-secondary/10 text-secondary",
    icon: "text-secondary",
    border: "border-secondary/30",
    glow: "group-hover:shadow-secondary/10",
    num: "text-secondary",
  },
  sky: {
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
    border: "border-primary/30",
    glow: "group-hover:shadow-primary/10",
    num: "text-primary",
  },
  amber: {
    badge: "bg-secondary/10 text-secondary",
    icon: "text-secondary",
    border: "border-secondary/30",
    glow: "group-hover:shadow-secondary/10",
    num: "text-secondary",
  },
  emerald: {
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
    border: "border-primary/30",
    glow: "group-hover:shadow-primary/10",
    num: "text-primary",
  },
  rose: {
    badge: "bg-secondary/10 text-secondary",
    icon: "text-secondary",
    border: "border-secondary/30",
    glow: "group-hover:shadow-secondary/10",
    num: "text-secondary",
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
      className={`group bg-card-bg/60 relative rounded-2xl border shadow-sm backdrop-blur-sm hover:shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] ${c.glow} ${isOpen ? c.border : "border-border"} transition-all duration-300`}
    >
      {/* Subtle left accent bar */}
      <div
        className={`absolute top-4 bottom-4 left-0 w-0.5 rounded-full ${isOpen ? (["indigo", "sky", "emerald"].includes(section.color) ? "bg-primary" : "bg-secondary") : "bg-transparent"} transition-all duration-300`}
      />

      {/* Header button */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
        aria-label="button"
      >
        <div className="flex items-center gap-4">
          {/* Numbered badge */}
          <div
            className={`h-8 w-8 flex-shrink-0 rounded-xl ${c.badge} flex items-center justify-center text-sm font-bold transition-all duration-300`}
          >
            {section.id}
          </div>

          {/* Icon */}
          <span className={`flex-shrink-0 ${c.icon} transition-colors duration-300`}>
            {section.icon}
          </span>

          {/* Title */}
          <h2 className="text-text text-base leading-snug font-semibold">{section.title}</h2>
        </div>

        {/* Chevron */}
        <span
          className={`border-border flex-shrink-0 rounded-lg border bg-slate-50 p-2 transition-all duration-200 group-hover:border-slate-300 dark:bg-white/5 dark:group-hover:border-white/20`}
        >
          <svg
            className={`text-text-light h-4 w-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        <div className="border-border border-t px-5 pt-1 pb-6">
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
    <div className="bg-bg text-text relative min-h-screen overflow-x-hidden">
      {/* ── Scroll progress bar ── */}
      <div className="fixed top-0 right-0 left-0 z-50 h-0.5 bg-transparent">
        <div
          className="from-primary to-secondary h-full bg-gradient-to-r transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Background ambient blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="bg-primary/10 dark:bg-primary/5 absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full blur-[100px]"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="bg-secondary/10 dark:bg-secondary/5 absolute -right-40 -bottom-40 h-[500px] w-[500px] animate-pulse rounded-full blur-[100px]"
          style={{ animationDuration: "10s" }}
        />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        {/* ── Hero / Header ── */}
        <header
          className="mb-16 text-center"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Badge */}
          <div className="bg-primary/10 border-primary/25 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Legal Document
          </div>

          {/* Title */}
          <h1 className="text-text mb-4 text-5xl leading-none font-extrabold tracking-tight sm:text-6xl">
            Terms of{" "}
            <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
              Service
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-text-light mx-auto mb-6 max-w-xl text-lg leading-relaxed">
            Please read these terms carefully before using the Eventra platform.
          </p>

          {/* Last updated pill */}
          <div className="border-border text-text-light inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm shadow-sm dark:bg-white/5">
            <svg
              className="h-4 w-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Last updated:{" "}
            <span className="text-text font-medium">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* ── Intro Card ── */}
        <div
          className="from-primary to-secondary shadow-glow-md relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-xl sm:p-8"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          {/* Decorative circles */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-md"
          />
          <div
            aria-hidden
            className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5"
          />

          <div className="relative flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0 rounded-xl border border-white/20 bg-white/10 p-2.5">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-white">Welcome to Eventra</h2>
              <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                By accessing or using our platform, you agree to be bound by the following terms and
                conditions that govern your use of our services. Please read these Terms of Service
                carefully before using our website and services.
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout: TOC + Sections ── */}
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* ── Sticky Table of Contents ── */}
          <aside
            className="w-full flex-shrink-0 lg:sticky lg:top-24 lg:w-64"
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "translateX(0)" : "translateX(-20px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div className="border-border bg-card-bg/60 rounded-2xl border p-5 shadow-sm backdrop-blur-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <h3 className="text-text-light mb-4 text-xs font-bold tracking-widest uppercase">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {SECTIONS.map((s) => {
                  const isActive = openSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        toggle(s.id);
                        document
                          .getElementById(`section-${s.id}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                        isActive
                          ? `bg-primary/10 text-primary font-semibold`
                          : "text-text-light hover:text-text hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 text-xs font-bold ${isActive ? "text-primary" : "text-text-light/60"}`}
                      >
                        {String(s.id).padStart(2, "0")}
                      </span>
                      {s.title}
                    </button>
                  );
                })}
              </nav>

              {/* Expand/Collapse all */}
              <div className="border-border mt-4 flex gap-2 border-t pt-4">
                <button
                  onClick={() => setOpenSection(null)}
                  className="text-text-light border-border flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:bg-slate-50 dark:hover:bg-white/5"
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
          className="border-border bg-card-bg/60 mt-16 rounded-2xl border p-6 text-center shadow-sm backdrop-blur-sm sm:p-8 dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
          }}
        >
          <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border">
            <svg
              className="text-primary h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-text mb-1 font-medium">
            By using Eventra, you agree to these Terms of Service.
          </p>
          <p className="text-text-light text-sm">
            If you have questions, visit our{" "}
            <Link to="/contact" className="text-primary font-medium hover:underline">
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
