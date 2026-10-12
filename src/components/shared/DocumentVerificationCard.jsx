import React, { useState } from 'react';

export const DocumentVerificationCard = ({
  participantName = 'Jane Doe',
  documentName = 'Student ID Card / Eligibility Certificate',
  initialStatus = 'PENDING',
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = () => {
    setStatus('VERIFIED');
    setRejectionReason('');
    setShowRejectInput(false);
    if (onUpdateStatus) {
      onUpdateStatus({ status: 'VERIFIED', rejectionReason: '' });
    }
    setSuccessMsg('Document successfully marked as verified.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    setStatus('REJECTED');
    setShowRejectInput(false);
    if (onUpdateStatus) {
      onUpdateStatus({ status: 'REJECTED', rejectionReason });
    }
    setSuccessMsg('Document marked as rejected with reason.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Verified</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Rejected</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Pending</span>;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {participantName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Document: <span className="font-semibold text-gray-700 dark:text-gray-300">{documentName}</span>
          </p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {successMsg && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-500 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {status === 'REJECTED' && rejectionReason && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
          <span className="font-bold">Rejection Reason:</span> {rejectionReason}
        </div>
      )}

      {showRejectInput ? (
        <form onSubmit={handleRejectSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Provide Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            placeholder="e.g. Image is blurry or ID has expired..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100"
            rows="3"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition"
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => setShowRejectInput(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg text-xs transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleVerify}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
          >
            Mark as Verified
          </button>
          <button
            onClick={() => setShowRejectInput(true)}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition"
          >
            Reject Document
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationCard;
