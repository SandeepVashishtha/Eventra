import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";

import RegistrationCapacityHistory from "components/events/RegistrationCapacityHistory";
import DocumentExpiryTracking from "components/events/DocumentExpiryTracking";
import RegistrationActivityAuditLog from "components/events/RegistrationActivityAuditLog";
import { FeedbackResponseList } from "components/events/FeedbackResponse";
import CertificateDownloadCenter from "components/events/CertificateDownloadCenter";
import SessionCapacityWarning from "components/events/SessionCapacityWarning";
import RegistrationRejectionFeedback from "components/events/RegistrationRejectionFeedback";

const DEFAULT_FEEDBACK = [
  {
    id: "feedback-1",
    participantName: "Rahul Sharma",
    subject: "Registration experience",
    message:
      "The registration process was smooth, but the confirmation email took a while to arrive.",
    rating: 4,
    status: "pending",
    createdAt: "2026-08-11T10:00:00",
  },
  {
    id: "feedback-2",
    participantName: "Priya Patel",
    subject: "Check-in query",
    message: "How do I get my badge for the workshop on day two?",
    rating: 3,
    status: "reviewed",
    createdAt: "2026-08-10T16:30:00",
  },
];

const DEFAULT_REGISTRATION = {
  id: "REG-1021",
  participantId: "user-42",
  participantName: "Neha Mehta",
  eventId: "event-id",
};

export default function EventRegistrationManagement() {
  const { eventId } = useParams();
  const [history, setHistory] = useState([]);
  const [currentCapacity, setCurrentCapacity] = useState(150);
  const [feedbackList, setFeedbackList] = useState(DEFAULT_FEEDBACK);
  const [rejectionState, setRejectionState] = useState({
    submitting: false,
    lastResult: null,
  });

  const handleCapacityChange = async ({ newCapacity, reason }) => {
    setHistory((current) => [
      {
        id: `capacity-${Date.now()}`,
        previousCapacity: currentCapacity,
        newCapacity,
        changedAt: new Date().toISOString(),
        changedBy: "Event Organizer",
        reason: reason || "Capacity updated by organizer.",
      },
      ...current,
    ]);
    setCurrentCapacity(newCapacity);
    toast.success("Event capacity updated.");
  };

  const handleSendReminder = async () => {
    toast.success("Reminder sent to participant.");
  };

  const handleDocumentUpdate = async () => {
    toast.success("Document status updated.");
  };

  const handleReply = async () => {
    toast.success("Reply sent to participant.");
  };

  const handleStatusChange = async (feedbackId, status) => {
    setFeedbackList((current) =>
      current.map((item) =>
        item.id === feedbackId ? { ...item, status } : item
      )
    );
    toast.success(`Feedback marked as ${status}.`);
  };

  const handleResolve = async () => {
    toast.success("Feedback resolved.");
  };

  const handleReject = async (payload) => {
    setRejectionState((current) => ({ ...current, submitting: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setRejectionState({
        submitting: false,
        lastResult: { ok: true, payload },
      });
      toast.success(`Registration ${payload.registrationId} rejected.`);
    } finally {
      setRejectionState((current) => ({ ...current, submitting: false }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center gap-3">
          <Link
            to={`/events/${eventId}`}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <ClipboardList className="h-8 w-8 text-indigo-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold">Event Registration Management</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Capacity history, document expiry, audit logs, feedback, certificates, and
              session warnings for event #{eventId}.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <RegistrationCapacityHistory
            history={history}
            currentCapacity={currentCapacity}
            onCapacityChange={handleCapacityChange}
          />
          <DocumentExpiryTracking
            onSendReminder={handleSendReminder}
            onDocumentUpdate={handleDocumentUpdate}
          />
          <RegistrationActivityAuditLog />
          <SessionCapacityWarning />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Participant Feedback</h2>
            <FeedbackResponseList
              feedbackList={feedbackList}
              onReply={handleReply}
              onStatusChange={handleStatusChange}
              onResolve={handleResolve}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Certificates</h2>
            <CertificateDownloadCenter />
            <h2 className="pt-4 text-lg font-semibold">Reject Registration</h2>
            <RegistrationRejectionFeedback
              registration={{ ...DEFAULT_REGISTRATION, eventId }}
              onReject={handleReject}
              isSubmitting={rejectionState.submitting}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
