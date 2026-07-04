import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  generateQRCodePayload,
  parseQRCodeData,
  validateCheckInPayload,
  recordCheckIn,
  hasBeenCheckedIn,
} from '../utils/checkInUtils.js';

/**
 * EventCheckInScanner Component
 * Provides QR code scanning functionality for event check-ins
 * Uses the device camera to scan and validate QR codes
 */
const EventCheckInScanner = ({ eventId, onCheckIn, existingCheckIns = [], registrations = [] }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedId, setLastScannedId] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const errorMsg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please enable camera access.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Failed to access camera. Please try again.';

      setCameraError(errorMsg);
      setIsScanning(false);
      toast.error(errorMsg);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsScanning(false);
  };

  // Process video frame for QR code detection
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0);

    // In a real implementation, you would use a QR code detection library like:
    // - jsQR (https://github.com/cozmo/jsQR)
    // - html5-qrcode (https://github.com/mebjas/html5-qrcode)
    // For now, we'll provide a placeholder that demonstrates the flow
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      // QR detection would happen here
      // This is a simplified placeholder
    } catch (err) {
      console.error('Frame processing error:', err);
    }

    if (isScanning) {
      requestAnimationFrame(processFrame);
    }
  };

  // Handle manual QR code input (for testing/fallback)
  const handleManualInput = (qrData) => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    processQRCodeData(qrData);
  };

  // Process scanned QR code
  const processQRCodeData = async (qrData) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Parse QR code
      const parsedData = parseQRCodeData(qrData);

      if (!parsedData) {
        toast.error('Invalid QR code format');
        setIsProcessing(false);
        return;
      }

      // Validate against current event
      const validation = validateCheckInPayload(parsedData, eventId);

      if (!validation.isValid) {
        toast.error(validation.error);
        setIsProcessing(false);
        return;
      }

      const { registrationId } = parsedData;

      // Check for duplicate check-in
      if (hasBeenCheckedIn(registrationId, existingCheckIns)) {
        const attendee = registrations.find((r) => r.id === registrationId);
        toast.warning(
          `${attendee?.name || 'Attendee'} already checked in`
        );
        setIsProcessing(false);
        return;
      }

      // Record check-in
      const checkInRecord = recordCheckIn({
        registrationId,
        timestamp: new Date().toISOString(),
        scannedBy: 'qr-scanner',
      });

      setLastScannedId(registrationId);
      setScannedData(parsedData);

      // Call parent callback
      if (onCheckIn) {
        onCheckIn(checkInRecord, parsedData);
      }

      const attendee = registrations.find((r) => r.id === registrationId);
      toast.success(`✓ ${attendee?.name || 'Attendee'} checked in!`);

      // Reset state after 2 seconds
      setTimeout(() => {
        setScannedData(null);
      }, 2000);
    } catch (err) {
      console.error('QR processing error:', err);
      toast.error('Error processing QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start frame processing when camera starts
  useEffect(() => {
    if (isScanning && videoRef.current?.srcObject) {
      processFrame();
    }

    return () => {
      // Cleanup
    };
  }, [isScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Event Check-In
      </h2>

      {/* Camera Error */}
      {cameraError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {cameraError}
        </div>
      )}

      {/* Camera Feed */}
      <div className="mb-4 relative bg-black rounded-lg overflow-hidden">
        {!isScanning ? (
          <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
            <span className="text-white text-center">
              Camera not active
              <br />
              <small>Click "Start Scanning" to begin</small>
            </span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            aria-label="Camera feed for QR code scanning"
          />
        )}

        {/* Scanning indicator */}
        {isScanning && (
          <div className="absolute inset-0 border-2 border-green-500 pointer-events-none">
            <div className="absolute inset-4 border border-green-500 opacity-50" />
          </div>
        )}

        {/* Last scanned indicator */}
        {scannedData && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-3xl mb-2">✓</div>
              <div className="font-semibold">Check-in Successful!</div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas for frame processing (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Manual QR Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter QR code manually:
        </label>
        <input
          type="text"
          placeholder="Paste QR code data here"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleManualInput(e.target.value);
              e.target.value = '';
            }
          }}
          disabled={isProcessing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          aria-label="Manual QR code input"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isScanning ? (
          <button
            onClick={startCamera}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
            aria-label="Start camera for QR scanning"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            aria-label="Stop camera scanning"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {/* Last Scanned Info */}
      {lastScannedId && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
          <p className="text-sm font-medium text-green-800 dark:text-green-100">
            Last check-in: {lastScannedId}
          </p>
          {scannedData?.attendeeName && (
            <p className="text-sm text-green-700 dark:text-green-200">
              {scannedData.attendeeName} ({scannedData.attendeeEmail})
            </p>
          )}
        </div>
      )}

      {/* Note about QR library */}
      <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-100">
        <strong>Note:</strong> To enable actual QR code detection, integrate a library like
        html5-qrcode or jsQR.
      </div>
    </div>
  );
};

export default EventCheckInScanner;
