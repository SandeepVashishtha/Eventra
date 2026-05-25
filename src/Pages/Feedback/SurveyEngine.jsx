import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiEye,
  FiPlusCircle,
  FiSave,
} from "react-icons/fi";
import { toast } from "react-toastify";
import useDocumentTitle from "../../hooks/useDocumentTitle";

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
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, questionText: text } : q))
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
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions[optionIndex] = text;
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

    const payload = {
      title: surveyTitle,
      description: surveyDescription,
      questions: questions,
      createdAt: new Date().toISOString(),
    };

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
              onClick={() => setActiveTab(activeTab === "builder" ? "preview" : "builder")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
            >
              <FiEye className="w-5 h-5 text-indigo-500" />
              {activeTab === "builder" ? "Live Preview" : "Back to Editor"}
            </button>
            
            <button
              onClick={handleSaveSurvey}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <FiSave className="w-5 h-5" />
              Publish Survey
            </button>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <AnimatePresence mode="wait">
          {activeTab === "builder" ? (
            <motion.div
              key="builder-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
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
                        </div>

                        <button
                           id="ymjlwm"
onClick={() =>
  setConfirmModal({
    open: true,
    type: "question",
    questionId: question.id
  })
}


                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Remove question"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
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
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateOptionText(question.id, optIdx, e.target.value)
                                  }
                                  className="flex-1 max-w-md bg-transparent border-b border-slate-100 dark:border-slate-800 focus:border-indigo-500 outline-none text-sm py-0.5"
                                />
                                <button
                                  onClick={() => setConfirmModal({ open: true, type: "option", questionId: question.id, optionIndex: optIdx }) }
                                  className="text-slate-400 hover:text-red-500 p-1"
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
          ) : (
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
                >
                  Submit Survey Feedback
                </button>
              </div>
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
