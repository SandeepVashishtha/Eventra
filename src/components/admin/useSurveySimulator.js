import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";

// ============================================================================
// 1. CONSTANTS, DICTIONARIES & STATISTICAL HELPER UTILITIES
// ============================================================================

export const DISTRIBUTION_TYPES = {
  UNIFORM: "UNIFORM",
  GAUSSIAN: "GAUSSIAN",
  BIMODAL: "BIMODAL",
  NPS_BIASED: "NPS_BIASED",
  CUSTOM_WEIGHTED: "CUSTOM_WEIGHTED",
};

export const TRAFFIC_PROFILES = {
  STEADY: "STEADY",
  PEAK_BURST: "PEAK_BURST",
  DECAYING_TAIL: "DECAYING_TAIL",
  RANDOM_SPIKE: "RANDOM_SPIKE",
};

export const SENTIMENT_TYPES = {
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  NEGATIVE: "NEGATIVE",
};

const AUTHOR_NAMES = [
  "Aravind S.", "Meera N.", "Zoya A.", "Kabir D.", "Sara K.",
  "Aarav S.", "Priya M.", "Rohan V.", "Sneha P.", "Karan J.",
  "Aditya R.", "Ishaan R.", "Ananya B.", "Dev M.", "Tanvi C.",
  "Vikram T.", "Nisha G.", "Rahul K.", "Pooja H.", "Siddharth L."
];

const POSITIVE_KEYWORDS = ["great", "excellent", "awesome", "loved", "smooth", "helpful", "clear", "inspiring", "amazing", "well-organized"];
const NEGATIVE_KEYWORDS = ["slow", "confusing", "poor", "delayed", "boring", "hard", "buggy", "disappointed", "crowded", "loud"];
const NEUTRAL_KEYWORDS = ["okay", "average", "fine", "expected", "standard", "acceptable", "moderate"];

/**
 * Box-Muller transform to generate normally distributed random numbers
 */
export function generateGaussianRandom(mean = 0, stdev = 1) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}

/**
 * Generates a weighted choice index from a list of relative probabilities
 */
export function getWeightedRandomIndex(weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return 0;
  
  let randomVal = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (randomVal < weights[i]) {
      return i;
    }
    randomVal -= weights[i];
  }
  return weights.length - 1;
}

/**
 * Lightweight mock sentiment classifier for simulated comment analysis
 */
export function analyzeSentiment(text) {
  if (!text || typeof text !== "string") {
    return { score: 0, label: SENTIMENT_TYPES.NEUTRAL, keywords: [], aspect: "General" };
  }

  const lower = text.toLowerCase();
  let score = 0;
  const foundKeywords = [];

  POSITIVE_KEYWORDS.forEach((word) => {
    if (lower.includes(word)) {
      score += 1;
      foundKeywords.push(word);
    }
  });

  NEGATIVE_KEYWORDS.forEach((word) => {
    if (lower.includes(word)) {
      score -= 1;
      foundKeywords.push(word);
    }
  });

  NEUTRAL_KEYWORDS.forEach((word) => {
    if (lower.includes(word)) {
      foundKeywords.push(word);
    }
  });

  let label = SENTIMENT_TYPES.NEUTRAL;
  if (score > 0) label = SENTIMENT_TYPES.POSITIVE;
  if (score < 0) label = SENTIMENT_TYPES.NEGATIVE;

  let aspect = "General";
  if (lower.includes("speaker") || lower.includes("presentation")) aspect = "Speakers";
  else if (lower.includes("food") || lower.includes("catering") || lower.includes("lunch")) aspect = "Catering";
  else if (lower.includes("venue") || lower.includes("room") || lower.includes("hall")) aspect = "Venue";
  else if (lower.includes("schedule") || lower.includes("time") || lower.includes("delay")) aspect = "Schedule";
  else if (lower.includes("app") || lower.includes("wifi") || lower.includes("audio")) aspect = "Tech & Infra";

  return {
    score,
    label,
    keywords: Array.from(new Set(foundKeywords)),
    aspect,
  };
}

// ============================================================================
// 2. STATISTICAL & ANALYTICS CALCULATION ENGINE
// ============================================================================

