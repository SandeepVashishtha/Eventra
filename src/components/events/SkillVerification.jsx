import {
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ShieldCheck,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const VERIFICATION_SOURCES = [
  {
    value: "event",
    label: "Event Participation",
    description:
      "Verified through successful participation in an Eventra event.",
    icon: UserCheck,
  },
  {
    value: "submission",
    label: "Hackathon Submission",
    description:
      "Verified through a project or hackathon submission.",
    icon: Award,
  },
  {
    value: "endorsement",
    label: "Organizer Endorsement",
    description:
      "Verified by an event organizer.",
    icon: ShieldCheck,
  },
  {
    value: "certificate",
    label: "Certificate",
    description:
      "Verified using an eligible certificate.",
    icon: Award,
  },
  {
    value: "assessment",
    label: "Skill Assessment",
    description:
      "Verified through a skill assessment.",
    icon: Star,
  },
];

const initialSkills = [
  {
    id: "skill-1",
    name: "JavaScript",
    level: "Advanced",
    verified: true,
    verificationSource: "assessment",
    verifiedAt: "2026-08-01",
    status: "verified",
  },
  {
    id: "skill-2",
    name: "React",
    level: "Intermediate",
    verified: false,
    verificationSource: null,
    verifiedAt: null,
    status: "unverified",
  },
];

const SkillVerification = ({
  initialData = initialSkills,
  isOwner = true,
  isOrganizer = false,
  onRequestVerification,
  onVerifySkill,
  onRejectVerification,
  className = "",
}) => {
  const [skills, setSkills] =
    useState(initialData);

  const [selectedSkill, setSelectedSkill] =
    useState(null);

  const [selectedSource, setSelectedSource] =
    useState("event");

  const [requestMessage, setRequestMessage] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [saving, setSaving] =
    useState(false);

  const summary = useMemo(() => {
    return {
      total: skills.length,
      verified: skills.filter(
        (skill) =>
          skill.status === "verified"
      ).length,
      pending: skills.filter(
        (skill) =>
          skill.status === "pending"
      ).length,
      unverified: skills.filter(
        (skill) =>
          skill.status === "unverified"
      ).length,
    };
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (filter === "all") {
      return skills;
    }

    return skills.filter(
      (skill) =>
        skill.status === filter
    );
  }, [skills, filter]);

  const requestVerification = async () => {
    if (!selectedSkill) {
      return;
    }

    setSaving(true);

    const request = {
      skillId: selectedSkill.id,
      skillName: selectedSkill.name,
      source: selectedSource,
      message:
        requestMessage.trim(),
      requestedAt:
        new Date().toISOString(),
    };

    try {
      await onRequestVerification?.(
        request
      );

      setSkills((current) =>
        current.map((skill) =>
          skill.id ===
          selectedSkill.id
            ? {
                ...skill,
                status: "pending",
                verificationSource:
                  selectedSource,
              }
            : skill
        )
      );

      setSelectedSkill(null);
      setRequestMessage("");
    } finally {
      setSaving(false);
    }
  };

  const verifySkill = async (
    skill
  ) => {
    try {
      await onVerifySkill?.(skill);

      setSkills((current) =>
        current.map((item) =>
          item.id === skill.id
            ? {
                ...item,
                verified: true,
                status: "verified",
                verifiedAt:
                  new Date().toISOString(),
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Verification failed:",
        error
      );
    }
  };

  const rejectSkill = async (
    skill
  ) => {
    try {
      await onRejectVerification?.(
        skill
      );

      setSkills((current) =>
        current.map((item) =>
          item.id === skill.id
            ? {
                ...item,
                verified: false,
                status: "unverified",
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Rejection failed:",
        error
      );
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Profile
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Skill Verification
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Build trust by verifying skills through
              participation, submissions, endorsements,
              certificates, and assessments.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Verified Skills
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {summary.verified}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Total Skills"
          value={summary.total}
          type="neutral"
        />

        <SummaryCard
          label="Verified"
          value={summary.verified}
          type="verified"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          type="pending"
        />

        <SummaryCard
          label="Unverified"
          value={summary.unverified}
          type="unverified"
        />
      </div>

      {/* Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["all", "All Skills"],
          ["verified", "Verified"],
          ["pending", "Pending"],
          ["unverified", "Unverified"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setFilter(value)
            }
            className={`rounded-xl px-4 py-2 text-[7px] font-bold transition ${
              filter === value
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Skills */}
      <div className="mt-5 space-y-3">
        {filteredSkills.length === 0 ? (
          <EmptyState />
        ) : (
          filteredSkills.map(
            (skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isOwner={isOwner}
                isOrganizer={
                  isOrganizer
                }
                onRequest={() => {
                  setSelectedSkill(
                    skill
                  );
                }}
                onVerify={() =>
                  verifySkill(skill)
                }
                onReject={() =>
                  rejectSkill(skill)
                }
              />
            )
          )
        )}
      </div>

      {/* Verification Sources */}
      <VerificationSources />

      {/* Verification Modal */}
      {selectedSkill && (
        <VerificationModal
          skill={selectedSkill}
          selectedSource={
            selectedSource
          }
          setSelectedSource={
            setSelectedSource
          }
          message={requestMessage}
          setMessage={
            setRequestMessage
          }
          saving={saving}
          onClose={() =>
            setSelectedSkill(null)
          }
          onSubmit={
            requestVerification
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Skill Card
--------------------------------- */

const SkillCard = ({
  skill,
  isOwner,
  isOrganizer,
  onRequest,
  onVerify,
  onReject,
}) => {
  const source =
    VERIFICATION_SOURCES.find(
      (item) =>
        item.value ===
        skill.verificationSource
    );

  const SourceIcon =
    source?.icon || ShieldCheck;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              skill.status ===
              "verified"
                ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                : skill.status ===
                  "pending"
                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {skill.status ===
            "verified" ? (
              <CheckCircle2 size={18} />
            ) : skill.status ===
              "pending" ? (
              <Clock3 size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold text-slate-800 dark:text-white">
                {skill.name}
              </p>

              <LevelBadge
                level={skill.level}
              />

              {skill.status ===
                "verified" && (
                <VerifiedBadge />
              )}
            </div>

            {source && (
              <div className="mt-1 flex items-center gap-1.5">
                <SourceIcon
                  size={10}
                  className="text-slate-400"
                />

                <p className="text-[7px] text-slate-400">
                  {source.label}
                </p>
              </div>
            )}

            {skill.verifiedAt &&
              skill.status ===
                "verified" && (
                <p className="mt-1 text-[6px] text-slate-400">
                  Verified{" "}
                  {formatDate(
                    skill.verifiedAt
                  )}
                </p>
              )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner &&
            skill.status ===
              "unverified" && (
              <button
                type="button"
                onClick={onRequest}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
              >
                Request Verification
              </button>
            )}

          {isOrganizer &&
            skill.status ===
              "pending" && (
              <>
                <button
                  type="button"
                  onClick={onVerify}
                  className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-green-700"
                >
                  <Check size={12} />
                  Verify
                </button>

                <button
                  type="button"
                  onClick={onReject}
                  className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-4 py-2.5 text-[7px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </>
            )}

          {skill.status ===
            "pending" && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-4 py-2.5 text-[7px] font-bold text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
              <Clock3 size={12} />
              Verification Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Verified Badge
--------------------------------- */

const VerifiedBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
      <Check size={9} />
      Verified
    </span>
  );
};

/* --------------------------------
   Level Badge
--------------------------------- */

const LevelBadge = ({
  level,
}) => {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
      {level}
    </span>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  type,
}) => {
  const styles = {
    neutral:
      "text-slate-800 dark:text-white",
    verified:
      "text-green-600 dark:text-green-400",
    pending:
      "text-amber-600 dark:text-amber-400",
    unverified:
      "text-slate-500 dark:text-slate-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${styles[type]}`}
      >
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Verification Sources
--------------------------------- */

const VerificationSources = () => {
  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={18}
          className="mt-0.5 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
            Supported Verification Sources
          </p>

          <p className="mt-1 text-[7px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
            Skills can be verified through multiple trusted
            sources.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VERIFICATION_SOURCES.map(
          (source) => {
            const Icon =
              source.icon;

            return (
              <div
                key={source.value}
                className="rounded-xl bg-white p-3 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    size={14}
                    className="text-indigo-600 dark:text-indigo-400"
                  />

                  <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                    {source.label}
                  </p>
                </div>

                <p className="mt-2 text-[7px] leading-4 text-slate-400">
                  {source.description}
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Verification Modal
--------------------------------- */

const VerificationModal = ({
  skill,
  selectedSource,
  setSelectedSource,
  message,
  setMessage,
  saving,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Verification Request
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Verify {skill.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="mt-5">
          <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Verification Source
          </label>

          <div className="mt-2 relative">
            <select
              value={
                selectedSource
              }
              onChange={(event) =>
                setSelectedSource(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {VERIFICATION_SOURCES.map(
                (source) => (
                  <option
                    key={source.value}
                    value={
                      source.value
                    }
                  >
                    {source.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Supporting Details
          </label>

          <textarea
            rows={4}
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            placeholder="Provide details about your participation, certificate, assessment, or endorsement..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <ShieldCheck size={14} />

            {saving
              ? "Sending..."
              : "Request Verification"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <ShieldCheck
        size={28}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No skills found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try another filter or add skills to the participant
        profile.
      </p>
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default SkillVerification;