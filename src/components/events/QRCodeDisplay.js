import { useEffect, useRef, useState } from "react";
import {
  Download,
  QrCode,
  User,
} from "lucide-react";
import {
  getQRCodeFileName,
  getQRCodeSummary,
} from "../../utils/registrationQRCodeUtils";

const QRCodeDisplay = ({
  value,
  registration,
  onGenerated,
}) => {
  const canvasRef = useRef(null);
  const [qrReady, setQrReady] =
    useState(false);

  const summary =
    getQRCodeSummary(registration);

  useEffect(() => {
    let cancelled = false;

    const generateQRCode = async () => {
      if (!value || !canvasRef.current) {
        return;
      }

      try {
        /*
         * Use the project's QR-code library when available.
         *
         * Expected package:
         * `qrcode`
         *
         * Install with:
         * npm install qrcode
         */
        const QRCode =
          await import("qrcode");

        if (cancelled) {
          return;
        }

        await QRCode.toCanvas(
          canvasRef.current,
          value,
          {
            width: 260,
            margin: 2,
            errorCorrectionLevel: "M",
          }
        );

        if (!cancelled) {
          setQrReady(true);
          onGenerated?.();
        }
      } catch (error) {
        console.error(
          "Unable to generate QR code:",
          error
        );

        if (!cancelled) {
          setQrReady(false);
        }
      }
    };

    generateQRCode();

    return () => {
      cancelled = true;
    };
  }, [value, onGenerated]);

  const handleDownload = () => {
    if (!canvasRef.current || !qrReady) {
      return;
    }

    const link =
      document.createElement("a");

    link.download =
      getQRCodeFileName(registration);

    link.href =
      canvasRef.current.toDataURL(
        "image/png"
      );

    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR code */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700">
        <canvas
          ref={canvasRef}
          aria-label="Event registration QR code"
        />

        {!qrReady && (
          <div className="flex h-[260px] w-[260px] flex-col items-center justify-center">
            <QrCode
              size={42}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              Generating QR code...
            </p>
          </div>
        )}
      </div>

      {/* Registration information */}
      {summary && (
        <div className="mt-6 w-full rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <User
              size={17}
              className="text-slate-500 dark:text-slate-400"
            />

            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              Registration Details
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Registration ID"
              value={
                summary.registrationId
              }
            />

            <InfoItem
              label="Event ID"
              value={summary.eventId}
            />

            <InfoItem
              label="Participant"
              value={
                summary.participantName
              }
            />

            <InfoItem
              label="Status"
              value={summary.status}
            />
          </div>
        </div>
      )}

      {/* Download */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!qrReady}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <Download size={17} />
        Download QR Code
      </button>

      <p className="mt-3 max-w-md text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        Keep this QR code available during event
        check-in. It contains your registration
        information for verification.
      </p>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-all text-sm font-medium text-slate-700 dark:text-slate-200">
      {value || "Not available"}
    </p>
  </div>
);

export default QRCodeDisplay;