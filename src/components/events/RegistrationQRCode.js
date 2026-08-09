import { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle,
  QrCode,
} from "lucide-react";
import QRCodeDisplay from "./QRCodeDisplay";
import {
  buildQRCodePayload,
  canGenerateQRCode,
  serializeQRCodePayload,
  validateQRCodePayload,
} from "../../utils/registrationQRCodeUtils";

const RegistrationQRCode = ({
  registration,
  onQRCodeGenerated,
}) => {
  const qrData = useMemo(() => {
    if (!registration) {
      return {
        payload: null,
        data: "",
        valid: false,
        errors: ["Registration information is unavailable."],
      };
    }

    if (!canGenerateQRCode(registration)) {
      return {
        payload: null,
        data: "",
        valid: false,
        errors: [
          "A QR code cannot be generated for this registration.",
        ],
      };
    }

    const payload =
      buildQRCodePayload(registration);

    const validation =
      validateQRCodePayload(payload);

    if (!validation.valid) {
      return {
        payload,
        data: "",
        valid: false,
        errors: validation.errors,
      };
    }

    return {
      payload,
      data: serializeQRCodePayload(payload),
      valid: true,
      errors: [],
    };
  }, [registration]);

  if (!registration) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <AlertCircle
            size={22}
            className="text-red-600 dark:text-red-400"
          />

          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Registration information is unavailable.
          </p>
        </div>
      </div>
    );
  }

  const handleQRCodeGenerated = () => {
    if (!qrData.valid) {
      return;
    }

    onQRCodeGenerated?.(
      qrData.payload
    );
  };

  return (
    <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <QrCode
            size={24}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Registration QR Code
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use this QR code for quick event check-in
            and registration verification.
          </p>
        </div>
      </div>

      {/* Validation error */}
      {!qrData.valid ? (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                QR code unavailable
              </h3>

              <ul className="mt-2 space-y-1">
                {qrData.errors.map(
                  (error, index) => (
                    <li
                      key={`${error}-${index}`}
                      className="text-sm text-red-700 dark:text-red-400"
                    >
                      {error}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Success status */}
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
            <CheckCircle
              size={18}
              className="text-green-600 dark:text-green-400"
            />

            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Registration QR code is ready.
            </p>
          </div>

          {/* QR code */}
          <div className="mt-6">
            <QRCodeDisplay
              value={qrData.data}
              registration={registration}
              onGenerated={
                handleQRCodeGenerated
              }
            />
          </div>
        </>
      )}
    </section>
  );
};

export default RegistrationQRCode;