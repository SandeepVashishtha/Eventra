
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const STATUS_STYLES = {
  Pending: {
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    icon: Clock3,
  },
  Approved: {
    className:
      "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
  },
  Rejected: {
    className:
      "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
  },
};

const EventRegistrationDeadlineExtensionRequest = ({
  registrationClosed = true,
  initialRequests = [],
  onSubmit,
  onApprove,
  onReject,
}) => {
  const [reason, setReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [responseMap, setResponseMap] = useState({});
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!reason.trim() || !preferredDate) {
      setMessage(
        "Please provide a reason and preferred registration date."
      );
      return;
    }

    const newRequest = {
      id: Date.now(),
      reason: reason.trim(),
      preferredDate,
      status: "Pending",
      response: "",
      createdAt: new Date().toLocaleDateString(),
    };

    setRequests((current) => [newRequest, ...current]);
    setReason("");
    setPreferredDate("");
    setMessage("Extension request submitted successfully.");

    onSubmit?.(newRequest);
  };

  const updateRequestStatus = (request, status) => {
    const response =
      responseMap[request.id]?.trim() || "";

    const updatedRequest = {
      ...request,
      status,
      response,
    };

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id ? updatedRequest : item
      )
    );

    if (status === "Approved") {
      onApprove?.(updatedRequest);
    }

    if (status === "Rejected") {
      onReject?.(updatedRequest);
    }
  };

  const handleResponseChange = (id, value) => {
    setResponseMap((current) => ({
      ...current,
      [id]: value,
    }));
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CalendarClock size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Exception
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Deadline Extension Request
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Request permission to register after the event
              registration deadline has closed.
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-center ${
            registrationClosed
              ? "border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
              : "border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
          }`}
        >
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Registration Status
          </p>

          <p
            className={`mt-1 text-sm font-black ${
              registrationClosed
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {registrationClosed ? "Closed" : "Open"}
          </p>
        </div>
      </div>

      {/* Request Form */}
      {registrationClosed && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <FileText size={15} />
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Submit Extension Request
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Explain why you missed the deadline and select
                your preferred registration date.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-5"
          >
            <div>
              <label
                htmlFor="extension-reason"
                className="mb-2 block text-[7px] font-bold text-slate-600 dark:text-slate-300"
              >
                Reason for Extension
              </label>

              <textarea
                id="extension-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Explain why you were unable to register before the deadline..."
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-900/30"
              />
            </div>

            <div>
              <label
                htmlFor="preferred-date"
                className="mb-2 block text-[7px] font-bold text-slate-600 dark:text-slate-300"
              >
                Preferred Registration Date
              </label>

              <input
                id="preferred-date"
                type="date"
                value={preferredDate}
                onChange={(event) =>
                  setPreferredDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-900/30 sm:w-auto"
              />
            </div>

            {message && (
              <div className="rounded-xl bg-indigo-50 px-4 py-3 text-[7px] font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <Send size={14} />
              Submit Extension Request
            </button>
          </form>
        </div>
      )}

      {/* Existing Requests */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Extension Requests
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Review submitted requests and their current status.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarClock
              size={28}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-500 dark:text-slate-400">
              No extension requests yet
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Submitted requests will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map((request) => {
              const statusConfig =
                STATUS_STYLES[request.status] ||
                STATUS_STYLES.Pending;

              const StatusIcon = statusConfig.icon;

              return (
                <div key={request.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <FileText size={15} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
                            Extension Request
                          </h4>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6px] font-bold ${statusConfig.className}`}
                          >
                            <StatusIcon size={10} />
                            {request.status}
                          </span>
                        </div>

                        <p className="mt-2 max-w-2xl text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                          {request.reason}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-[6px] font-medium text-slate-400">
                          <span>
                            Requested: {request.createdAt}
                          </span>

                          <span>
                            Preferred date:{" "}
                            {request.preferredDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.status === "Pending" && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request,
                              "Approved"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[7px] font-bold text-white hover:bg-green-700"
                        >
                          <CheckCircle2 size={12} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request,
                              "Rejected"
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[7px] font-bold text-white hover:bg-red-700"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Organizer Response */}
                  {request.status === "Pending" && (
                    <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                      <label className="mb-2 flex items-center gap-2 text-[7px] font-bold text-slate-600 dark:text-slate-300">
                        <MessageSquare size={12} />
                        Organizer Response
                      </label>

                      <textarea
                        value={responseMap[request.id] || ""}
                        onChange={(event) =>
                          handleResponseChange(
                            request.id,
                            event.target.value
                          )
                        }
                        placeholder="Optional response to the participant..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                  )}

                  {request.response && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <MessageSquare
                          size={12}
                          className="text-slate-400"
                        />

                        <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                          Organizer Response
                        </span>
                      </div>

                      <p className="mt-2 text-[7px] leading-4 text-slate-600 dark:text-slate-300">
                        {request.response}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <Clock3
            size={16}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <h3 className="text-[9px] font-bold text-amber-800 dark:text-amber-300">
              Important
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-amber-700 dark:text-amber-400">
              Submitting an extension request does not guarantee
              registration approval. The organizer must review
              the request before the participant can register.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventRegistrationDeadlineExtensionRequest;