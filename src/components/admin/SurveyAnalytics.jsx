import { Users, Activity, Smile, Play, Star, Download } from "lucide-react";
import { useState, useMemo } from "react";
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
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
            Simulate Attendee Feedback
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate synthetic survey submissions to test average calculations, option breakdowns, and scrolling log feeds.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="dark:text-slate-350 hover:text-indigo-650 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
           aria-label="button">
            <Download className="h-4 w-4 text-indigo-500" />
            Export Results to CSV
          </button>
          
          <button
            onClick={handleSimulateSubmission}
            className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 active:scale-95 sm:self-auto"
           aria-label="button">
            <Play className="h-4 w-4 fill-white" />
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
            icon: <Users className="h-5 w-5" />,
            color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100/50 dark:border-indigo-900/30",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            sub: "Average time: 2m 45s",
            icon: <Activity className="h-5 w-5" />,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100/50 dark:border-emerald-900/30",
          },
          {
            label: "Survey Status",
            value: isActive ? "Active" : "Closed",
            sub: "Live submissions enabled",
            icon: (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            ),
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100/50 dark:border-amber-900/30",
          },
          {
            label: "Attendee Satisfaction",
            value: "4.4 / 5.0",
            sub: "Highly positive feedback",
            icon: <Smile className="h-5 w-5" />,
            color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-100/50 dark:border-rose-900/30",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className={`inline-flex p-2.5 rounded-xl border ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              {stat.label}
            </p>
            <h4 className="mt-1 text-2xl font-black text-slate-800 dark:text-slate-100">
              {stat.value}
            </h4>
            <p className="dark:text-slate-550 mt-1 text-[10px] text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* DYNAMIC ANALYTICS CONTROLLER */}
      {questions.length === 0 ? (
        <div className="dark:border-slate-850 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center dark:bg-slate-900">
          <Smile className="text-slate-355 mx-auto mb-4 h-12 w-12 dark:text-slate-600" />
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500">
            No active questions found in your survey.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
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
                className="flex flex-col justify-between space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-250 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
              >
                {/* QUESTION LABEL */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-extrabold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {qIdx + 1}
                    </span>
                    <span className="dark:text-slate-550 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {question.type === "rating"
                        ? "Rating Scale Analyzer"
                        : question.type === "choice"
                        ? "Multiple Choice Breakdown"
                        : "Open Text Feedback Stream"}
                    </span>
                  </div>
                  <h3 className="text-base leading-tight font-extrabold text-slate-800 dark:text-slate-100">
                    {question.questionText || "Untitled Question"}
                  </h3>
                </div>

                {/* VISUAL BREAKDOWN COMPONENT */}
                <div className="flex flex-1 flex-col justify-center">
                  {/* A. RATING ANALYZER */}
                  {question.type === "rating" && hasData && (
                    <div className="space-y-4">
                      {/* AVERAGE BADGE */}
                      <div className="flex items-end gap-3">
                        <div className="text-indigo-650 text-4xl font-black dark:text-indigo-400">
                          {analyzedRatings[question.id]?.average || 0.0}
                        </div>
                        <div className="space-y-1 pb-1">
                          <div className="flex text-sm text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = analyzedRatings[question.id]?.average || 0;
                              return (
                                <span key={star} className="mr-0.5">
                                  {star <= Math.round(avg) ? "★" : "☆"}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[10px] leading-none font-semibold text-slate-400">
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
                              <span className="flex w-10 shrink-0 items-center gap-0.5 font-bold text-slate-400">
                                {star} <Star className="dark:fill-slate-650 h-3 w-3 fill-slate-300" />
                              </span>
                              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="dark:text-slate-350 w-8 shrink-0 text-right font-black text-slate-500">
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
                    <div className="h-44 w-full">
                      {question.options.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
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
                    <div className="custom-scrollbar max-h-44 space-y-3 overflow-y-auto pr-1">
                      {(() => {
                        const qFeed = textFeed.find((t) => t.questionId === question.id);
                        if (!qFeed || qFeed.comments.length === 0) {
                          return (
                            <div className="py-6 text-center text-xs text-slate-400">
                              No submissions received for this open question yet.
                            </div>
                          );
                        }

                        return qFeed.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-2.5 space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:bg-slate-100/50 dark:border-slate-800/40 dark:bg-slate-950/40 dark:hover:bg-slate-900/30"
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-[10px] font-black text-white shadow-sm">
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {comment.author}
                                </span>
                                <span className="shrink-0 text-[9px] text-slate-400">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-xs leading-normal text-slate-500 dark:text-slate-400">
                                &quot;{comment.text}&quot;
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
