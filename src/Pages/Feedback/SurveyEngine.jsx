import { Plus, Trash2, PlusCircle, Save, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import SurveyAnalytics from "../../components/admin/SurveyAnalytics";
import { validate } from "../../validation";
import { safeJsonParse } from "../../utils/safeJsonParse";

const SurveyEngine = () => {
  useDocumentTitle("Eventra | Dynamic Survey Engine");

  const [surveyTitle, setSurveyTitle] = useState("Post-Event Attendee Feedback Survey");
  const [surveyDescription, setSurveyDescription] = useState(
    "Thank you for attending our event. Please take a few minutes to share your thoughts."
  );

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "rating",
      questionText: "How would you rate the overall quality of the event sessions?",
      required: true,
      options: [],
    },
    {
      id: 2,
      type: "choice",
      questionText: "Which of the following topics did you find most valuable?",
      required: true,
      options: [
        "Keynote Address",
        "Panel Discussions",
        "Hands-on Workshops",
        "Networking Sessions",
      ],
    },
    {
      id: 3,
      type: "text",
      questionText: "What was your favorite part of the event, and why?",
      required: false,
      options: [],
    },
  ]);

  const [activeTab, setActiveTab] = useState("builder"); // "builder" | "preview"
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    questionId: null,
    optionIndex: null,
  });

  // Telemetry & Draft Persistence State
  const [draftDetected, setDraftDetected] = useState(false);
  const [cachedDraft, setCachedDraft] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for saved template drafts on mount
  useEffect(() => {
    const draft = localStorage.getItem("eventra_survey_builder_draft");
    if (draft) {
      try {
        const parsed = safeJsonParse(draft, {});
        if (parsed.questions?.length > 0 || parsed.title || parsed.description) {
          setCachedDraft(parsed);
          setDraftDetected(true);
          return; // Skip setting isInitialized to prevent early overwrite
        }
      } catch {}
    }
    setIsInitialized(true);
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isInitialized) return;

    const delayDebounceId = setTimeout(() => {
      const payload = {
        title: surveyTitle,
        description: surveyDescription,
        questions: questions,
      };
      localStorage.setItem("eventra_survey_builder_draft", JSON.stringify(payload));
    }, 1000);

    return () => clearTimeout(delayDebounceId);
  }, [surveyTitle, surveyDescription, questions, isInitialized]);

  const handleRestoreDraft = () => {
    if (cachedDraft) {
      setSurveyTitle(cachedDraft.title || "");
      setSurveyDescription(cachedDraft.description || "");
      setQuestions(cachedDraft.questions || []);
      toast.success("Survey template draft restored!");
    }
    setDraftDetected(false);
    setCachedDraft(null);
    setIsInitialized(true);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("eventra_survey_builder_draft");
    setDraftDetected(false);
    setCachedDraft(null);
    setIsInitialized(true);
    toast.info("Survey template draft discarded");
  };

  // Question type configuration
  const questionTypes = [
    { value: "text", label: "Open Text Question" },
    { value: "choice", label: "Multiple Choice" },
    { value: "rating", label: "Rating Scale (1-5 Stars)" },
  ];

  // Add a new question
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      questionText: "",
      required: false,
      options: type === "choice" ? ["Option 1", "Option 2"] : [],
    };
    setQuestions([...questions, newQuestion]);
    toast.info(`Added a new ${type} question!`);
  };

  // Update question properties
  const updateQuestionText = (id, text) => {
    // Show validation notifications if HTML is detected
    if (validate.detectHTML(text)) {
      toast.warning("HTML elements detected. They will be automatically sanitized to prevent XSS.");
    }
    const sanitized = validate.sanitizeSurveyPrompt(text);
    setQuestions(questions.map((q) => (q.id === id ? { ...q, questionText: sanitized } : q)));
  };

  const toggleRequired = (id) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, required: !q.required } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.warn("Question removed");
  };

  const moveQuestion = (index, direction) => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
    setQuestions(updated);
  };

  // Multiple choice option helpers
  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
        }
        return q;
      })
    );
  };

  const updateOptionText = (questionId, optionIndex, text) => {
    if (validate.detectHTML(text)) {
      toast.warning("HTML elements detected. They will be automatically sanitized to prevent XSS.");
    }
    const sanitized = validate.sanitizeSurveyOption(text);
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions[optionIndex] = sanitized;
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    );
  };

  const deleteOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((_, idx) => idx !== optionIndex),
          };
        }
        return q;
      })
    );
  };

  const handleSaveSurvey = () => {
    // Validate
    if (!surveyTitle.trim()) {
      toast.error("Please enter a survey title");
      return;
    }
    const hasEmptyQuestion = questions.some((q) => !q.questionText.trim());
    if (hasEmptyQuestion) {
      toast.error("Please fill in the question text for all questions");
      return;
    }

    localStorage.removeItem("eventra_survey_builder_draft");
    toast.success("Survey published and active for attendees!");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 transition-colors duration-300 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        {/* HEADER BAR */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              Dynamic Survey Constructor
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Build custom feedback forms, ratings, and questionnaires for your attendees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSurvey}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
              aria-label="button"
            >
              <Save className="h-5 w-5" />
              Publish Survey
            </button>
          </div>
        </div>

        {/* HIGH-FIDELITY NAVIGATION TABS */}
        <div className="mb-8 flex gap-8 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {[
            { id: "builder", label: "Survey Builder" },
            { id: "preview", label: "Live Preview" },
            { id: "analytics", label: "Submission Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 cursor-pointer border-b-2 px-1 pb-4 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "border-indigo-550 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-450 border-transparent hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN LAYOUT */}
        <AnimatePresence mode="wait">
          {activeTab === "builder" && (
            <motion.div
              key="builder-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* SURVEY BUILDER DRAFT DETECTION BANNER */}
              {draftDetected && cachedDraft && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm sm:flex-row sm:items-center dark:border-indigo-900/50 dark:bg-indigo-950/40"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                      📝 Resume where you left off?
                    </h3>
                    <p className="text-xs leading-relaxed text-indigo-700/80 dark:text-indigo-400/80">
                      We found an unsaved survey template draft with{" "}
                      {cachedDraft.questions?.length || 0} question(s) titled{" "}
                      <strong className="font-semibold">
                        &quot;{cachedDraft.title || "Untitled Survey"}&quot;
                      </strong>
                      .
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 gap-2.5 sm:w-auto">
                    <button
                      onClick={handleRestoreDraft}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none"
                      aria-label="button"
                    >
                      Restore Template
                    </button>
                    <button
                      onClick={handleDiscardDraft}
                      className="hover:bg-slate-350 dark:hover:bg-slate-750 flex-1 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition sm:flex-none dark:bg-slate-800 dark:text-slate-300"
                      aria-label="button"
                    >
                      Discard
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SURVEY IDENTITY METADATA CARD */}
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800/80 dark:bg-slate-900">
                <div className="space-y-4 border-l-4 border-indigo-500 pl-4">
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Enter Survey Title..."
                    className="w-full border-b border-transparent bg-transparent pb-1 text-2xl font-bold transition-all outline-none focus:border-indigo-500"
                  />
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Provide a brief description or instructions for attendees..."
                    rows={2}
                    className="w-full resize-none border-b border-transparent bg-transparent pb-1 text-slate-500 transition-all outline-none focus:border-indigo-500 dark:text-slate-400"
                  />
                </div>
              </div>

              {/* QUESTIONS BUILDER GRID */}
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
                    <p className="mb-3 text-lg font-medium text-slate-400 dark:text-slate-600">
                      Your survey is currently empty.
                    </p>
                    <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      Add your first question using the builder controls below to start collecting
                      feedback.
                    </p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layoutId={`card-${question.id}`}
                      className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800/80 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                              {index + 1}
                            </span>
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                              {questionTypes.find((t) => t.value === question.type)?.label}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={question.questionText}
                            onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            placeholder="Type your question prompt here..."
                            className="w-full border-b border-slate-200 bg-transparent pb-1 text-lg font-semibold transition-all outline-none focus:border-indigo-500 dark:border-slate-800"
                          />

                          {/* REAL-TIME VALIDATION WARNINGS & COUNTERS */}
                          <div className="flex items-center justify-between pt-1 text-[10px] font-semibold">
                            <div className="flex items-center gap-1 text-rose-500">
                              {question.questionText.length >= 140 && (
                                <span>⚠️ Reached character boundary limit (150 max)</span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] ${question.questionText.length >= 140 ? "font-extrabold text-rose-500" : "text-slate-400"}`}
                            >
                              {question.questionText.length} / 150
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => moveQuestion(index, "up")}
                            disabled={index === 0}
                            className={`rounded-xl border p-2 transition-all ${
                              index === 0
                                ? "cursor-not-allowed border-slate-100 text-slate-300 opacity-40 dark:border-slate-800/40 dark:text-slate-700"
                                : "cursor-pointer border-slate-200 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-indigo-950/30"
                            }`}
                            title="Move question up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => moveQuestion(index, "down")}
                            disabled={index === questions.length - 1}
                            className={`rounded-xl border p-2 transition-all ${
                              index === questions.length - 1
                                ? "cursor-not-allowed border-slate-100 text-slate-300 opacity-40 dark:border-slate-800/40 dark:text-slate-700"
                                : "cursor-pointer border-slate-200 text-slate-500 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-500 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-indigo-950/30"
                            }`}
                            title="Move question down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>

                          <button
                            id="ymjlwm"
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                type: "question",
                                questionId: question.id,
                              })
                            }
                            className="ml-1 cursor-pointer rounded-xl p-2.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                            title="Remove question"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* CHOICE SELECTIONS CREATOR */}
                      {question.type === "choice" && (
                        <div className="space-y-2.5 pl-9">
                          <AnimatePresence>
                            {question.options.map((option, optIdx) => (
                              <motion.div
                                key={optIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-3"
                              >
                                <div className="h-4 w-4 rounded-full border-2 border-slate-300 bg-transparent dark:border-slate-700" />
                                <div className="max-w-md flex-1 space-y-1">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      updateOptionText(question.id, optIdx, e.target.value)
                                    }
                                    className="w-full border-b border-slate-100 bg-transparent py-0.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-800"
                                  />
                                  <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                                    <span className="text-rose-500">
                                      {option.length >= 70 && "⚠️ Option near max limit (80 max)"}
                                    </span>
                                    <span>{option.length} / 80</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      open: true,
                                      type: "option",
                                      questionId: question.id,
                                      optionIndex: optIdx,
                                    })
                                  }
                                  className="self-start p-1 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <button
                            onClick={() => addOption(question.id)}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Option
                          </button>
                        </div>
                      )}

                      {/* RATING SCALE EXPLANATION */}
                      {question.type === "rating" && (
                        <div className="pl-9 text-xs text-slate-400 dark:text-slate-500">
                          Displays a responsive, screen-reader optimized 5-star rating matrix with
                          hover animations.
                        </div>
                      )}

                      {/* CARD CONTROLS */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 pl-9 dark:border-slate-800/40">
                        <label className="flex cursor-pointer items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={() => toggleRequired(question.id)}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Required question
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* QUICK ADD BUTTONS SECTION */}
              <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-slate-100 p-6 shadow-inner dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  + Add Question Type
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => addQuestion(type.value)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold transition-all hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md active:scale-98 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
                    >
                      <Plus className="h-5 w-5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "preview" && (
            <motion.div
              key="preview-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{surveyTitle}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{surveyDescription}</p>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <h4 className="text-base font-semibold">
                      {index + 1}. {question.questionText || "Untitled Question"}
                      {question.required && <span className="ml-1 text-red-500">*</span>}
                    </h4>

                    {question.type === "text" && (
                      <textarea
                        rows={3}
                        placeholder="Write your answer..."
                        disabled
                        className="w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950/40"
                      />
                    )}

                    {question.type === "choice" && (
                      <div className="space-y-2">
                        {question.options.map((option, idx) => (
                          <label key={idx} className="flex items-center gap-3 select-none">
                            <input
                              type="radio"
                              disabled
                              name={`preview-q-${question.id}`}
                              className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === "rating" && (
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400 hover:bg-yellow-50 dark:border-slate-800 dark:bg-slate-950/40"
                          >
                            ★
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
                <button
                  disabled
                  className="cursor-not-allowed rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  aria-label="button"
                >
                  Submit Survey Feedback
                </button>
              </div>
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <SurveyAnalytics questions={questions} surveyTitle={surveyTitle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Confirm Delete</h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {confirmModal.type === "question"
                ? "Are you sure you want to delete this question? This action cannot be undone."
                : "Are you sure you want to delete this option?"}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: null,
                    questionId: null,
                    optionIndex: null,
                  })
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (confirmModal.type === "question") {
                    deleteQuestion(confirmModal.questionId);
                  } else {
                    deleteOption(confirmModal.questionId, confirmModal.optionIndex);
                  }

                  setConfirmModal({
                    open: false,
                    type: null,
                    questionId: null,
                    optionIndex: null,
                  });
                }}
                className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyEngine;
