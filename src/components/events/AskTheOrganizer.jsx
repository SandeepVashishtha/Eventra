import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "context/AuthContext";
import { apiUtils, API_ENDPOINTS } from "config/api";

const REFRESH_INTERVAL_MS = 15000;

const extractQuestions = (payload) => {
  const candidate =
    payload?.data?.questions ??
    payload?.questions ??
    payload?.data ??
    payload;

  return Array.isArray(candidate) ? candidate : [];
};

const getAnswerText = (question) => {
  if (!question) return "";

  if (typeof question.answer === "string") return question.answer.trim();
  if (typeof question.answerText === "string") return question.answerText.trim();
  if (typeof question.responseText === "string") return question.responseText.trim();
  if (typeof question.organizerAnswer === "string") return question.organizerAnswer.trim();
  if (typeof question.answer?.text === "string") return question.answer.text.trim();

  return "";
};

const hasAnswer = (question) =>
  Boolean(
    getAnswerText(question) ||
      question?.answeredAt ||
      question?.isAnswered ||
      question?.answered
  );

const isPublicQuestion = (question) =>
  question?.isPublic === undefined ? true : Boolean(question?.isPublic);

const AskTheOrganizer = ({ eventId }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadQuestions = async ({ background = false } = {}) => {
    if (!eventId) return;

    if (!background) {
      setLoading(true);
    }

    try {
      const response = await apiUtils.get(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId));

      if (!response.ok) {
        throw new Error("Failed to load organizer questions");
      }

      setQuestions(extractQuestions(response.data));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        t(
          "askOrganizer.errorLoading",
          "Unable to load public Q&A right now. Please try again shortly."
        )
      );
      console.error("Failed to fetch Ask the Organizer questions", error);
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isDisposed = false;

    const runLoad = async (opts) => {
      if (!isDisposed) {
        await loadQuestions(opts);
      }
    };

    runLoad();

    const intervalId = window.setInterval(() => {
      runLoad({ background: true });
    }, REFRESH_INTERVAL_MS);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedQuestion = newQuestion.trim();
    if (!trimmedQuestion) return;

    if (!isAuthenticated()) {
      toast.error(
        t("askOrganizer.loginRequired", "Please log in to ask the organizer a question.")
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiUtils.post(API_ENDPOINTS.LIVE_AUDIENCE.QUESTIONS(eventId), {
        text: trimmedQuestion,
        isPublic: true,
      });

      if (!response.ok) {
        throw new Error("Failed to submit organizer question");
      }

      setNewQuestion("");
      toast.success(
        t("askOrganizer.successSent", "Question sent! It is now visible in the public queue.")
      );
      await loadQuestions({ background: true });
    } catch (error) {
      console.error("Failed to submit organizer question", error);
      toast.error(
        t("askOrganizer.errorSending", "Could not send your question. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (questionId) => {
    setExpandedId((prev) => (prev === questionId ? null : questionId));
  };

  const publicQuestions = useMemo(() => {
    return questions
      .filter((question) => isPublicQuestion(question) || hasAnswer(question))
      .sort((a, b) => {
        const aPinned = Boolean(a?.isPinned) || hasAnswer(a);
        const bPinned = Boolean(b?.isPinned) || hasAnswer(b);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        const aCreatedAt = new Date(a?.createdAt || 0).getTime();
        const bCreatedAt = new Date(b?.createdAt || 0).getTime();
        return bCreatedAt - aCreatedAt;
      });
  }, [questions]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("askOrganizer.title", "Ask the Organizer")}
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(
            "askOrganizer.subtitle",
            "Ask event-specific questions and see organizer answers in one public feed."
          )}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value.slice(0, 250))}
            placeholder={t(
              "askOrganizer.placeholder",
              "Is there vegan catering? Is there parking? Ask your question here."
            )}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            rows="3"
            maxLength={250}
            disabled={submitting}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {newQuestion.length}/250
            </span>
            <button
              type="submit"
              disabled={submitting || !newQuestion.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all font-medium disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t("askOrganizer.send", "Ask Question")}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t("askOrganizer.publicQA", "Public Q&A")}
          </h4>

          {errorMessage && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{errorMessage}</p>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : publicQuestions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("askOrganizer.noQuestions", "No public questions yet. Be the first to ask!")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicQuestions.map((question) => {
                const answerText = getAnswerText(question);
                const answered = hasAnswer(question);
                const isExpanded = expandedId === question.id;

                return (
                  <article
                    key={question.id}
                    className={`group rounded-2xl border transition-all ${
                      answered
                        ? "border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                        : "border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(question.id)}
                      className="w-full text-left p-4 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                          {question.text}
                        </p>
                        {answered && (
                          <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {t("askOrganizer.answeredBadge", "Answered")}
                            </span>
                          </div>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && answerText && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-4 border-l-2 border-emerald-500 dark:border-emerald-400">
                          <p className="text-sm text-gray-600 dark:text-gray-300">{answerText}</p>
                          <p className="mt-2 text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                            {t(
                              "askOrganizer.organizerResponseLabel",
                              "Response from organizer"
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {isExpanded && !answerText && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-xs italic text-gray-400">
                          {t(
                            "askOrganizer.pendingAnswer",
                            "Waiting for organizer response..."
                          )}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AskTheOrganizer;