export class SurveyAnalyticsEngine {
  static calculateMean(distribution) {
    let totalScore = 0;
    let totalVotes = 0;
    Object.entries(distribution).forEach(([key, val]) => {
      const numericKey = parseFloat(key);
      if (!isNaN(numericKey)) {
        totalScore += numericKey * val;
        totalVotes += val;
      }
    });
    return totalVotes === 0 ? 0 : parseFloat((totalScore / totalVotes).toFixed(2));
  }

  static calculateStandardDeviation(distribution) {
    const mean = this.calculateMean(distribution);
    let totalVotes = 0;
    let sumSquaredDiffs = 0;

    Object.entries(distribution).forEach(([key, val]) => {
      const numericKey = parseFloat(key);
      if (!isNaN(numericKey)) {
        sumSquaredDiffs += val * Math.pow(numericKey - mean, 2);
        totalVotes += val;
      }
    });

    return totalVotes === 0 ? 0 : parseFloat(Math.sqrt(sumSquaredDiffs / totalVotes).toFixed(2));
  }

  static calculateNPS(ratingDistribution) {
    let promoters = ratingDistribution[5] || 0;
    let passives = ratingDistribution[4] || 0;
    let detractors = (ratingDistribution[3] || 0) + (ratingDistribution[2] || 0) + (ratingDistribution[1] || 0);
    let total = promoters + passives + detractors;

    if (total === 0) return { npsScore: 0, promotersPct: 0, passivesPct: 0, detractorsPct: 0 };

    const promotersPct = parseFloat(((promoters / total) * 100).toFixed(1));
    const passivesPct = parseFloat(((passives / total) * 100).toFixed(1));
    const detractorsPct = parseFloat(((detractors / total) * 100).toFixed(1));
    const npsScore = Math.round(promotersPct - detractorsPct);

    return { npsScore, promotersPct, passivesPct, detractorsPct };
  }

  static extractSentimentBreakdown(textFeed) {
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    const aspectCounts = {};

    textFeed.forEach((feedGroup) => {
      feedGroup.comments.forEach((comment) => {
        const sentiment = comment.sentiment || analyzeSentiment(comment.text);
        if (sentiment.label === SENTIMENT_TYPES.POSITIVE) positiveCount++;
        else if (sentiment.label === SENTIMENT_TYPES.NEGATIVE) negativeCount++;
        else neutralCount++;

        aspectCounts[sentiment.aspect] = (aspectCounts[sentiment.aspect] || 0) + 1;
      });
    });

    const total = positiveCount + neutralCount + negativeCount;
    return {
      positivePct: total === 0 ? 0 : parseFloat(((positiveCount / total) * 100).toFixed(1)),
      neutralPct: total === 0 ? 0 : parseFloat(((neutralCount / total) * 100).toFixed(1)),
      negativePct: total === 0 ? 0 : parseFloat(((negativeCount / total) * 100).toFixed(1)),
      totalComments: total,
      aspectBreakdown: aspectCounts,
    };
  }
}

// ============================================================================
// 3. DATA EXPORT & FORMATTING UTILITIES
// ============================================================================

