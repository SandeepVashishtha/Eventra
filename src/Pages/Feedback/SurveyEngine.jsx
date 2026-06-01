import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiPlusCircle,
  FiSave,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { toast } from "react-toastify";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import SurveyAnalytics from "../../components/admin/SurveyAnalytics";
import { validate } from "../../validation";

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
      options: ["Keynote Address", "Panel Discussions", "Hands-on Workshops", "Networking Sessions"],
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
        const parsed = JSON.parse(draft);
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
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, questionText: sanitized } : q))
    );
  };

  const toggleRequired = (id) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
    );
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
              Dynamic Survey Constructor
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Build custom feedback forms, ratings, and questionnaires for your attendees.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSurvey}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
             aria-label="button">
              <FiSave className="w-5 h-5" />
              Publish Survey
            </button>
          </div>
        </div>

        {/* HIGH-FIDELITY NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto gap-8">
          {[
            { id: "builder", label: "Survey Builder" },
            { id: "preview", label: "Live Preview" },
            { id: "analytics", label: "Submission Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-550 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
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
                  className="p-5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                      📝 Resume where you left off?
                    </h3>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                      We found an unsaved survey template draft with {cachedDraft.questions?.length || 0} question(s) titled <strong className="font-semibold">&quot;{cachedDraft.title || "Untitled Survey"}&quot;</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2.5 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={handleRestoreDraft}
                      className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-sm transition"
                     aria-label="button">
                      Restore Template
                    </button>
                    <button
                      onClick={handleDiscardDraft}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition"
                     aria-label="button">
                      Discard
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SURVEY IDENTITY METADATA CARD */}
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4 space-y-4">
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Enter Survey Title..."
                    className="w-full text-2xl font-bold bg-transparent border-b border-transparent focus:border-indigo-500 outline-none pb-1 transition-all"
                  />
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Provide a brief description or instructions for attendees..."
                    rows={2}
                    className="w-full text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none resize-none pb-1 transition-all"
                  />
                </div>
              </div>

              {/* QUESTIONS BUILDER GRID */}
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-400 dark:text-slate-600 text-lg font-medium mb-3">
                      Your survey is currently empty.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                      Add your first question using the builder controls below to start collecting feedback.
                    </p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layoutId={`card-${question.id}`}
                      className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-md space-y-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {questionTypes.find((t) => t.value === question.type)?.label}
                            </span>
                          </div>
                          
                          <input
                            type="text"
                            value={question.questionText}
                            onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            placeholder="Type your question prompt here..."
                            className="w-full text-lg font-semibold bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none pb-1 transition-all"
                          />
                          
                          {/* REAL-TIME VALIDATION WARNINGS & COUNTERS */}
                          <div className="flex justify-between items-center text-[10px] font-semibold pt-1">
                            <div className="text-rose-500 flex items-center gap-1">
                              {question.questionText.length >= 140 && (
                                <span>⚠️ Reached character boundary limit (150 max)</span>
                              )}
                            </div>
                            <span className={`text-[10px] ${question.questionText.length >= 140 ? "text-rose-500 font-extrabold" : "text-slate-400"}`}>
                              {question.questionText.length} / 150
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveQuestion(index, "up")}
                            disabled={index === 0}
                            className={`p-2 rounded-xl border transition-all ${
                              index === 0
                                ? "text-slate-300 border-slate-100 dark:border-slate-800/40 dark:text-slate-700 cursor-not-allowed opacity-40"
                                : "text-slate-500 border-slate-200 dark:border-slate-800 dark:text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer"
                            }`}
                            title="Move question up"
                          >
                            <FiArrowUp className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => moveQuestion(index, "down")}
                            disabled={index === questions.length - 1}
                            className={`p-2 rounded-xl border transition-all ${
                              index === questions.length - 1
                                ? "text-slate-300 border-slate-100 dark:border-slate-800/40 dark:text-slate-700 cursor-not-allowed opacity-40"
                                : "text-slate-500 border-slate-200 dark:border-slate-800 dark:text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer"
                            }`}
                            title="Move question down"
                          >
                            <FiArrowDown className="w-4 h-4" />
                          </button>
                          
                          <button
                            id="ymjlwm"
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                type: "question",
                                questionId: question.id
                              })
                            }
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer ml-1"
                            title="Remove question"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* CHOICE SELECTIONS CREATOR */}
                      {question.type === "choice" && (
                        <div className="pl-9 space-y-2.5">
                          <AnimatePresence>
                            {question.options.map((option, optIdx) => (
                              <motion.div
                                key={optIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-3"
                              >
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent" />
                                <div className="flex-1 max-w-md space-y-1">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      updateOptionText(question.id, optIdx, e.target.value)
                                    }
                                    className="w-full bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none text-sm py-0.5"
                                  />
                                  <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                                    <span className="text-rose-500">
                                      {option.length >= 70 && "⚠️ Option near max limit (80 max)"}
                                    </span>
                                    <span>{option.length} / 80</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setConfirmModal({ open: true, type: "option", questionId: question.id, optionIndex: optIdx }) }
                                  className="text-slate-400 hover:text-red-500 p-1 self-start"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <button
                            onClick={() => addOption(question.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mt-2"
                          >
                            <FiPlusCircle className="w-4 h-4" />
                            Add Option
                          </button>
                        </div>
                      )}

                      {/* RATING SCALE EXPLANATION */}
                      {question.type === "rating" && (
                        <div className="pl-9 text-xs text-slate-400 dark:text-slate-500">
                          Displays a responsive, screen-reader optimized 5-star rating matrix with hover animations.
                        </div>
                      )}

                      {/* CARD CONTROLS */}
                      <div className="pl-9 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={() => toggleRequired(question.id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
              <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-inner space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  + Add Question Type
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => addQuestion(type.value)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-98"
                    >
                      <FiPlus className="w-5 h-5" />
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
              className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl space-y-8"
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
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>

                    {question.type === "text" && (
                      <textarea
                        rows={3}
                        placeholder="Write your answer..."
                        disabled
                        className="w-full max-w-xl px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm focus:outline-none"
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
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
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
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:bg-yellow-50 flex items-center justify-center text-sm font-semibold cursor-not-allowed text-slate-400"
                          >
                            ★
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold cursor-not-allowed text-sm"
                 aria-label="button">
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
      
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
        Confirm Delete
      </h2>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {confirmModal.type === "question"
          ? "Are you sure you want to delete this question? This action cannot be undone."
          : "Are you sure you want to delete this option?"}
      </p>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() =>
            setConfirmModal({
              open: false,
              type: null,
              questionId: null,
              optionIndex: null
            })
          }
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (confirmModal.type === "question") {
              deleteQuestion(confirmModal.questionId);
            } else {
              deleteOption(
                confirmModal.questionId,
                confirmModal.optionIndex
              );
            }

            setConfirmModal({
              open: false,
              type: null,
              questionId: null,
              optionIndex: null
            });
          }}
          className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
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
