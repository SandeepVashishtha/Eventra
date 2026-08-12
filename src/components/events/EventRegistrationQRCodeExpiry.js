import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  QrCode,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_REGISTRATIONS = [
  {
    id: "REG-1001",
    participantName: "Aarav Sharma",
    email: "aarav@example.com",
    registrationStatus: "approved",
    eventStatus: "upcoming",
    identityVerified: true,
    checkInEligible: true,
    qrIssuedAt: "2026-08-01T09:00:00",
    qrExpiresAt: "2026-08-30T23:59:59",
    checkedIn: false,
  },
  {
    id: "REG-1002",
    participantName: "Priya Patel",
    email: "priya@example.com",
    registrationStatus: "cancelled",
    eventStatus: "upcoming",
    identityVerified: true,
    checkInEligible: false,
    qrIssuedAt: "2026-08-01T09:00:00",
    qrExpiresAt: "2026-08-30T23:59:59",
    checkedIn: false,
  },
  {
    id: "REG-1003",
    participantName: "Rahul Joshi",
    email: "rahul@example.com",
    registrationStatus: "approved",
    eventStatus: "completed",
    identityVerified: true,
    checkInEligible: false,
    qrIssuedAt: "2026-08-01T09:00:00",
    qrExpiresAt: "2026-08-30T23:59:59",
    checkedIn: false,
  },
  {
    id: "REG-1004",
    participantName: "Neha Shah",
    email: "neha@example.com",
    registrationStatus: "approved",
    eventStatus: "ongoing",
    identityVerified: false,
    checkInEligible: false,
    qrIssuedAt: "2026-08-01T09:00:00",
    qrExpiresAt: "2026-08-30T23:59:59",
    checkedIn: false,
  },
];

const DEFAULT_CONFIG = {
  qrValidityHours: 720,
  allowUpcomingEvents: true,
  allowOngoingEvents: true,
  requireIdentityVerification: true,
  preventDuplicateCheckIn: true,
};

