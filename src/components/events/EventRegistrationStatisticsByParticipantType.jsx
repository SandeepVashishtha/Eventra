import {
  BarChart3,
  Briefcase,
  Building2,
  GraduationCap,
  PieChart,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    type: "Student",
    experience: "Beginner",
    category: "Technical",
    registrationType: "Team",
    institution: "Marwadi University",
  },
  {
    id: "P002",
    type: "Student",
    experience: "Experienced",
    category: "Technical",
    registrationType: "Individual",
    institution: "GTU",
  },
  {
    id: "P003",
    type: "Professional",
    experience: "Experienced",
    category: "Management",
    registrationType: "Team",
    institution: "Tech Solutions",
  },
  {
    id: "P004",
    type: "Student",
    experience: "Beginner",
    category: "Design",
    registrationType: "Team",
    institution: "Marwadi University",
  },
  {
    id: "P005",
    type: "Professional",
    experience: "Experienced",
    category: "Technical",
    registrationType: "Individual",
    institution: "Infosys",
  },
  {
    id: "P006",
    type: "Student",
    experience: "Beginner",
    category: "Technical",
    registrationType: "Individual",
    institution: "GTU",
  },
  {
    id: "P007",
    type: "Student",
    experience: "Experienced",
    category: "Research",
    registrationType: "Team",
    institution: "IIT Gandhinagar",
  },
  {
    id: "P008",
    type: "Professional",
    experience: "Experienced",
    category: "Technical",
    registrationType: "Team",
    institution: "TCS",
  },
];

