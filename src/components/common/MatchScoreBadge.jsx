/**
 * @fileoverview MatchScoreBadge — AI match confidence badge with hover tooltip
 *
 * Displays a color-coded badge derived from a normalised recommendation score
 * (0–100) returned by `calculateRecommendationScore` / `useRecommendations`.
 *
 * Thresholds (mirrors issue #7437 spec):
 *   85–100 → 🟢 "Great Match"   (emerald)
 *   60–84  → 🟡 "Good Match"    (amber)
 *   40–59  → 🔵 "Might Like"    (blue)
 *   < 40   → null (badge hidden)
 *
 * On hover a tooltip lists the top reasons ("Based on your interest in: …").
 *
 * @module components/common/MatchScoreBadge
 */

import { memo, useState, useRef } from "react";
import { Sparkles } from "lucide-react";

// ─── Threshold config ──────────────────────────────────────────────────────

const TIERS = [
  {
    min: 85,
    label: "Great Match",
    dot: "bg-emerald-400",
    badge:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    tooltip: "bg-emerald-900 text-emerald-50",
  },
  {
    min: 60,
    label: "Good Match",
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    tooltip: "bg-amber-900 text-amber-50",
  },
  {
    min: 40,
    label: "Might Like",
    dot: "bg-blue-400",
    badge:
      "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    tooltip: "bg-blue-900 text-blue-50",
  },
];

/**
 * Derive the display tier from a 0–100 score.
 * Returns null when the score is below the lowest threshold.
 *
 * @param {number} score - 0–100 recommendation score
 * @returns {{ label: string, dot: string, badge: string, tooltip: string } | null}
 */
export const getTierFromScore = (score) => {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return TIERS.find((t) => score >= t.min) ?? null;
};

/**
 * Format the confidence percentage shown inside the badge.
 * Clamps to [0, 100] and rounds to the nearest integer.
 *
 * @param {number} score
 * @returns {string}  e.g. "92%"
 */
const formatPercent = (score) => `${Math.min(100, Math.max(0, Math.round(score)))}%`;

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {number}   props.score    - 0–100 recommendation score
 * @param {string[]} [props.reasons] - Human-readable match reasons from the engine
 * @param {string}   [props.className] - Extra Tailwind classes for the wrapper
 */
const MatchScoreBadge = ({ score, reasons = [], className = "" }) => {
  const tier = getTierFromScore(score);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const hideTimer = useRef(null);

  // Don't render anything below the minimum threshold
  if (!tier) return null;

  const showTooltip = () => {
    clearTimeout(hideTimer.current);
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    // Small delay so the cursor can move onto the tooltip itself if needed
    hideTimer.current = setTimeout(() => setTooltipVisible(false), 120);
  };

  const topReasons = Array.isArray(reasons) ? reasons.slice(0, 5) : [];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* ── Badge pill ── */}
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-0.5
          rounded-full border text-[10px] font-bold
          uppercase tracking-wide select-none cursor-default
          transition-opacity duration-150
          ${tier.badge}
        `}
        aria-label={`${tier.label}: ${formatPercent(score)} confidence`}
        role="status"
      >
        {/* Colour dot */}
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tier.dot}`} aria-hidden="true" />
        {tier.label}
        <span className="opacity-70">{formatPercent(score)}</span>
        <Sparkles className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
      </span>

      {/* ── Tooltip ── */}
      {tooltipVisible && topReasons.length > 0 && (
        <div
          role="tooltip"
          className={`
            absolute bottom-full left-0 mb-2 z-50
            min-w-max max-w-[220px]
            rounded-xl px-3 py-2.5 shadow-xl
            text-[11px] font-medium leading-snug
            pointer-events-none
            ${tier.tooltip}
          `}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <p className="opacity-70 mb-1.5 text-[10px] font-semibold uppercase tracking-wider">
            Why this matches you
          </p>
          <ul className="space-y-0.5">
            {topReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="opacity-50 shrink-0 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          {/* Arrow */}
          <div
            className={`absolute top-full left-4 -translate-x-1/2 w-0 h-0
              border-l-[5px] border-l-transparent
              border-r-[5px] border-r-transparent
              border-t-[5px]
            `}
            style={{ borderTopColor: "inherit" }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

MatchScoreBadge.displayName = "MatchScoreBadge";

export default memo(MatchScoreBadge);
