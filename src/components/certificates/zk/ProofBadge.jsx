import React from "react";
import { ShieldCheck, Lock, Award, CheckCircle, Clock } from "lucide-react";

/**
 * Proof Badge Component
 * Displays a verified zero-knowledge proof badge for skill certificates.
 * 
 * This component renders a visual representation of a verified ZK proof
 * that can be displayed on a participant's hackathon profile.
 */
export default function ProofBadge({
  commitment = "0xzk_a1b2c3d4e5f6g7h8i9j0",
  label = "Skill Certificate Verified",
  skillName = "",
  issuer = "",
  verified = true,
  isLoading = false,
  size = "md", // 'sm' | 'md' | 'lg'
}) {
  // Determine badge styling based on size
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "p-2",
          icon: "w-4 h-4",
          label: "text-xs",
          details: "text-[10px]",
        };
      case "lg":
        return {
          container: "p-5",
          icon: "w-6 h-6",
          label: "text-sm",
          details: "text-xs",
        };
      default: // md
        return {
          container: "p-4",
          icon: "w-5 h-5",
          label: "text-xs",
          details: "text-[10px]",
        };
    }
  };

  const classes = getSizeClasses();

  // Determine status color
  const getStatusColor = () => {
    if (isLoading) {
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: <Clock className={`w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse`} />,
        iconColor: "text-yellow-600 dark:text-yellow-400",
        statusText: "Verifying...",
      };
    }
    if (verified) {
      return {
        bg: "bg-white dark:bg-gray-900",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: <ShieldCheck className={classes.icon} />,
        iconColor: "text-emerald-500",
        statusText: "ZK-Verified",
      };
    }
    return {
      bg: "bg-gray-50 dark:bg-gray-900",
      border: "border-gray-200 dark:border-gray-800",
      icon: <ShieldCheck className={classes.icon} />,
      iconColor: "text-gray-400",
      statusText: "Pending",
    };
  };

  const status = getStatusColor();

  return (
    <div
      className={`rounded-2xl ${status.bg} border ${status.border} shadow-sm flex items-center justify-between gap-4 select-none transition-all duration-200 hover:shadow-md`}
      role="status"
      aria-label={label}
    >
      <div className={classes.container}>
        <div className="space-y-1">
          {/* Main label */}
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 ${classes.icon}`} />
            <span className={`font-bold text-gray-900 dark:text-white ${classes.label}`}>
              {label}
            </span>
          </div>

          {/* Skill and issuer details */}
          {(skillName || issuer) && (
            <div className="space-y-0.5">
              {skillName && (
                <p className={`text-gray-600 dark:text-gray-400 ${classes.details}`}>
                  Skill: <span className="font-semibold text-gray-900 dark:text-white">{skillName}</span>
                </p>
              )}
              {issuer && (
                <p className={`text-gray-600 dark:text-gray-400 ${classes.details}`}>
                  Issuer: <span className="font-semibold text-gray-900 dark:text-white">{issuer}</span>
                </p>
              )}
            </div>
          )}

          {/* Commitment hash */}
          <p className={`text-gray-400 font-mono ${classes.details} line-clamp-1`}>
            Commit: {commitment.substring(0, 20)}...
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-1.5 pr-4 ${classes.details} font-bold font-mono`}>
        <Lock className={`w-4 h-4 ${status.iconColor}`} />
        <span className={status.iconColor}>{status.statusText}</span>
      </div>
    </div>
  );
}

/**
 * Profile Badge Component
 * A compact version of the proof badge designed for display on user profiles
 */
export function ProfileProofBadge({
  skillName = "Skill Certificate",
  issuer = "",
  verified = true,
  onClick = () => {},
}) {
  return (
    <div
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 text-xs cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && onClick()}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
      <span className="font-semibold text-gray-900 dark:text-white">{skillName}</span>
      {issuer && (
        <span className="text-gray-500 dark:text-gray-400 text-[10px] border-l border-gray-300 dark:border-gray-700 pl-1.5">
          {issuer}
        </span>
      )}
      {verified && (
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          ZK
        </span>
      )}
    </div>
  );
}
