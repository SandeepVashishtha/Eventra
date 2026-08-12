import React, { useState } from 'react';

export const QrCheckinValidator = ({ onValidateQr }) => {
  const [scanInput, setScanInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanInput) return;

    // Simulate real-time dynamic check against registration state & expiry
    try {
      const payload = JSON.parse(scanInput);
      const isExpired = payload.exp && Date.now() > payload.exp * 1000;
      const isCancelled = payload.status === 'CANCELLED';

      if (isCancelled || isExpired) {
        setValidationResult({
          isValid: false,
          message: '❌ Registration is no longer valid.',
        });
      } else {
        setValidationResult({
          isValid: true,
          message: '✅ Participant checked in successfully!',
        });
      }
    } catch {
      setValidationResult({
        isValid: false,
        message: '❌ Registration is no longer valid.',
      });
    }

    if (onValidateQr) {
      onValidateQr(scanInput);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">QR Ticket Verification</h3>
      <form onSubmit={handleScanSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scan payload or Ticket Token</label>
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Paste QR payload..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
        >
          Verify QR Ticket
        </button>
      </form>

      {validationResult && (
        <div
          className={`mt-4 p-4 rounded-md font-semibold text-center ${
            validationResult.isValid
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {validationResult.message}
        </div>
      )}
    </div>
  );
};

export default QrCheckinValidator;