const EventRegistrationQRCodeExpiry = ({
  eventId = "event-14292",
  eventTitle = "AI & ML Hackathon",
  registrations = DEFAULT_REGISTRATIONS,
  config = DEFAULT_CONFIG,
  onValidation,
  onCheckIn,
  className = "",
}) => {
  const [registrationData, setRegistrationData] =
    useState(registrations);

  const [registrationId, setRegistrationId] =
    useState("");

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [validationResult, setValidationResult] =
    useState(null);

  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [notice, setNotice] = useState("");

  const validateRegistration = (registration) => {
    if (!registration) {
      return {
        valid: false,
        reason: "Registration not found.",
        code: "REGISTRATION_NOT_FOUND",
      };
    }

    if (registration.registrationStatus !== "approved") {
      return {
        valid: false,
        reason: "Registration is no longer valid.",
        code: "REGISTRATION_INVALID",
      };
    }

    const eventIsValid =
      (registration.eventStatus === "upcoming" &&
        config.allowUpcomingEvents) ||
      (registration.eventStatus === "ongoing" &&
        config.allowOngoingEvents);

    if (!eventIsValid) {
      return {
        valid: false,
        reason: "Event is no longer accepting check-ins.",
        code: "EVENT_INVALID",
      };
    }

    if (
      config.requireIdentityVerification &&
      !registration.identityVerified
    ) {
      return {
        valid: false,
        reason: "Participant identity could not be verified.",
        code: "IDENTITY_NOT_VERIFIED",
      };
    }

    if (!registration.checkInEligible) {
      return {
        valid: false,
        reason: "Participant is not eligible for check-in.",
        code: "CHECK_IN_NOT_ELIGIBLE",
      };
    }

    if (
      config.preventDuplicateCheckIn &&
      registration.checkedIn
    ) {
      return {
        valid: false,
        reason: "This registration has already been checked in.",
        code: "DUPLICATE_CHECK_IN",
      };
    }

    const now = Date.now();

    const issuedAt = new Date(
      registration.qrIssuedAt
    ).getTime();

    const expiresAt = new Date(
      registration.qrExpiresAt
    ).getTime();

    if (
      Number.isNaN(issuedAt) ||
      Number.isNaN(expiresAt)
    ) {
      return {
        valid: false,
        reason: "QR code expiration data is invalid.",
        code: "INVALID_QR_DATES",
      };
    }

    if (now < issuedAt) {
      return {
        valid: false,
        reason: "This QR code is not active yet.",
        code: "QR_NOT_ACTIVE",
      };
    }

    if (now > expiresAt) {
      return {
        valid: false,
        reason: "Registration is no longer valid.",
        code: "QR_EXPIRED",
      };
    }

    return {
      valid: true,
      reason: "Registration QR code is valid.",
      code: "VALID",
    };
  };

  const performValidation = async (id) => {
    const normalizedId = id.trim().toUpperCase();

    if (!normalizedId) {
      setValidationResult({
        valid: false,
        reason: "Enter a registration ID.",
        code: "EMPTY_REGISTRATION",
      });

      return;
    }

    const registration =
      registrationData.find(
        (item) =>
          item.id.toUpperCase() === normalizedId
      );

    const result =
      validateRegistration(registration);

    setSelectedRegistration(
      registration || null
    );

    setValidationResult(result);

    await onValidation?.({
      eventId,
      registrationId: normalizedId,
      registration,
      validation: result,
    });

    if (result.valid) {
      setNotice(
        `${registration.participantName}'s registration is valid.`
      );
    } else {
      setNotice(result.reason);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await performValidation(
      registrationId
    );
  };

  const handleCheckIn = async () => {
    if (!selectedRegistration) {
      return;
    }

    const latestRegistration =
      registrationData.find(
        (item) =>
          item.id === selectedRegistration.id
      );

    const result =
      validateRegistration(
        latestRegistration
      );

    setValidationResult(result);

    if (!result.valid) {
      setNotice(result.reason);
      return;
    }

    const checkedInAt =
      new Date().toISOString();

    const updatedRegistration = {
      ...latestRegistration,
      checkedIn: true,
      checkedInAt,
    };

    setRegistrationData(
      (current) =>
        current.map((item) =>
          item.id === latestRegistration.id
            ? updatedRegistration
            : item
        )
    );

    setSelectedRegistration(
      updatedRegistration
    );

    setValidationResult({
      valid: true,
      reason: "Check-in completed successfully.",
      code: "CHECK_IN_SUCCESS",
    });

    setNotice(
      `${latestRegistration.participantName} checked in successfully.`
    );

    await onCheckIn?.({
      eventId,
      eventTitle,
      registration: updatedRegistration,
      checkedInAt,
    });
  };

  const regenerateQRCode = (id) => {
    const issuedAt = new Date();
    const expiresAt = new Date(
      issuedAt.getTime() +
        config.qrValidityHours * 60 * 60 * 1000
    );

    setRegistrationData(
      (current) =>
        current.map((registration) =>
          registration.id === id
            ? {
                ...registration,
                qrIssuedAt:
                  issuedAt.toISOString(),
                qrExpiresAt:
                  expiresAt.toISOString(),
              }
            : registration
        )
    );

    setNotice(
      `A new QR validity period was generated for ${id}.`
    );

    setValidationResult(null);
  };

  const filteredRegistrations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return registrationData.filter(
        (registration) => {
          const matchesSearch =
            !query ||
            registration.id
              .toLowerCase()
              .includes(query) ||
            registration.participantName
              .toLowerCase()
              .includes(query) ||
            registration.email
              .toLowerCase()
              .includes(query);

          const validation =
            validateRegistration(
              registration
            );

          const matchesFilter =
            filter === "All" ||
            (filter === "Valid" &&
              validation.valid) ||
            (filter === "Invalid" &&
              !validation.valid) ||
            (filter === "Expired" &&
              validation.code ===
                "QR_EXPIRED");

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      registrationData,
      search,
      filter,
      config,
    ]);

  const validCount =
    registrationData.filter(
      (registration) =>
        validateRegistration(
          registration
        ).valid
    ).length;

  const invalidCount =
    registrationData.length -
    validCount;

  const expiredCount =
    registrationData.filter(
      (registration) =>
        validateRegistration(
          registration
        ).code === "QR_EXPIRED"
    ).length;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <QrCode
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Security
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              QR Code Expiry & Validation
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Validate registration status, event status,
              participant identity, QR expiration, and
              check-in eligibility before allowing entry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <ShieldCheck
            size={15}
            className="text-green-600 dark:text-green-400"
          />

          <span className="text-[8px] font-bold text-green-700 dark:text-green-400">
            Secure QR Validation
          </span>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <AlertCircle
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<QrCode size={15} />}
          label="Registrations"
          value={registrationData.length}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Valid"
          value={validCount}
        />

        <SummaryCard
          icon={<XCircle size={15} />}
          label="Invalid"
          value={invalidCount}
        />

        <SummaryCard
          icon={<Clock3 size={15} />}
          label="Expired"
          value={expiredCount}
        />
      </div>

      {/* Validation form */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <QrCode
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Validate Registration QR
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Enter the registration ID returned by the QR scanner.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={registrationId}
            onChange={(event) =>
              setRegistrationId(
                event.target.value
              )
            }
            placeholder="Example: REG-1001"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[9px] font-bold text-white hover:bg-indigo-700"
          >
            <ShieldCheck size={13} />
            Validate QR
          </button>
        </form>
      </div>

      {/* Validation result */}
      {selectedRegistration &&
        validationResult && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              validationResult.valid
                ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
                : "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
            }`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    validationResult.valid
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {validationResult.valid ? (
                    <CheckCircle2
                      size={20}
                    />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-bold ${
                      validationResult.valid
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {validationResult.valid
                      ? "Registration is valid"
                      : "Registration is no longer valid."}
                  </p>

                  <p
                    className={`mt-1 text-[8px] ${
                      validationResult.valid
                        ? "text-green-600 dark:text-green-300"
                        : "text-red-600 dark:text-red-300"
                    }`}
                  >
                    {validationResult.reason}
                  </p>
                </div>
              </div>

              {validationResult.valid &&
                !selectedRegistration.checkedIn && (
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-[9px] font-bold text-white hover:bg-green-700"
                  >
                    <UserCheck
                      size={13}
                    />
                    Allow Check-in
                  </button>
                )}

              {validationResult.code ===
                "DUPLICATE_CHECK_IN" && (
                <span className="rounded-xl bg-amber-100 px-4 py-3 text-[8px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Already Checked In
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ValidationItem
                label="Registration Status"
                value={
                  selectedRegistration.registrationStatus
                }
                valid={
                  selectedRegistration.registrationStatus ===
                  "approved"
                }
              />

              <ValidationItem
                label="Event Status"
                value={
                  selectedRegistration.eventStatus
                }
                valid={
                  selectedRegistration.eventStatus ===
                    "upcoming" ||
                  selectedRegistration.eventStatus ===
                    "ongoing"
                }
              />

              <ValidationItem
                label="Identity"
                value={
                  selectedRegistration.identityVerified
                    ? "Verified"
                    : "Not Verified"
                }
                valid={
                  selectedRegistration.identityVerified
                }
              />

              <ValidationItem
                label="Check-in"
                value={
                  selectedRegistration.checkedIn
                    ? "Already Used"
                    : "Available"
                }
                valid={
                  !selectedRegistration.checkedIn
                }
              />
            </div>
          </div>
        )}

      {/* QR information */}
      {selectedRegistration && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                QR Validity
              </p>

              <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                {selectedRegistration.id}
              </h3>

              <p className="mt-1 text-[8px] text-slate-400">
                Issued:{" "}
                {formatDate(
                  selectedRegistration.qrIssuedAt
                )}
              </p>

              <p className="mt-1 text-[8px] text-slate-400">
                Expires:{" "}
                {formatDate(
                  selectedRegistration.qrExpiresAt
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                regenerateQRCode(
                  selectedRegistration.id
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <RefreshCw size={12} />
              Refresh QR Validity
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search registration or participant..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <div className="flex flex-wrap gap-2">
          {[
            "All",
            "Valid",
            "Invalid",
            "Expired",
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setFilter(option)
              }
              className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold ${
                filter === option
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Registration table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <TableHeader>
                Participant
              </TableHeader>

              <TableHeader>
                Registration
              </TableHeader>

              <TableHeader>
                Event
              </TableHeader>

              <TableHeader>
                QR Expiry
              </TableHeader>

              <TableHeader>
                Validation
              </TableHeader>

              <TableHeader>
                Action
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {filteredRegistrations.map(
              (registration) => {
                const result =
                  validateRegistration(
                    registration
                  );

                return (
                  <tr
                    key={
                      registration.id
                    }
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRegistration(
                            registration
                          );

                          setValidationResult(
                            result
                          );
                        }}
                        className="text-left"
                      >
                        <p className="text-[9px] font-bold text-slate-700 hover:text-indigo-600 dark:text-slate-200">
                          {
                            registration.participantName
                          }
                        </p>

                        <p className="mt-1 text-[7px] text-slate-400">
                          {
                            registration.email
                          }
                        </p>
                      </button>
                    </td>

                    <td className="px-3 py-4 text-[8px] font-semibold text-slate-500">
                      {registration.id}
                    </td>

                    <td className="px-3 py-4">
                      <span className="text-[8px] text-slate-500">
                        {
                          registration.eventStatus
                        }
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`text-[8px] font-bold ${
                          result.code ===
                          "QR_EXPIRED"
                            ? "text-red-500"
                            : "text-slate-500"
                        }`}
                      >
                        {formatDate(
                          registration.qrExpiresAt
                        )}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <ValidationBadge
                        valid={
                          result.valid
                        }
                        code={
                          result.code
                        }
                      />
                    </td>

                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRegistration(
                            registration
                          );

                          setRegistrationId(
                            registration.id
                          );

                          setValidationResult(
                            result
                          );

                          setNotice(
                            result.reason
                          );
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-[8px] font-bold text-white hover:bg-indigo-700"
                      >
                        Validate
                      </button>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {filteredRegistrations.length ===
          0 && (
          <div className="py-10 text-center">
            <QrCode
              size={22}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-2 text-[9px] text-slate-400">
              No registrations found.
            </p>
          </div>
        )}
      </div>

      {/* Validation rules */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            QR Validation Rules
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RuleCard
            label="Registration Status"
            description="Registration must be approved."
          />

          <RuleCard
            label="Event Status"
            description="Event must allow participant check-in."
          />

          <RuleCard
            label="Participant Identity"
            description="Participant identity must be verified."
          />

          <RuleCard
            label="Check-in Eligibility"
            description="Registration must not already be used."
          />
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const ValidationItem = ({
  label,
  value,
  valid,
}) => (
  <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-950/50">
    <div className="flex items-center gap-2">
      {valid ? (
        <CheckCircle2
          size={12}
          className="text-green-500"
        />
      ) : (
        <XCircle
          size={12}
          className="text-red-500"
        />
      )}

      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>

    <p className="mt-2 text-[9px] font-bold capitalize text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

const ValidationBadge = ({
  valid,
  code,
}) => {
  const labels = {
    VALID: "Valid",
    QR_EXPIRED: "Expired",
    REGISTRATION_INVALID: "Invalid Registration",
    EVENT_INVALID: "Invalid Event",
    IDENTITY_NOT_VERIFIED:
      "Identity Not Verified",
    CHECK_IN_NOT_ELIGIBLE:
      "Not Eligible",
    DUPLICATE_CHECK_IN:
      "Already Checked In",
    REGISTRATION_NOT_FOUND:
      "Not Found",
    INVALID_QR_DATES:
      "Invalid QR",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-bold ${
        valid
          ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {valid ? (
        <CheckCircle2 size={9} />
      ) : (
        <XCircle size={9} />
      )}

      {labels[code] || "Invalid"}
    </span>
  );
};

const RuleCard = ({
  label,
  description,
}) => (
  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
      {label}
    </p>

    <p className="mt-1 text-[8px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

const TableHeader = ({
  children,
}) => (
  <th className="px-3 py-3 text-left text-[7px] font-bold uppercase tracking-wide text-slate-400">
    {children}
  </th>
);

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString(
    [],
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

export default EventRegistrationQRCodeExpiry;