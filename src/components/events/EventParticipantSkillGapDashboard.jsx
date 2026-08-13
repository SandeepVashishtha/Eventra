import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_DATA = {
  participantSkills: [
    "Python",
    "React",
    "JavaScript",
    "Git",
  ],
  requiredSkills: [
    "Python",
    "React",
    "Machine Learning",
    "SQL",
    "Docker",
    "Git",
    "Cloud",
  ],
  recommendedAreas: [
    {
      skill: "Machine Learning",
      priority: "High",
      reason: "Required for the selected event track.",
    },
    {
      skill: "SQL",
      priority: "Medium",
      reason: "Useful for the event's data-processing tasks.",
    },
    {
      skill: "Docker",
      priority: "Medium",
      reason: "Recommended for deployment and team collaboration.",
    },
    {
      skill: "Cloud",
      priority: "Low",
      reason: "Helpful for scalable application deployment.",
    },
  ],
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    case "Medium":
      return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
    default:
      return "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }
};

const EventParticipantSkillGapDashboard = ({
  data = DEFAULT_DATA,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");

  const existingSkills = useMemo(
    () =>
      data.participantSkills.filter((skill) =>
        data.requiredSkills.includes(skill)
      ),
    [data]
  );

  const missingSkills = useMemo(
    () =>
      data.requiredSkills.filter(
        (skill) => !data.participantSkills.includes(skill)
      ),
    [data]
  );

  const coveragePercentage = data.requiredSkills.length
    ? Math.round(
        (existingSkills.length /
          data.requiredSkills.length) *
          100
      )
    : 0;

  const filteredRecommendations =
    activeFilter === "All"
      ? data.recommendedAreas
      : data.recommendedAreas.filter(
          (item) => item.priority === activeFilter
        );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Target size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Preparation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Skill Gap Dashboard
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Compare your current skills with the skills required
              for your selected event or team.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Skill Coverage
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {coveragePercentage}%
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={CheckCircle2}
          label="Existing Skills"
          value={existingSkills.length}
          description="matched skills"
          className="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          icon={XCircle}
          label="Missing Skills"
          value={missingSkills.length}
          description="skills to learn"
          className="text-red-600 dark:text-red-400"
        />

        <SummaryCard
          icon={GraduationCap}
          label="Required Skills"
          value={data.requiredSkills.length}
          description="event requirements"
          className="text-indigo-600 dark:text-indigo-400"
        />

        <SummaryCard
          icon={BookOpen}
          label="Learning Areas"
          value={data.recommendedAreas.length}
          description="recommended"
          className="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Skill Coverage */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Overall Skill Coverage
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Your current skills compared with event requirements.
            </p>
          </div>

          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {coveragePercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${coveragePercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[6px] text-slate-400">
          <span>{existingSkills.length} matched</span>
          <span>{missingSkills.length} missing</span>
        </div>
      </div>

      {/* Existing Skills */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2
            size={15}
            className="text-green-600 dark:text-green-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Existing Skills
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Skills that already match the event requirements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {existingSkills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[7px] font-bold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
            >
              <CheckCircle2 size={11} />
              {skill}
            </span>
          ))}

          {existingSkills.length === 0 && (
            <EmptyMessage text="No matching skills found." />
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle
            size={15}
            className="text-red-600 dark:text-red-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Missing Skills
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Skills required by the event that you have not
              listed yet.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {missingSkills.map((skill) => (
            <div
              key={skill}
              className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-600 dark:bg-slate-900 dark:text-red-400">
                  <XCircle size={16} />
                </div>

                <div>
                  <p className="text-[8px] font-bold text-red-700 dark:text-red-400">
                    {skill}
                  </p>

                  <p className="mt-1 text-[6px] text-red-500 dark:text-red-400">
                    Needs improvement
                  </p>
                </div>
              </div>
            </div>
          ))}

          {missingSkills.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyMessage text="Excellent! You currently match all required skills." />
            </div>
          )}
        </div>
      </div>

      {/* Recommended Learning Areas */}
      <div className="mt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen
              size={15}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Recommended Learning Areas
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Focus on these skills before the event.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "High", "Medium", "Low"].map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-3 py-1.5 text-[5px] font-bold transition ${
                    activeFilter === filter
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredRecommendations.map((item) => (
            <div
              key={item.skill}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <GraduationCap size={16} />
                  </div>

                  <div>
                    <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                      {item.skill}
                    </h4>

                    <p className="mt-1 text-[6px] text-slate-400">
                      {item.reason}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-[5px] font-bold ${getPriorityClasses(
                    item.priority
                  )}`}
                >
                  {item.priority} Priority
                </span>
              </div>
            </div>
          ))}

          {filteredRecommendations.length === 0 && (
            <EmptyMessage text="No learning areas match this priority." />
          )}
        </div>
      </div>

      {/* Team Preparation */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <Users size={17} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              Team Formation Tip
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Consider joining a team with participants who
              have complementary skills. Missing skills such as{" "}
              <strong>
                {missingSkills.slice(0, 3).join(", ") || "none"}
              </strong>{" "}
              can be covered through collaboration or targeted
              preparation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div
        className={`rounded-xl bg-slate-50 p-2 dark:bg-slate-800 ${className}`}
      >
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-800 dark:text-white">
            {value}
          </span>

          <span className="text-[6px] text-slate-400">
            {description}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const EmptyMessage = ({ text }) => (
  <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] text-slate-400">{text}</p>
  </div>
);

export default EventParticipantSkillGapDashboard;