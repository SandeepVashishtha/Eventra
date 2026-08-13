import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const initialJudges = [
  {
    id: 1,
    name: "Aarav Mehta",
    email: "aarav@example.com",
    assignments: 4,
    evaluated: 3,
    maxAssignments: 5,
  },
  {
    id: 2,
    name: "Priya Shah",
    email: "priya@example.com",
    assignments: 3,
    evaluated: 1,
    maxAssignments: 5,
  },
  {
    id: 3,
    name: "Rahul Patel",
    email: "rahul@example.com",
    assignments: 2,
    evaluated: 2,
    maxAssignments: 5,
  },
];

const initialSubmissions = [
  {
    id: 101,
    team: "Code Warriors",
    track: "AI/ML",
    judgeId: 1,
    status: "Evaluated",
  },
  {
    id: 102,
    team: "Data Mavericks",
    track: "Data Science",
    judgeId: 1,
    status: "Pending",
  },
  {
    id: 103,
    team: "Tech Titans",
    track: "Web Development",
    judgeId: 2,
    status: "Pending",
  },
  {
    id: 104,
    team: "Cyber Squad",
    track: "Cybersecurity",
    judgeId: null,
    status: "Pending",
  },
  {
    id: 105,
    team: "AI Innovators",
    track: "AI/ML",
    judgeId: 3,
    status: "Evaluated",
  },
];

