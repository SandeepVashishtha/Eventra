import {
  Award,
  CheckCircle2,
  CircleAlert,
  ListChecks,
  Percent,
  Users,
} from "lucide-react";

const DEFAULT_DATA = {
  rules: {
    minimumSessions: 3,
    minimumAttendancePercentage: 75,
    mandatorySessions: [
      "Opening Keynote",
      "Closing Session",
    ],
    requiredWorkshops: [
      "AI Workshop",
    ],
  },

  participant: {
    attendedSessions: 4,
    totalSessions: 5,
    attendancePercentage: 80,
    attendedMandatorySessions: [
      "Opening Keynote",
      "Closing Session",
    ],
    completedWorkshops: [
      "AI Workshop",
    ],
  },
};

const EventSessionAttendanceCertificateRules = ({
  data = DEFAULT_DATA,
}) => {
  const { rules, participant } = data;

  const sessionRequirementMet =
    participant.attendedSessions >= rules.minimumSessions;

  const percentageRequirementMet =
    participant.attendancePercentage >=
    rules.minimumAttendancePercentage;

  const mandatorySessionsMet = rules.mandatorySessions.every(
    (session) =>
      participant.attendedMandatorySessions.includes(session)
  );

  const workshopsMet = rules.requiredWorkshops.every(
    (workshop) =>
      participant.completedWorkshops.includes(workshop)
  );

  const eligible =
    sessionRequirementMet &&
    percentageRequirementMet &&
    mandatorySessionsMet &&
    workshopsMet;

  const completedRules = [
    sessionRequirementMet,
    percentageRequirementMet,
    mandatorySessionsMet,
    workshopsMet,
  ].filter(Boolean).length;

  const completionPercentage = (completedRules / 4) * 100;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Award size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Certificate Eligibility
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Attendance Certificate Rules
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Define and automatically evaluate session attendance
              requirements for certificate eligibility.
            </p>
          </div>
        </div>

        <EligibilityBadge eligible={eligible} />
      </div>

      {/* Eligibility Summary */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Eligibility Progress
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {completedRules} of 4 certificate requirements
              satisfied.
            </p>
          </div>

          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
            {completionPercentage.toFixed(0)}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              eligible ? "bg-green-500" : "bg-indigo-600"
            }`}
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <ListChecks
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Certificate Requirements
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Each requirement is automatically evaluated.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <RuleCard
            title="Minimum Sessions"
            description={`Attend at least ${rules.minimumSessions} sessions.`}
            current={`${participant.attendedSessions} sessions attended`}
            requirement={`${rules.minimumSessions} required`}
            met={sessionRequirementMet}
            icon={Users}
          />

          <RuleCard
            title="Minimum Attendance Percentage"
            description="Maintain the required overall attendance."
            current={`${participant.attendancePercentage}% attendance`}
            requirement={`${rules.minimumAttendancePercentage}% required`}
            met={percentageRequirementMet}
            icon={Percent}
          />

          <RuleCard
            title="Mandatory Sessions"
            description="All mandatory sessions must be attended."
            current={`${participant.attendedMandatorySessions.length} of ${rules.mandatorySessions.length} completed`}
            requirement={`${rules.mandatorySessions.length} required`}
            met={mandatorySessionsMet}
            icon={ListChecks}
          />

          <RuleCard
            title="Required Workshops"
            description="Complete all selected certificate workshops."
            current={`${participant.completedWorkshops.length} of ${rules.requiredWorkshops.length} completed`}
            requirement={`${rules.requiredWorkshops.length} required`}
            met={workshopsMet}
            icon={Award}
          />
        </div>
      </div>

      {/* Mandatory Sessions */}
      {rules.mandatorySessions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Mandatory Sessions
          </h3>

          <div className="mt-4 space-y-2">
            {rules.mandatorySessions.map((session) => {
              const attended =
                participant.attendedMandatorySessions.includes(
                  session
                );

              return (
                <div
                  key={session}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                >
                  <span className="text-[7px] font-bold text-slate-700 dark:text-slate-200">
                    {session}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                      attended
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {attended ? "Attended" : "Required"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Required Workshops */}
      {rules.requiredWorkshops.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Required Workshops
          </h3>

          <div className="mt-4 space-y-2">
            {rules.requiredWorkshops.map((workshop) => {
              const completed =
                participant.completedWorkshops.includes(workshop);

              return (
                <div
                  key={workshop}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                >
                  <span className="text-[7px] font-bold text-slate-700 dark:text-slate-200">
                    {workshop}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                      completed
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {completed ? "Completed" : "Required"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final Result */}
      <div
        className={`mt-6 rounded-2xl border p-5 ${
          eligible
            ? "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
            : "border-amber-100 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              eligible
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {eligible ? (
              <CheckCircle2 size={16} />
            ) : (
              <CircleAlert size={16} />
            )}
          </div>

          <div>
            <h3
              className={`text-[10px] font-bold ${
                eligible
                  ? "text-green-800 dark:text-green-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {eligible
                ? "Certificate Eligible"
                : "Certificate Requirements Not Met"}
            </h3>

            <p
              className={`mt-1 text-[7px] leading-relaxed ${
                eligible
                  ? "text-green-700 dark:text-green-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {eligible
                ? "All session attendance requirements have been satisfied. The participant is eligible for certificate issuance."
                : "One or more session attendance requirements are still incomplete. Certificate eligibility will be granted once all required conditions are satisfied."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const RuleCard = ({
  title,
  description,
  current,
  requirement,
  met,
  icon: Icon,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              {title}
            </h4>

            <p className="mt-1 text-[6px] text-slate-400">
              {description}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-2.5 py-1 text-[5px] font-bold ${
              met
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {met ? "Satisfied" : "Incomplete"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Current: {current}
          </span>

          <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Requirement: {requirement}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const EligibilityBadge = ({ eligible }) => (
  <span
    className={`w-fit rounded-full px-3 py-1.5 text-[6px] font-bold ${
      eligible
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    }`}
  >
    {eligible ? "Certificate Eligible" : "Requirements Pending"}
  </span>
);

export default EventSessionAttendanceCertificateRules;