const EventRegistrationStatisticsByParticipantType = ({
  participants = DEFAULT_PARTICIPANTS,
  eventTitle = "Event Registration Statistics",
  className = "",
}) => {
  const [activeView, setActiveView] = useState("overview");

  const totalParticipants = participants.length;

  const getStats = (field) => {
    const counts = {};

    participants.forEach((participant) => {
      const value = participant[field] || "Unknown";
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage:
          totalParticipants > 0
            ? Math.round(
                (count / totalParticipants) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const statistics = useMemo(
    () => ({
      participantType: getStats("type"),
      experience: getStats("experience"),
      category: getStats("category"),
      registrationType: getStats(
        "registrationType"
      ),
      institution: getStats("institution"),
    }),
    [participants]
  );

  const studentCount =
    participants.filter(
      (participant) =>
        participant.type === "Student"
    ).length;

  const professionalCount =
    participants.filter(
      (participant) =>
        participant.type === "Professional"
    ).length;

  const beginnerCount =
    participants.filter(
      (participant) =>
        participant.experience === "Beginner"
    ).length;

  const experiencedCount =
    participants.filter(
      (participant) =>
        participant.experience === "Experienced"
    ).length;

  const teamCount =
    participants.filter(
      (participant) =>
        participant.registrationType === "Team"
    ).length;

  const individualCount =
    participants.filter(
      (participant) =>
        participant.registrationType ===
        "Individual"
    ).length;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {eventTitle}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              View aggregated participant statistics
              without exposing unnecessary individual
              information.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <Users
            size={14}
            className="text-green-600 dark:text-green-400"
          />

          <span className="text-[8px] font-bold text-green-700 dark:text-green-400">
            Aggregated Data Only
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Users size={15} />}
          label="Total Participants"
          value={totalParticipants}
        />

        <SummaryCard
          icon={<GraduationCap size={15} />}
          label="Students"
          value={studentCount}
          percentage={getPercentage(
            studentCount,
            totalParticipants
          )}
        />

        <SummaryCard
          icon={<Briefcase size={15} />}
          label="Professionals"
          value={professionalCount}
          percentage={getPercentage(
            professionalCount,
            totalParticipants
          )}
        />

        <SummaryCard
          icon={<Users size={15} />}
          label="Team Registrations"
          value={teamCount}
          percentage={getPercentage(
            teamCount,
            totalParticipants
          )}
        />
      </div>

      {/* View selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["overview", "Overview"],
          ["type", "Participant Type"],
          ["experience", "Experience"],
          ["category", "Category"],
          ["registration", "Registration"],
          ["institution", "Institution"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setActiveView(value)
            }
            className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold transition ${
              activeView === value
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <StatisticsPanel
            title="Student vs Professional"
            icon={
              <GraduationCap size={15} />
            }
            data={
              statistics.participantType
            }
          />

          <StatisticsPanel
            title="Beginner vs Experienced"
            icon={<BarChart3 size={15} />}
            data={
              statistics.experience
            }
          />

          <StatisticsPanel
            title="Team vs Individual"
            icon={<Users size={15} />}
            data={
              statistics.registrationType
            }
          />

          <StatisticsPanel
            title="Participant Categories"
            icon={<PieChart size={15} />}
            data={
              statistics.category
            }
          />
        </div>
      )}

      {/* Participant type */}
      {activeView === "type" && (
        <StatisticsPanel
          title="Participant Type Distribution"
          icon={<Users size={15} />}
          data={
            statistics.participantType
          }
          fullWidth
        />
      )}

      {/* Experience */}
      {activeView === "experience" && (
        <StatisticsPanel
          title="Experience Distribution"
          icon={<BarChart3 size={15} />}
          data={
            statistics.experience
          }
          fullWidth
        />
      )}

      {/* Category */}
      {activeView === "category" && (
        <StatisticsPanel
          title="Participant Category Distribution"
          icon={<PieChart size={15} />}
          data={
            statistics.category
          }
          fullWidth
        />
      )}

      {/* Registration */}
      {activeView === "registration" && (
        <StatisticsPanel
          title="Registration Type Distribution"
          icon={<Users size={15} />}
          data={
            statistics.registrationType
          }
          fullWidth
        />
      )}

      {/* Institution */}
      {activeView === "institution" && (
        <StatisticsPanel
          title="Institution / Organization Distribution"
          icon={<Building2 size={15} />}
          data={
            statistics.institution
          }
          fullWidth
        />
      )}

      {/* Key insights */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <BarChart3
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            Key Insights
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            title="Participant Mix"
            value={`${getPercentage(
              studentCount,
              totalParticipants
            )}% Students`}
            description={`${getPercentage(
              professionalCount,
              totalParticipants
            )}% are professionals.`}
          />

          <InsightCard
            title="Experience"
            value={`${getPercentage(
              experiencedCount,
              totalParticipants
            )}% Experienced`}
            description={`${getPercentage(
              beginnerCount,
              totalParticipants
            )}% are beginners.`}
          />

          <InsightCard
            title="Registration"
            value={`${getPercentage(
              teamCount,
              totalParticipants
            )}% Teams`}
            description={`${getPercentage(
              individualCount,
              totalParticipants
            )}% registered individually.`}
          />
        </div>
      </div>

      {/* Privacy note */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <Users
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            Privacy-friendly analytics
          </p>

          <p className="mt-1 text-[8px] leading-4 text-slate-400">
            Statistics are aggregated by participant type,
            experience, category, registration type, and
            institution. Individual participant identities
            are not displayed in this dashboard.
          </p>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  percentage,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      {percentage !== undefined && (
        <span className="text-[8px] font-bold text-slate-400">
          {percentage}%
        </span>
      )}
    </div>

    <p className="mt-3 text-lg font-bold text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const StatisticsPanel = ({
  title,
  icon,
  data,
  fullWidth = false,
}) => {
  const maxValue =
    data.length > 0
      ? Math.max(
          ...data.map(
            (item) => item.count
          )
        )
      : 1;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${
        fullWidth ? "mt-5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {icon}
          </div>

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            {title}
          </h3>
        </div>

        <span className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">
          Aggregated
        </span>
      </div>

      {data.length > 0 ? (
        <div className="mt-5 space-y-4">
          {data.map((item) => {
            const barWidth =
              maxValue > 0
                ? (item.count /
                    maxValue) *
                  100
                : 0;

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                    {item.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                      {item.count}
                    </span>

                    <span className="text-[8px] text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-[9px] text-slate-400">
            No participant data available.
          </p>
        </div>
      )}
    </div>
  );
};

const InsightCard = ({
  title,
  value,
  description,
}) => (
  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {title}
    </p>

    <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[8px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

const getPercentage = (
  value,
  total
) => {
  if (!total) return 0;

  return Math.round(
    (value / total) * 100
  );
};

export default EventRegistrationStatisticsByParticipantType;