const JudgeAssignmentManagement = () => {
  const [judges, setJudges] = useState(initialJudges);
  const [submissions, setSubmissions] = useState(
    initialSubmissions
  );

  const [showAddJudge, setShowAddJudge] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [newJudge, setNewJudge] = useState({
    name: "",
    email: "",
    maxAssignments: 5,
  });

  const totalAssignments = submissions.filter(
    (submission) => submission.judgeId !== null
  ).length;

  const unassigned = submissions.filter(
    (submission) => submission.judgeId === null
  ).length;

  const evaluated = submissions.filter(
    (submission) => submission.status === "Evaluated"
  ).length;

  const pending = submissions.filter(
    (submission) => submission.status === "Pending"
  ).length;

  const handleAddJudge = (event) => {
    event.preventDefault();

    if (!newJudge.name.trim() || !newJudge.email.trim()) {
      return;
    }

    const judge = {
      id: Date.now(),
      name: newJudge.name.trim(),
      email: newJudge.email.trim(),
      assignments: 0,
      evaluated: 0,
      maxAssignments: Number(newJudge.maxAssignments) || 5,
    };

    setJudges((current) => [...current, judge]);

    setNewJudge({
      name: "",
      email: "",
      maxAssignments: 5,
    });

    setShowAddJudge(false);
  };

  const assignSubmission = (submissionId, judgeId) => {
    const judge = judges.find((item) => item.id === judgeId);

    if (!judge) return;

    const currentSubmission = submissions.find(
      (item) => item.id === submissionId
    );

    if (!currentSubmission) return;

    // Prevent assigning to the same judge.
    if (currentSubmission.judgeId === judgeId) {
      setSelectedSubmission(null);
      return;
    }

    // Prevent workload overflow.
    if (
      currentSubmission.judgeId !== judgeId &&
      judge.assignments >= judge.maxAssignments
    ) {
      alert(
        `${judge.name} has reached the maximum assignment limit.`
      );
      return;
    }

    // Update old judge workload.
    setJudges((currentJudges) =>
      currentJudges.map((item) => {
        if (item.id === currentSubmission.judgeId) {
          return {
            ...item,
            assignments: Math.max(item.assignments - 1, 0),
          };
        }

        if (item.id === judgeId) {
          return {
            ...item,
            assignments: item.assignments + 1,
          };
        }

        return item;
      })
    );

    setSubmissions((current) =>
      current.map((item) =>
        item.id === submissionId
          ? {
              ...item,
              judgeId,
            }
          : item
      )
    );

    setSelectedSubmission(null);
  };

  const workload = useMemo(() => {
    return [...judges].sort(
      (a, b) => b.assignments - a.assignments
    );
  }, [judges]);

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Judge Assignment Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Assign judges, balance workloads, and track evaluation
            progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddJudge(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add Judge
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Judges"
          value={judges.length}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Assigned"
          value={totalAssignments}
          icon={<ClipboardCheck size={20} />}
          valueClass="text-indigo-600 dark:text-indigo-400"
        />

        <SummaryCard
          title="Unassigned"
          value={unassigned}
          icon={<AlertTriangle size={20} />}
          valueClass={
            unassigned > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-green-600 dark:text-green-400"
          }
        />

        <SummaryCard
          title="Pending Evaluations"
          value={pending}
          icon={<RefreshCw size={20} />}
          valueClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Workload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Judge Workload
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor assignment distribution and evaluation progress.
          </p>
        </div>

        <div className="space-y-4">
          {workload.map((judge) => {
            const workloadPercentage =
              judge.maxAssignments === 0
                ? 0
                : Math.min(
                    Math.round(
                      (judge.assignments /
                        judge.maxAssignments) *
                        100
                    ),
                    100
                  );

            const evaluationPercentage =
              judge.assignments === 0
                ? 0
                : Math.round(
                    (judge.evaluated / judge.assignments) * 100
                  );

            const overloaded =
              judge.assignments >= judge.maxAssignments;

            return (
              <div
                key={judge.id}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {judge.name}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {judge.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {judge.assignments}/{judge.maxAssignments}
                    </span>

                    {overloaded && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Full
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-[10px] text-slate-400">
                    <span>Assignment workload</span>
                    <span>{workloadPercentage}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        overloaded
                          ? "bg-red-500"
                          : "bg-indigo-500"
                      }`}
                      style={{
                        width: `${workloadPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                  <span>
                    Evaluated: {judge.evaluated}
                  </span>

                  <span>
                    Evaluation progress: {evaluationPercentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submissions */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Submission Assignments
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Assign or reassign submissions to available judges.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900">
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Team
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Track
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Judge
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Evaluation
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((submission) => {
                const judge = judges.find(
                  (item) => item.id === submission.judgeId
                );

                return (
                  <tr
                    key={submission.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {submission.team}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Submission #{submission.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        {submission.track}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {judge ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {judge.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {judge.assignments}/
                            {judge.maxAssignments} assignments
                          </p>
                        </div>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={submission.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubmission(submission)
                        }
                        className="rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                      >
                        {judge ? "Reassign" : "Assign Judge"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Judge Modal */}
      {showAddJudge && (
        <Modal
          title="Add Judge"
          onClose={() => setShowAddJudge(false)}
        >
          <form
            onSubmit={handleAddJudge}
            className="space-y-4"
          >
            <Input
              label="Judge Name"
              value={newJudge.name}
              onChange={(value) =>
                setNewJudge((current) => ({
                  ...current,
                  name: value,
                }))
              }
              placeholder="Enter judge name"
            />

            <Input
              label="Email"
              type="email"
              value={newJudge.email}
              onChange={(value) =>
                setNewJudge((current) => ({
                  ...current,
                  email: value,
                }))
              }
              placeholder="judge@example.com"
            />

            <Input
              label="Maximum Assignments"
              type="number"
              min="1"
              value={newJudge.maxAssignments}
              onChange={(value) =>
                setNewJudge((current) => ({
                  ...current,
                  maxAssignments: value,
                }))
              }
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Add Judge
            </button>
          </form>
        </Modal>
      )}

      {/* Assignment Modal */}
      {selectedSubmission && (
        <Modal
          title={
            selectedSubmission.judgeId
              ? "Reassign Submission"
              : "Assign Judge"
          }
          onClose={() => setSelectedSubmission(null)}
        >
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Select a judge for{" "}
            <strong className="text-slate-700 dark:text-slate-300">
              {selectedSubmission.team}
            </strong>
            .
          </p>

          <div className="space-y-2">
            {judges.map((judge) => {
              const isCurrent =
                selectedSubmission.judgeId === judge.id;

              const isFull =
                judge.assignments >= judge.maxAssignments &&
                !isCurrent;

              return (
                <button
                  key={judge.id}
                  type="button"
                  disabled={isFull}
                  onClick={() =>
                    assignSubmission(
                      selectedSubmission.id,
                      judge.id
                    )
                  }
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {judge.name}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {judge.assignments}/
                      {judge.maxAssignments} assignments
                    </p>
                  </div>

                  {isCurrent ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      Current
                    </span>
                  ) : isFull ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      Full
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      Assign
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </section>
  );
};

const SummaryCard = ({
  title,
  value,
  icon,
  valueClass = "",
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </span>

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        {icon}
      </div>
    </div>

    <p
      className={`mt-4 text-2xl font-bold text-slate-900 dark:text-white ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const evaluated = status === "Evaluated";

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
        evaluated
          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
      }`}
    >
      {status}
    </span>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
      {label}
    </span>

    <input
      type={type}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    />
  </label>
);

export default JudgeAssignmentManagement;