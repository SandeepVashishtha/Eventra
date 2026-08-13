import {
  Award,
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: 1,
    name: "Aarav Patel",
    email: "aarav@example.com",
    attendance: 100,
    eligible: true,
    certificateStatus: "Ready",
    notified: false,
  },
  {
    id: 2,
    name: "Priya Shah",
    email: "priya@example.com",
    attendance: 90,
    eligible: true,
    certificateStatus: "Ready",
    notified: true,
  },
  {
    id: 3,
    name: "Rahul Mehta",
    email: "rahul@example.com",
    attendance: 60,
    eligible: false,
    certificateStatus: "Not Eligible",
    notified: false,
  },
  {
    id: 4,
    name: "Neha Patel",
    email: "neha@example.com",
    attendance: 85,
    eligible: true,
    certificateStatus: "Pending Review",
    notified: false,
  },
];

const EventPostEventAttendanceCertificateAutomation = ({
  participants = DEFAULT_PARTICIPANTS,
  minimumAttendance = 75,
  eventCompleted = true,
  onIssueCertificates,
  onNotifyParticipants,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const analytics = useMemo(() => {
    const total = participants.length;

    const eligible = participants.filter(
      (participant) =>
        participant.attendance >= minimumAttendance &&
        participant.eligible
    );

    const notEligible = participants.filter(
      (participant) =>
        participant.attendance < minimumAttendance ||
        !participant.eligible
    );

    const ready = participants.filter(
      (participant) =>
        participant.certificateStatus === "Ready"
    );

    const pending = participants.filter(
      (participant) =>
        participant.certificateStatus === "Pending Review"
    );

    const notified = participants.filter(
      (participant) => participant.notified
    );

    return {
      total,
      eligible: eligible.length,
      notEligible: notEligible.length,
      ready: ready.length,
      pending: pending.length,
      notified: notified.length,
    };
  }, [participants, minimumAttendance]);

  const eligibleParticipants = participants.filter(
    (participant) =>
      participant.attendance >= minimumAttendance &&
      participant.eligible
  );

  const toggleParticipant = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const selectAllEligible = () => {
    if (selectedIds.length === eligibleParticipants.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      eligibleParticipants.map((participant) => participant.id)
    );
  };

  const handleGenerate = async () => {
    setProcessing(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    setProcessing(false);
    setProcessed(true);

    if (onIssueCertificates) {
      onIssueCertificates(
        participants.filter((participant) =>
          selectedIds.includes(participant.id)
        )
      );
    }
  };

  const handleNotify = () => {
    if (onNotifyParticipants) {
      onNotifyParticipants(
        participants.filter((participant) =>
          selectedIds.includes(participant.id)
        )
      );
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Award size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Post-Event Automation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Attendance Certificate Automation
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Verify attendance, identify eligible participants,
              prepare certificates, and notify participants after
              the event concludes.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${
            eventCompleted
              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
          }`}
        >
          {eventCompleted ? (
            <CheckCircle2
              size={15}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <Clock3
              size={15}
              className="text-amber-600 dark:text-amber-400"
            />
          )}

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Event Status
            </p>

            <p
              className={`text-[8px] font-black ${
                eventCompleted
                  ? "text-green-700 dark:text-green-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {eventCompleted ? "Completed" : "In Progress"}
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Rule */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div className="flex-1">
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              Certificate Eligibility
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Participants must meet the configured attendance
              requirement before a certificate can be prepared.
            </p>

            <div className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
              <span className="text-[7px] font-black text-indigo-700 dark:text-indigo-300">
                Minimum attendance: {minimumAttendance}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Users}
          label="Participants"
          value={analytics.total}
        />

        <MetricCard
          icon={CheckCircle2}
          label="Eligible"
          value={analytics.eligible}
        />

        <MetricCard
          icon={XCircle}
          label="Not Eligible"
          value={analytics.notEligible}
        />

        <MetricCard
          icon={FileCheck2}
          label="Ready"
          value={analytics.ready}
        />

        <MetricCard
          icon={Bell}
          label="Notified"
          value={analytics.notified}
        />
      </div>

      {/* Processing Steps */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <ProcessStep
          number="1"
          icon={Users}
          title="Verify Attendance"
          description="Check participant attendance records."
          completed={eventCompleted}
        />

        <ProcessStep
          number="2"
          icon={ShieldCheck}
          title="Check Eligibility"
          description="Apply certificate eligibility rules."
          completed={analytics.eligible > 0}
        />

        <ProcessStep
          number="3"
          icon={FileCheck2}
          title="Prepare Certificates"
          description="Generate certificates for review."
          completed={processed || analytics.ready > 0}
        />

        <ProcessStep
          number="4"
          icon={Bell}
          title="Notify Participants"
          description="Notify participants after issuance."
          completed={analytics.notified > 0}
        />
      </div>

      {/* Participant Review */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Certificate Review Queue
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Review eligible participants before final issuance.
              </p>
            </div>

            <button
              type="button"
              onClick={selectAllEligible}
              className="rounded-xl border border-slate-200 px-3 py-2 text-[6px] font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
            >
              {selectedIds.length ===
              eligibleParticipants.length
                ? "Clear Selection"
                : "Select All Eligible"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {participants.map((participant) => {
            const isEligible =
              participant.attendance >= minimumAttendance &&
              participant.eligible;

            const selected = selectedIds.includes(
              participant.id
            );

            return (
              <div
                key={participant.id}
                className="p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!isEligible}
                    onChange={() =>
                      toggleParticipant(participant.id)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                          {participant.name}
                        </h4>

                        <p className="mt-1 text-[6px] text-slate-400">
                          {participant.email}
                        </p>
                      </div>

                      <StatusBadge
                        eligible={isEligible}
                        status={
                          participant.certificateStatus
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <DetailMetric
                        label="Attendance"
                        value={`${participant.attendance}%`}
                      />

                      <DetailMetric
                        label="Eligibility"
                        value={
                          isEligible
                            ? "Eligible"
                            : "Not Eligible"
                        }
                      />

                      <DetailMetric
                        label="Certificate"
                        value={
                          participant.certificateStatus
                        }
                      />

                      <DetailMetric
                        label="Notification"
                        value={
                          participant.notified
                            ? "Sent"
                            : "Pending"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Certificate Actions
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {selectedIds.length} eligible participant
              {selectedIds.length === 1 ? "" : "s"} selected.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                processing ||
                !eventCompleted ||
                selectedIds.length === 0
              }
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <RefreshCw
                  size={12}
                  className="animate-spin"
                />
              ) : (
                <FileCheck2 size={12} />
              )}

              {processing
                ? "Preparing..."
                : "Prepare Certificates"}
            </button>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleNotify}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[7px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              <Mail size={12} />
              Notify Participants
            </button>
          </div>
        </div>
      </div>

      {/* Generated Status */}
      {processed && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={17}
              className="mt-0.5 text-green-600 dark:text-green-400"
            />

            <div>
              <h3 className="text-[9px] font-bold text-green-800 dark:text-green-300">
                Certificates prepared successfully
              </h3>

              <p className="mt-1 text-[7px] leading-4 text-green-700 dark:text-green-400">
                The selected certificates are ready for organizer
                review before final issuance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Automation Notice */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Download
            size={14}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-[6px] leading-4 text-slate-400">
            Certificate generation should remain reviewable by
            organizers before final issuance. Eligibility is
            determined from attendance records and the configured
            minimum attendance requirement.
          </p>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const ProcessStep = ({
  number,
  icon: Icon,
  title,
  description,
  completed,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          completed
            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
        }`}
      >
        {completed ? (
          <CheckCircle2 size={14} />
        ) : (
          <Icon size={14} />
        )}
      </div>

      <div>
        <p className="text-[6px] font-bold text-slate-400">
          STEP {number}
        </p>

        <h4 className="mt-1 text-[8px] font-bold text-slate-800 dark:text-white">
          {title}
        </h4>

        <p className="mt-1 text-[6px] leading-3 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({
  eligible,
  status,
}) => {
  if (!eligible) {
    return (
      <span className="inline-flex w-fit rounded-full bg-red-50 px-2.5 py-1 text-[6px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Not Eligible
      </span>
    );
  }

  if (status === "Ready") {
    return (
      <span className="inline-flex w-fit rounded-full bg-green-50 px-2.5 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
        Ready
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[6px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
      Pending Review
    </span>
  );
};

const DetailMetric = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-[7px] font-black text-slate-700 dark:text-slate-300">
      {value}
    </p>
  </div>
);

export default EventPostEventAttendanceCertificateAutomation;