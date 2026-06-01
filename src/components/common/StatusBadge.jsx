import "./StatusBadge.css";

const STATUS_CONFIG = {
  // Event/Hackathon statuses
  upcoming: {
    label: "Upcoming",
    className: "sb-upcoming",
  },

  completed: {
    label: "Ended",
    className: "bg-gray-500 text-white",
  },

  past: {
    label: "Past",
    className: "sb-past",
  },

  ended: {
    label: "Ended",
    className: "sb-ended",
  },

  "in progress": {
    label: "In Progress",
    className: "sb-inprogress",
  },

  live: {
    label: "Live",
    className: "sb-live",
  },

  done: {
    label: "Done",
    className: "sb-completed",
  },

  // Participation types
  registered: {
    label: "Registered",
    className: "sb-registered",
  },

  hosted: {
    label: "Hosted",
    className: "sb-hosted",
  },

  submitted: {
    label: "Submitted",
    className: "sb-submitted",
  },

  contributed: {
    label: "Contributed",
    className: "sb-contributed",
  },

  // Fallback
  "-": {
    label: "-",
    className: "sb-gray",
  },
};

export default function StatusBadge({ status }) {
  if (status === null || status === undefined) return null;
  const normalized = String(status).trim();
  if (!normalized) return null;
  const key = normalized.toLowerCase();
  const config = STATUS_CONFIG[key] ?? {
    label: normalized,
    className: "sb-gray",
  };

  return (
    <span className={`sb-badge ${config.className}`}>
      <span className="sb-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}