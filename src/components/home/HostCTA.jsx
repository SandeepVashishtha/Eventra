"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus, Mail } from "lucide-react";

export default function HostCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <section className="py-16 border-t border-neutral-200/80 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Submit an event / project callout */}
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Community Submissions
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950">
              Hosting an event or building something new?
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Submit your tech event, global hackathon, or open-source repository. Once reviewed by our editors, it goes live in the public directory for developers worldwide.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/submit-project"
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors inline-flex items-center gap-1.5"
              >
                <span>Submit Opportunity</span>
                <Plus className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/about"
                className="px-5 py-2.5 rounded-full text-xs font-semibold border border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800 transition-colors"
              >
                Submission Guidelines
              </Link>
            </div>
          </div>

          {/* Right: Weekly Digest Newsletter (Minimal Gallery Signature) */}
          <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 text-white space-y-4 shadow-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Weekly Digest
            </span>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Stay ahead of new opportunities.
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Get a hand-curated digest of new hackathons, upcoming workshops, and trending developer tools delivered straight to your inbox every Monday.
            </p>

            {isSubmitted ? (
              <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You're subscribed! Keep an eye on your inbox for the weekly roundup.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="pt-2 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3 bg-neutral-800/90 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-white text-neutral-950 font-semibold text-xs rounded-xl hover:bg-neutral-100 transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] font-mono text-neutral-400">
              No spam, ever. Unsubscribe with a single click at any time.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
