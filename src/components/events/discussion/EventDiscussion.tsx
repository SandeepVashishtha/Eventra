import React, { useMemo, useState } from "react";

interface DiscussionReply {
  id: string | number;
  author: string;
  content: string;
  createdAt: string;
  isOrganizer?: boolean;
}

interface DiscussionQuestion {
  id: string | number;
  eventId: string | number;
  author: string;
  content: string;
  createdAt: string;
  isOrganizer?: boolean;
  replies: DiscussionReply[];
}

interface EventDiscussionProps {
  eventId: string | number;
  eventName: string;
  isAuthenticated?: boolean;
  isOrganizer?: boolean;
  currentUserName?: string;
  initialQuestions?: DiscussionQuestion[];
}

const EventDiscussion: React.FC<EventDiscussionProps> = ({
  eventId,
  eventName,
  isAuthenticated = false,
  isOrganizer = false,
  currentUserName = "You",
  initialQuestions = [],
}) => {
  const [questions, setQuestions] =
    useState<DiscussionQuestion[]>(initialQuestions);

  const [questionText, setQuestionText] = useState("");
  const [replyText, setReplyText] = useState("");

  const [activeReplyId, setActiveReplyId] = useState<
    string | number | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [reportedItems, setReportedItems] = useState<
    Set<string>
  >(new Set());

  const [message, setMessage] = useState("");

  /*
   * Only display discussions belonging to the current event.
   * Discussions are displayed in chronological order.
   */
  const eventQuestions = useMemo(() => {
    return questions
      .filter((question) => question.eventId === eventId)
      .filter((question) => {
        if (!searchQuery.trim()) {
          return true;
        }

        const query = searchQuery.toLowerCase();

        return (
          question.author.toLowerCase().includes(query) ||
          question.content.toLowerCase().includes(query) ||
          question.replies.some((reply) =>
            reply.content.toLowerCase().includes(query)
          )
        );
      })
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
      );
  }, [questions, eventId, searchQuery]);

  /*
   * Create a new question.
   */
  const handleSubmitQuestion = () => {
    if (!isAuthenticated) {
      setMessage("Please log in to ask a question.");
      return;
    }

    if (!questionText.trim()) {
      setMessage("Please enter your question.");
      return;
    }

    const newQuestion: DiscussionQuestion = {
      id: `question-${Date.now()}`,
      eventId,
      author: currentUserName,
      content: questionText.trim(),
      createdAt: new Date().toISOString(),
      isOrganizer,
      replies: [],
    };

    setQuestions((previousQuestions) => [
      ...previousQuestions,
      newQuestion,
    ]);

    setQuestionText("");

    setMessage("Your question has been posted successfully.");
  };

  /*
   * Add a reply to a question.
   */
  const handleSubmitReply = (
    questionId: string | number
  ) => {
    if (!isAuthenticated) {
      setMessage("Please log in to reply.");
      return;
    }

    if (!replyText.trim()) {
      setMessage("Please enter a reply.");
      return;
    }

    const newReply: DiscussionReply = {
      id: `reply-${Date.now()}`,
      author: currentUserName,
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
      isOrganizer,
    };

    setQuestions((previousQuestions) =>
      previousQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          replies: [...question.replies, newReply],
        };
      })
    );

    setReplyText("");
    setActiveReplyId(null);

    setMessage("Your reply has been posted successfully.");
  };

  /*
   * Report inappropriate content.
   */
  const handleReport = (
    type: "question" | "reply",
    id: string | number
  ) => {
    if (!isAuthenticated) {
      setMessage("Please log in to report content.");
      return;
    }

    const reportKey = `${type}-${id}`;

    setReportedItems((previousItems) => {
      const updatedItems = new Set(previousItems);
      updatedItems.add(reportKey);
      return updatedItems;
    });

    setMessage(
      "Thank you. This content has been reported for review."
    );
  };

  /*
   * Format discussion date.
   */
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  /*
   * Empty state for unauthenticated users.
   */
  if (!isAuthenticated) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-950">
            💬
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
            Event Discussion & Q&A
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            Ask questions about {eventName} and interact with
            other participants and organizers.
          </p>

          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            Please log in to participate in the discussion.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              💬
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Discussion & Q&A
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ask questions and discuss this event with
                participants and organizers.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Questions
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {eventQuestions.length} question
              {eventQuestions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MESSAGE
      ====================================================== */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {message}
          </p>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-4 text-blue-500 hover:text-blue-700"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          ASK QUESTION
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ask a Question
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ask anything about this event.
        </p>

        <textarea
          value={questionText}
          onChange={(event) =>
            setQuestionText(event.target.value)
          }
          placeholder="Write your question here..."
          rows={4}
          maxLength={1000}
          className="mt-4 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-400">
            {questionText.length}/1000 characters
          </span>

          <button
            type="button"
            onClick={handleSubmitQuestion}
            disabled={!questionText.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post Question
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}
      {eventQuestions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search questions and replies..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {eventQuestions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm dark:bg-gray-700">
            💭
          </div>

          <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-white">
            No discussions yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            Be the first participant to ask a question about this
            event.
          </p>
        </div>
      )}

      {/* =====================================================
          QUESTIONS
      ====================================================== */}
      {eventQuestions.length > 0 && (
        <div className="space-y-5">
          {eventQuestions.map((question) => {
            const questionReportKey = `question-${question.id}`;

            const isQuestionReported =
              reportedItems.has(questionReportKey);

            return (
              <article
                key={question.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {question.author
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {question.author}
                        </span>

                        {question.isOrganizer && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Organizer
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(question.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!isQuestionReported ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleReport(
                          "question",
                          question.id
                        )
                      }
                      className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    >
                      ⚑ Report
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Reported
                    </span>
                  )}
                </div>

                {/* Question */}
                <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-200">
                    {question.content}
                  </p>
                </div>

                {/* =================================================
                    REPLIES
                ================================================== */}
                {question.replies.length > 0 && (
                  <div className="mt-5 space-y-4 border-l-2 border-blue-100 pl-4 dark:border-blue-900">
                    {question.replies.map((reply) => {
                      const replyReportKey = `reply-${reply.id}`;

                      const isReplyReported =
                        reportedItems.has(replyReportKey);

                      return (
                        <div
                          key={reply.id}
                          className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                {reply.author
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {reply.author}
                                  </span>

                                  {reply.isOrganizer && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      Organizer
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-gray-400">
                                  {formatDate(
                                    reply.createdAt
                                  )}
                                </p>
                              </div>
                            </div>

                            {!isReplyReported ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReport(
                                    "reply",
                                    reply.id
                                  )
                                }
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                Report
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Reported
                              </span>
                            )}
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* =================================================
                    REPLY FORM
                ================================================== */}
                <div className="mt-5">
                  {activeReplyId === question.id ? (
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <textarea
                        value={replyText}
                        onChange={(event) =>
                          setReplyText(event.target.value)
                        }
                        placeholder="Write your reply..."
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyText("");
                          }}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSubmitReply(
                              question.id
                            )
                          }
                          disabled={!replyText.trim()}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReplyId(question.id)
                      }
                      className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                    >
                      ↩ Reply
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EventDiscussion;