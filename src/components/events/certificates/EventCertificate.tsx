import React, { useMemo } from "react";

interface CertificateData {
  participantName: string;
  eventName: string;
  eventDate: string;
  organizerName: string;
  certificateId: string;
}

interface EventCertificateProps {
  certificate?: CertificateData;
  isParticipant?: boolean;
  isEventCompleted?: boolean;
  onClose?: () => void;
}

const EventCertificate: React.FC<EventCertificateProps> = ({
  certificate,
  isParticipant = false,
  isEventCompleted = false,
  onClose,
}) => {
  /*
   * Generate a unique certificate ID if one is not supplied.
   */
  const certificateId = useMemo(() => {
    if (certificate?.certificateId) {
      return certificate.certificateId;
    }

    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `EVT-${Date.now()}-${randomPart}`;
  }, [certificate?.certificateId]);

  /*
   * Check whether the user is eligible.
   */
  const isEligible =
    isParticipant && isEventCompleted && Boolean(certificate);

  /*
   * Download the certificate as an HTML file.
   *
   * This keeps the feature self-contained and does not require
   * an additional package.
   */
  const downloadCertificate = () => {
    if (!isEligible || !certificate) {
      return;
    }

    const certificateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Event Certificate</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f5f5;
          }

          .certificate {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 70px;
            background: white;
            border: 12px solid #1d4ed8;
            text-align: center;
            position: relative;
          }

          .inner-border {
            border: 2px solid #bfdbfe;
            padding: 60px;
          }

          .title {
            font-size: 48px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 15px;
            letter-spacing: 3px;
          }

          .subtitle {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 45px;
          }

          .participant {
            font-size: 40px;
            font-weight: bold;
            color: #111827;
            margin: 25px 0;
          }

          .text {
            font-size: 18px;
            color: #475569;
            line-height: 1.7;
          }

          .event {
            font-size: 28px;
            font-weight: bold;
            color: #1d4ed8;
            margin: 20px 0;
          }

          .details {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            text-align: center;
          }

          .detail {
            width: 30%;
          }

          .detail-title {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
          }

          .detail-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }

          .certificate-id {
            margin-top: 45px;
            font-size: 13px;
            color: #64748b;
          }

          .footer {
            margin-top: 45px;
            font-size: 14px;
            color: #94a3b8;
          }

          @media print {
            body {
              padding: 0;
              background: white;
            }

            .certificate {
              max-width: none;
              border-width: 10px;
            }
          }
        </style>
      </head>

      <body>
        <div class="certificate">
          <div class="inner-border">

            <div class="title">
              CERTIFICATE
            </div>

            <div class="subtitle">
              OF PARTICIPATION
            </div>

            <div class="text">
              This certificate is proudly presented to
            </div>

            <div class="participant">
              ${certificate.participantName}
            </div>

            <div class="text">
              for successfully participating in
            </div>

            <div class="event">
              ${certificate.eventName}
            </div>

            <div class="text">
              organized by ${certificate.organizerName}
              on ${certificate.eventDate}.
            </div>

            <div class="details">

              <div class="detail">
                <div class="detail-title">
                  Event Date
                </div>

                <div class="detail-value">
                  ${certificate.eventDate}
                </div>
              </div>

              <div class="detail">
                <div class="detail-title">
                  Organizer
                </div>

                <div class="detail-value">
                  ${certificate.organizerName}
                </div>
              </div>

              <div class="detail">
                <div class="detail-title">
                  Certificate ID
                </div>

                <div class="detail-value">
                  ${certificateId}
                </div>
              </div>

            </div>

            <div class="certificate-id">
              Certificate ID: ${certificateId}
            </div>

            <div class="footer">
              This certificate verifies participation in the Eventra event.
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHtml], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${certificate.eventName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_certificate.html`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * Print / save certificate as PDF.
   */
  const printCertificate = () => {
    if (!isEligible || !certificate) {
      return;
    }

    window.print();
  };

  /*
   * User is not a participant.
   */
  if (!isParticipant) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          🔒
        </div>

        <h2 className="text-xl font-bold text-red-800">
          Certificate Unavailable
        </h2>

        <p className="mt-2 text-sm text-red-600">
          This certificate is only available to participants
          who attended the event.
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  /*
   * Event has not been completed.
   */
  if (!isEventCompleted) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-2xl">
          ⏳
        </div>

        <h2 className="text-xl font-bold text-yellow-800">
          Certificate Not Available Yet
        </h2>

        <p className="mt-2 text-sm text-yellow-700">
          Your certificate will become available after the
          event has been completed.
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg border border-yellow-300 bg-white px-5 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  /*
   * Event is completed but certificate information is missing.
   */
  if (!certificate) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-2xl">
          📄
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          Certificate Information Unavailable
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          We could not generate the certificate information at
          this time. Please try again later.
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  /*
   * Certificate preview.
   */
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Certificate
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your participation certificate is ready.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={printCertificate}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            🖨️ Print / Save PDF
          </button>

          <button
            type="button"
            onClick={downloadCertificate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            ⬇ Download Certificate
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Certificate */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-4 shadow-sm sm:p-8">
        <div className="mx-auto max-w-5xl bg-white p-2 shadow-xl sm:p-4">
          <div className="border-[8px] border-blue-700 p-2 sm:border-[12px]">
            <div className="border-2 border-blue-200 px-5 py-12 text-center sm:px-12 sm:py-16">
              {/* Certificate heading */}
              <div className="text-sm font-semibold tracking-[0.35em] text-blue-700 sm:text-base">
                EVENTRA
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-wide text-blue-900 sm:text-5xl">
                CERTIFICATE
              </h2>

              <p className="mt-3 text-sm font-medium tracking-[0.25em] text-gray-500 sm:text-lg">
                OF PARTICIPATION
              </p>

              {/* Divider */}
              <div className="mx-auto my-8 h-px w-24 bg-blue-300" />

              <p className="text-sm text-gray-500 sm:text-base">
                This certificate is proudly presented to
              </p>

              {/* Participant */}
              <h3 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
                {certificate.participantName}
              </h3>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                for successfully participating in the event
              </p>

              {/* Event */}
              <h4 className="mt-4 text-2xl font-bold text-blue-700 sm:text-3xl">
                {certificate.eventName}
              </h4>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                organized by{" "}
                <strong>{certificate.organizerName}</strong>{" "}
                on <strong>{certificate.eventDate}</strong>.
              </p>

              {/* Details */}
              <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 border-t border-gray-200 pt-8 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Event Date
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {certificate.eventDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Organizer
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {certificate.organizerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Certificate ID
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-gray-800">
                    {certificateId}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 border-t border-gray-200 pt-6">
                <p className="text-xs text-gray-400">
                  This certificate verifies participation in an
                  Eventra event.
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Certificate ID: {certificateId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Certificate Information
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-400">
              Participant
            </p>

            <p className="mt-1 font-medium text-gray-800">
              {certificate.participantName}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-400">
              Event
            </p>

            <p className="mt-1 font-medium text-gray-800">
              {certificate.eventName}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-400">
              Event Date
            </p>

            <p className="mt-1 font-medium text-gray-800">
              {certificate.eventDate}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-400">
              Organizer
            </p>

            <p className="mt-1 font-medium text-gray-800">
              {certificate.organizerName}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase text-gray-400">
              Certificate ID
            </p>

            <p className="mt-1 break-all font-medium text-gray-800">
              {certificateId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCertificate;