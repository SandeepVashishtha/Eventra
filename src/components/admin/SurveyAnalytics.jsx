import { useState, useMemo } from "react";
import {
  FiUsers,
  FiActivity,
  FiSmile,
  FiPlay,
  FiStar,
  FiDownload,
} from "react-icons/fi";
import { exportSurveyToCSV } from "../../utils/exportCsv";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { toast } from "react-toastify";
import { useSurveySimulator } from "./useSurveySimulator";

// Pre-defined high-quality feedback pool for open text responses
const FEEDBACK_COMMENTS_POOL = [
  "The keynote address was incredibly inspiring and perfectly structured!",
  "Loved the hands-on coding sessions, they were extremely interactive.",
  "Excellent catering, networking felt super natural and smooth.",
  "Great venue, though the Wi-Fi in the main lobby was slightly slow.",
  "The panel discussions offered incredibly deep insights into industry trends.",
  "Outstanding mentors and organizers! They guided us flawlessly.",
  "A wonderful learning opportunity. I made amazing team connections.",
  "Really enjoyed the workshop tracks, though I wish they were longer.",
  "Everything was extremely professional and perfectly executed.",
  "The live code demonstrations were highly informative and engaging.",
];

const SurveyAnalytics = ({ questions = [], surveyTitle = "Survey" }) => {
  const [isActive] = useState(true);

  // Hook handles mock data generation - decoupled from UI components
  const {
    totalSubmissions,
    completionRate,
    simulatedData,
    textFeed,
    handleSimulateSubmission,
  } = useSurveySimulator(questions, FEEDBACK_COMMENTS_POOL);

  const choiceChartData = useMemo(() => {
    const chartData = {};
    questions.forEach((q) => {
      if (q.type === "choice" && simulatedData[q.id]) {
        chartData[q.id] = Object.entries(simulatedData[q.id]).map(([name, votes]) => ({
          name,
          votes,
        }));
      }
    });
    return chartData;
  }, [questions, simulatedData]);

  const analyzedRatings = useMemo(() => {
    const ratings = {};
    questions.forEach((q) => {
      if (q.type === "rating" && simulatedData[q.id]) {
        const distribution = simulatedData[q.id];
        let total = 0;
        let sum = 0;
        Object.entries(distribution).forEach(([score, count]) => {
          sum += parseInt(score) * count;
          total += count;
        });
        ratings[q.id] = {
          average: total > 0 ? (sum / total).toFixed(1) : "0.0",
          total,
        };
      }
    });
    return ratings;
  }, [questions, simulatedData]);

  // Reconstruct individual rows corresponding to each submission per question distribution
  const handleExportCSV = () => {
    if (questions.length === 0) {
      toast.warn("Please add some questions first before exporting results!");
      return;
    }

    const responses = [];
    const now = new Date();

    for (let i = 0; i < totalSubmissions; i++) {
      const answers = {};

      questions.forEach((q) => {
        if (q.type === "rating") {
          const distribution = simulatedData[q.id] || { 5: 50, 4: 30, 3: 10, 2: 3, 1: 1 };
          const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
          const rand = Math.floor(Math.random() * total);

          let cumulative = 0;
          let selectedScore = 4;
          for (const score of [5, 4, 3, 2, 1]) {
            cumulative += distribution[score];
            if (rand < cumulative) {
              selectedScore = score;
              break;
            }
          }
          answers[q.id] = `${selectedScore} Stars`;
        } else if (q.type === "choice") {
          const distribution = simulatedData[q.id] || {};
          const options = Object.keys(distribution);
          if (options.length > 0) {
            const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
            const rand = Math.floor(Math.random() * total);

            let cumulative = 0;
            let selectedOpt = options[0];
            for (const opt of options) {
              cumulative += distribution[opt];
              if (rand < cumulative) {
                selectedOpt = opt;
                break;
              }
            }
            answers[q.id] = selectedOpt;
          } else {
            answers[q.id] = "";
          }
        } else if (q.type === "text") {
          const qFeed = textFeed.find((t) => t.questionId === q.id);
          const commentsList = qFeed ? qFeed.comments.map((c) => c.text) : [];
          if (commentsList.length > 0) {
            answers[q.id] = commentsList[i % commentsList.length];
          } else {
            answers[q.id] = FEEDBACK_COMMENTS_POOL[i % FEEDBACK_COMMENTS_POOL.length];
          }
        }
      });

      // Distribute timestamps back in 5-minute increments
      const timestamp = new Date(now.getTime() - i * 5 * 60000)
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      responses.push({
        timestamp,
        answers,
      });
    }

    exportSurveyToCSV(questions, responses, surveyTitle);
    toast.success("Survey responses successfully exported to CSV file!");
  };



  return (
    <div className="space-y-8">
      {/* SIMULATOR TRAFFIC BAR */}
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md sm:flex-row sm:items-center sm:justify-between rounded-2xl transition-all">
        <div>
          <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
            Simulate Attendee Feedback
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate synthetic survey submissions to test average calculations, option breakdowns, and scrolling log feeds.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 text-xs text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 hover:shadow-md transition active:scale-95 cursor-pointer"
           aria-label="button">
            <FiDownload className="w-4 h-4 text-indigo-500" />
            Export Results to CSV
          </button>
          
          <button
            onClick={handleSimulateSubmission}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-600/15 transition self-start sm:self-auto cursor-pointer"
           aria-label="button">
            <FiPlay className="w-4 h-4 fill-white" />
            Inject Survey Response
          </button>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Submissions",
            value: totalSubmissions,
            sub: "+12 submissions today",
            icon: <FiUsers className="w-5 h-5" />,
            color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100/50 dark:border-indigo-900/30",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            sub: "Average time: 2m 45s",
            icon: <FiActivity className="w-5 h-5" />,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100/50 dark:border-emerald-900/30",
          },
          {
            label: "Survey Status",
            value: isActive ? "Active" : "Closed",
            sub: "Live submissions enabled",
            icon: (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            ),
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100/50 dark:border-amber-900/30",
          },
          {
            label: "Attendee Satisfaction",
            value: "4.4 / 5.0",
            sub: "Highly positive feedback",
            icon: <FiSmile className="w-5 h-5" />,
            color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-100/50 dark:border-rose-900/30",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
          >
            <div className={`inline-flex p-2.5 rounded-xl border ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {stat.label}
            </p>
            <h4 className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-100">
              {stat.value}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* DYNAMIC ANALYTICS CONTROLLER */}
      {questions.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-3xl">
          <FiSmile className="w-12 h-12 text-slate-355 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500">
            No active questions found in your survey.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Please add some questions in the **Survey Builder** tab to initialize submission analytics data streams!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {questions.map((question, qIdx) => {
            const hasData = simulatedData[question.id] !== undefined;

            return (
              <div
                key={question.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition duration-250"
              >
                {/* QUESTION LABEL */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold">
                      {qIdx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                      {question.type === "rating"
                        ? "Rating Scale Analyzer"
                        : question.type === "choice"
                        ? "Multiple Choice Breakdown"
                        : "Open Text Feedback Stream"}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                    {question.questionText || "Untitled Question"}
                  </h3>
                </div>

                {/* VISUAL BREAKDOWN COMPONENT */}
                <div className="flex-1 flex flex-col justify-center">
                  {/* A. RATING ANALYZER */}
                  {question.type === "rating" && hasData && (
                    <div className="space-y-4">
                      {/* AVERAGE BADGE */}
                      <div className="flex items-end gap-3">
                        <div className="text-4xl font-black text-indigo-650 dark:text-indigo-400">
                          {analyzedRatings[question.id]?.average || 0.0}
                        </div>
                        <div className="space-y-1 pb-1">
                          <div className="flex text-amber-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = analyzedRatings[question.id]?.average || 0;
                              return (
                                <span key={star} className="mr-0.5">
                                  {star <= Math.round(avg) ? "★" : "☆"}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold leading-none">
                            out of 5.0 stars &bull; {analyzedRatings[question.id]?.total || 0} votes
                          </div>
                        </div>
                      </div>

                      {/* STAR DISTRIBUTION PROGRESS BARS */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const votes = simulatedData[question.id]?.[star] || 0;
                          const total = analyzedRatings[question.id]?.total || 1;
                          const percent = Math.round((votes / total) * 100);

                          return (
                            <div key={star} className="flex items-center gap-3 text-xs">
                              <span className="w-10 font-bold text-slate-400 shrink-0 flex items-center gap-0.5">
                                {star} <FiStar className="w-3 h-3 fill-slate-300 dark:fill-slate-650" />
                              </span>
                              <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="w-8 text-right font-black text-slate-500 dark:text-slate-350 shrink-0">
                                {percent}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* B. MULTIPLE CHOICE BAR CHART */}
                  {question.type === "choice" && hasData && (
                    <div className="w-full h-44">
                      {question.options.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No options defined for this choice question.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={choiceChartData[question.id] || []}
                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                          >
                            <XAxis
                              dataKey="name"
                              stroke="#94a3b8"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#94a3b8"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#0f172a",
                                border: "none",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "11px",
                              }}
                            />
                            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                              {(choiceChartData[question.id] || []).map((entry, index) => {
                                const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b"];
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}

                  {/* C. OPEN TEXT COMMENTS FEED */}
                  {question.type === "text" && (
                    <div className="max-h-44 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {(() => {
                        const qFeed = textFeed.find((t) => t.questionId === question.id);
                        if (!qFeed || qFeed.comments.length === 0) {
                          return (
                            <div className="text-center py-6 text-xs text-slate-400">
                              No submissions received for this open question yet.
                            </div>
                          );
                        }

                        return qFeed.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl space-y-1.5 flex items-start gap-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition"
                          >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-sm">
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {comment.author}
                                </span>
                                <span className="text-[9px] text-slate-400 shrink-0">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                                "{comment.text}"
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurveyAnalytics;