export class SurveyDataExporter {
  static exportToCSV(questions, simulatedData, textFeed, totalSubmissions, completionRate) {
    const rows = [];

    // Header Metadata
    rows.push(["Survey Simulation Export Report"]);
    rows.push(["Total Submissions", totalSubmissions]);
    rows.push(["Completion Rate (%)", completionRate]);
    rows.push(["Export Timestamp", new Date().toISOString()]);
    rows.push([]);

    // Question Distributions
    rows.push(["Question ID", "Question Text", "Type", "Response Option / Rating", "Vote Count / Value"]);

    questions.forEach((q) => {
      const data = simulatedData[q.id] || {};
      if (q.type === "rating" || q.type === "choice") {
        Object.entries(data).forEach(([opt, count]) => {
          rows.push([q.id, `"${q.questionText}"`, q.type, `"${opt}"`, count]);
        });
      }
    });

    rows.push([]);
    rows.push(["Text Feedback Entries"]);
    rows.push(["Question ID", "Author", "Comment Text", "Timestamp", "Sentiment Label", "Aspect"]);

    textFeed.forEach((group) => {
      group.comments.forEach((c) => {
        const s = c.sentiment || analyzeSentiment(c.text);
        rows.push([group.questionId, `"${c.author}"`, `"${c.text.replace(/"/g, '""')}"`, `"${c.time}"`, s.label, s.aspect]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `survey_simulation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToJSON(questions, simulatedData, textFeed, summaryStats) {
    const exportPayload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
      },
      summary: summaryStats,
      questions,
      simulatedData,
      textFeed,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `survey_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// ============================================================================
// 4. MAIN ENHANCED HOOK IMPLEMENTATION
// ============================================================================

export function useSurveySimulator(questions, feedbackPool, config = {}) {
  const {
    initialSubmissions = 142,
    initialCompletionRate = 87.3,
    distributionType = DISTRIBUTION_TYPES.NPS_BIASED,
    trafficProfile = TRAFFIC_PROFILES.STEADY,
    autoStreamInterval = 3000,
    enableAutoStream = false,
    maxHistorySnapshots = 50,
  } = config;

  const [totalSubmissions, setTotalSubmissions] = useState(initialSubmissions);
  const [completionRate, setCompletionRate] = useState(initialCompletionRate);
  const [simulatedData, setSimulatedData] = useState({});
  const [textFeed, setTextFeed] = useState([]);
  const [isStreaming, setIsStreaming] = useState(enableAutoStream);
  const [timeSeriesHistory, setTimeSeriesHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const questionsHash = JSON.stringify(questions);
  const feedbackHash = JSON.stringify(feedbackPool);

  const questionsRef = useRef(questions);
  const feedbackPoolRef = useRef(feedbackPool);
  questionsRef.current = questions;
  feedbackPoolRef.current = feedbackPool;

  // Initialize simulated data once or if questions length changes
  useEffect(() => {
    const safeQuestions = questions || [];
    const safeFeedback = feedbackPool || [];

    const initialData = {};
    const textComments = [];

    safeQuestions.forEach((q) => {
      if (q.type === "rating") {
        if (distributionType === DISTRIBUTION_TYPES.GAUSSIAN) {
          initialData[q.id] = { 5: 35, 4: 45, 3: 20, 2: 8, 1: 2 };
        } else if (distributionType === DISTRIBUTION_TYPES.BIMODAL) {
          initialData[q.id] = { 5: 55, 4: 10, 3: 5, 2: 12, 1: 48 };
        } else {
          // NPS_BIASED default
          initialData[q.id] = {
            5: Math.floor(Math.random() * 20) + 50,
            4: Math.floor(Math.random() * 15) + 30,
            3: Math.floor(Math.random() * 10) + 10,
            2: Math.floor(Math.random() * 5) + 3,
            1: Math.floor(Math.random() * 3) + 1,
          };
        }
      } else if (q.type === "choice") {
        const optionVotes = {};
        q.options?.forEach((opt) => {
          optionVotes[opt] = Math.floor(Math.random() * 40) + 10;
        });
        initialData[q.id] = optionVotes;
      } else if (q.type === "text") {
        const shuffled = [...safeFeedback].sort(() => 0.5 - Math.random());
        textComments.push({
          questionId: q.id,
          questionText: q.questionText,
          comments: shuffled.slice(0, 3).map((comment, index) => {
            const author = AUTHOR_NAMES[index % AUTHOR_NAMES.length];
            const sentiment = analyzeSentiment(comment);
            return {
              id: `${q.id}-${index}-${Date.now()}`,
              author,
              text: comment,
              time: `${index * 4 + 2} mins ago`,
              sentiment,
            };
          }),
        });
      }
    });

    setSimulatedData(initialData);
    setTextFeed(textComments);
    setTotalSubmissions(initialSubmissions);
    setCompletionRate(initialCompletionRate);
    setTimeSeriesHistory([
      {
        timestamp: new Date().toLocaleTimeString(),
        submissions: initialSubmissions,
        completionRate: initialCompletionRate,
      },
    ]);
    setUndoStack([]);
    setRedoStack([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsHash, feedbackHash, distributionType]);

  // Helper to record snapshots for state recovery / time series analysis
  const recordStateSnapshot = useCallback((newData, newFeed, newTotal, newRate) => {
    setTimeSeriesHistory((prev) => {
      const next = [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          submissions: newTotal,
          completionRate: newRate,
        },
      ];
      return next.slice(-maxHistorySnapshots);
    });

    setUndoStack((prev) => [
      ...prev.slice(-20),
      {
        simulatedData: JSON.parse(JSON.stringify(newData)),
        textFeed: JSON.parse(JSON.stringify(newFeed)),
        totalSubmissions: newTotal,
        completionRate: newRate,
      },
    ]);
    setRedoStack([]);
  }, [maxHistorySnapshots]);

  // Handle single or multi submission simulations
  const handleSimulateSubmission = useCallback((batchCount = 1) => {
    const safeQuestions = questionsRef.current || [];
    const safeFeedback = feedbackPoolRef.current || [];

    if (safeQuestions.length === 0) {
      toast.warn("Please add some questions first before simulating submissions!");
      return;
    }

    let updatedTotal = totalSubmissions;
    let updatedRate = completionRate;
    let updatedData = {};
    let updatedFeed = [];

    setSimulatedData((prevData) => {
      updatedData = JSON.parse(JSON.stringify(prevData));

      for (let b = 0; b < batchCount; b++) {
        safeQuestions.forEach((q) => {
          if (q.type === "rating") {
            let score = 5;
            if (distributionType === DISTRIBUTION_TYPES.UNIFORM) {
              score = Math.floor(Math.random() * 5) + 1;
            } else if (distributionType === DISTRIBUTION_TYPES.GAUSSIAN) {
              const g = Math.round(generateGaussianRandom(3.8, 0.9));
              score = Math.max(1, Math.min(5, g));
            } else if (distributionType === DISTRIBUTION_TYPES.BIMODAL) {
              score = Math.random() < 0.5 ? (Math.random() < 0.8 ? 5 : 4) : (Math.random() < 0.8 ? 1 : 2);
            } else {
              // NPS Biased
              const weights = [6, 10, 24, 24, 36]; // 1, 2, 3, 4, 5 stars
              score = getWeightedRandomIndex(weights) + 1;
            }

            updatedData[q.id] = {
              ...updatedData[q.id],
              [score]: (updatedData[q.id]?.[score] || 0) + 1,
            };
          } else if (q.type === "choice") {
            if (q.options && q.options.length > 0) {
              const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
              updatedData[q.id] = {
                ...updatedData[q.id],
                [randomOpt]: (updatedData[q.id]?.[randomOpt] || 0) + 1,
              };
            }
          }
        });
      }

      return updatedData;
    });

    setTotalSubmissions((prev) => {
      updatedTotal = prev + batchCount;
      return updatedTotal;
    });

    setCompletionRate((prev) => {
      const delta = Math.random() * 0.4 - 0.1;
      updatedRate = parseFloat((Math.min(99.4, prev + delta)).toFixed(1));
      return updatedRate;
    });

    const textQuestions = safeQuestions.filter((q) => q.type === "text");
    if (textQuestions.length > 0 && safeFeedback.length > 0) {
      setTextFeed((prevFeed) => {
        updatedFeed = JSON.parse(JSON.stringify(prevFeed));
        const targetQ = textQuestions[Math.floor(Math.random() * textQuestions.length)];
        const randomAuthor = AUTHOR_NAMES[Math.floor(Math.random() * AUTHOR_NAMES.length)];
        const randomComment = safeFeedback[Math.floor(Math.random() * safeFeedback.length)];
        const sentiment = analyzeSentiment(randomComment);

        return updatedFeed.map((item) => {
          if (item.questionId === targetQ.id) {
            return {
              ...item,
              comments: [
                {
                  id: `new-${Date.now()}-${Math.random()}`,
                  author: randomAuthor,
                  text: randomComment,
                  time: "Just now",
                  sentiment,
                },
                ...item.comments.slice(0, 4),
              ],
            };
          }
          return item;
        });
      });
    }

    recordStateSnapshot(updatedData, updatedFeed, updatedTotal, updatedRate);
  }, [distributionType, totalSubmissions, completionRate, recordStateSnapshot]);

  // Undo / Redo controls
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      {
        simulatedData: JSON.parse(JSON.stringify(simulatedData)),
        textFeed: JSON.parse(JSON.stringify(textFeed)),
        totalSubmissions,
        completionRate,
      },
    ]);

    setSimulatedData(previousState.simulatedData);
    setTextFeed(previousState.textFeed);
    setTotalSubmissions(previousState.totalSubmissions);
    setCompletionRate(previousState.completionRate);
    setUndoStack(newUndo);
  }, [undoStack, simulatedData, textFeed, totalSubmissions, completionRate]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      {
        simulatedData: JSON.parse(JSON.stringify(simulatedData)),
        textFeed: JSON.parse(JSON.stringify(textFeed)),
        totalSubmissions,
        completionRate,
      },
    ]);

    setSimulatedData(nextState.simulatedData);
    setTextFeed(nextState.textFeed);
    setTotalSubmissions(nextState.totalSubmissions);
    setCompletionRate(nextState.completionRate);
    setRedoStack(newRedo);
  }, [redoStack, simulatedData, textFeed, totalSubmissions, completionRate]);

  // Ticker for automated auto-streaming
  useEffect(() => {
    let timer = null;
    if (isStreaming) {
      timer = setInterval(() => {
        let burst = 1;
        if (trafficProfile === TRAFFIC_PROFILES.PEAK_BURST) {
          burst = Math.floor(Math.random() * 5) + 1;
        } else if (trafficProfile === TRAFFIC_PROFILES.RANDOM_SPIKE) {
          burst = Math.random() < 0.2 ? 8 : 1;
        }
        handleSimulateSubmission(burst);
      }, autoStreamInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStreaming, autoStreamInterval, trafficProfile, handleSimulateSubmission]);

  const toggleAutoStream = useCallback(() => {
    setIsStreaming((prev) => {
      const next = !prev;
      toast.info(next ? "Auto-simulation stream started" : "Auto-simulation stream paused");
      return next;
    });
  }, []);

  // Compute calculated analytics summary
  const analyticsSummary = useMemo(() => {
    const safeQuestions = questions || [];
    const questionSummaries = {};

    safeQuestions.forEach((q) => {
      const data = simulatedData[q.id] || {};
      if (q.type === "rating") {
        questionSummaries[q.id] = {
          mean: SurveyAnalyticsEngine.calculateMean(data),
          stdDev: SurveyAnalyticsEngine.calculateStandardDeviation(data),
          nps: SurveyAnalyticsEngine.calculateNPS(data),
        };
      }
    });

    const sentimentSummary = SurveyAnalyticsEngine.extractSentimentBreakdown(textFeed);

    return {
      questionSummaries,
      sentimentSummary,
      totalSubmissions,
      completionRate,
    };
  }, [questions, simulatedData, textFeed, totalSubmissions, completionRate]);

  // Helper trigger methods for data export
  const exportCSV = useCallback(() => {
    SurveyDataExporter.exportToCSV(questionsRef.current || [], simulatedData, textFeed, totalSubmissions, completionRate);
  }, [simulatedData, textFeed, totalSubmissions, completionRate]);

  const exportJSON = useCallback(() => {
    SurveyDataExporter.exportToJSON(questionsRef.current || [], simulatedData, textFeed, analyticsSummary);
  }, [simulatedData, textFeed, analyticsSummary]);

  return {
    totalSubmissions,
    completionRate,
    simulatedData,
    textFeed,
    isStreaming,
    timeSeriesHistory,
    analyticsSummary,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    handleSimulateSubmission,
    toggleAutoStream,
    handleUndo,
    handleRedo,
    exportCSV,
    exportJSON,
  };
}

// ============================================================================
// 5. STRESS TESTING & BENCHMARK HELPER UTILITY
// ============================================================================

export function runSimulatorBenchmark(questions, feedbackPool, iterations = 1000) {
  const startTime = performance.now();
  const mockData = {};

  questions.forEach((q) => {
    if (q.type === "rating") mockData[q.id] = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    else if (q.type === "choice") {
      mockData[q.id] = {};
      q.options?.forEach((opt) => (mockData[q.id][opt] = 0));
    }
  });

  for (let i = 0; i < iterations; i++) {
    questions.forEach((q) => {
      if (q.type === "rating") {
        const score = Math.floor(Math.random() * 5) + 1;
        mockData[q.id][score] += 1;
      } else if (q.type === "choice" && q.options?.length) {
        const opt = q.options[Math.floor(Math.random() * q.options.length)];
        mockData[q.id][opt] += 1;
      }
    });
  }

  const endTime = performance.now();
  const durationMs = parseFloat((endTime - startTime).toFixed(2));
  const opsPerSec = Math.round((iterations / durationMs) * 1000);

  return {
    iterations,
    durationMs,
    opsPerSec,
    sampleProcessedData: mockData,
  };
}