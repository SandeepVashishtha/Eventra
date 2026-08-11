import {
  Camera,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "REG-1001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 9876543210",
    event: "AI & ML Hackathon",
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: "REG-1002",
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "+91 9876543211",
    event: "AI & ML Hackathon",
    checkedIn: true,
    checkedInAt: "09:42 AM",
  },
  {
    id: "REG-1003",
    name: "Rahul Joshi",
    email: "rahul@example.com",
    phone: "+91 9876543212",
    event: "AI & ML Hackathon",
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: "REG-1004",
    name: "Neha Shah",
    email: "neha@example.com",
    phone: "+91 9876543213",
    event: "AI & ML Hackathon",
    checkedIn: false,
    checkedInAt: null,
  },
];

const EventRegistrationQRScanner = ({
  eventId = "event-14262",
  eventTitle = "AI & ML Hackathon",
  participants = DEFAULT_PARTICIPANTS,
  onCheckIn,
  onDuplicateCheckIn,
  onInvalidRegistration,
  className = "",
}) => {
  const [participantData, setParticipantData] =
    useState(participants);

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [manualId, setManualId] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedParticipant, setSelectedParticipant] =
    useState(null);

  const [message, setMessage] =
    useState(null);

  const [cameraError, setCameraError] =
    useState("");

  const [cameraReady, setCameraReady] =
    useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const totalParticipants =
    participantData.length;

  const checkedInCount =
    participantData.filter(
      (participant) =>
        participant.checkedIn
    ).length;

  const remainingCount =
    totalParticipants -
    checkedInCount;

  const checkInPercentage =
    totalParticipants === 0
      ? 0
      : Math.round(
          (checkedInCount /
            totalParticipants) *
            100
        );

  const showMessage = (
    type,
    text
  ) => {
    setMessage({
      type,
      text,
    });

    window.setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const findParticipant = (
    registrationId
  ) => {
    const normalized =
      registrationId
        .trim()
        .toUpperCase();

    return participantData.find(
      (participant) =>
        participant.id.toUpperCase() ===
        normalized
    );
  };

  const processCheckIn = async (
    registrationId,
    source = "QR Scanner"
  ) => {
    const participant =
      findParticipant(
        registrationId
      );

    if (!participant) {
      showMessage(
        "error",
        "Registration ID not found. Please scan a valid Eventra registration QR code."
      );

      await onInvalidRegistration?.({
        eventId,
        registrationId,
        source,
      });

      return {
        success: false,
        reason: "invalid",
      };
    }

    if (participant.checkedIn) {
      setSelectedParticipant(
        participant
      );

      showMessage(
        "warning",
        `${participant.name} has already checked in.`
      );

      await onDuplicateCheckIn?.({
        eventId,
        participant,
        source,
      });

      return {
        success: false,
        reason: "duplicate",
        participant,
      };
    }

    const checkedInAt =
      new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    const updatedParticipant = {
      ...participant,
      checkedIn: true,
      checkedInAt,
    };

    setParticipantData(
      (current) =>
        current.map((item) =>
          item.id === participant.id
            ? updatedParticipant
            : item
        )
    );

    setSelectedParticipant(
      updatedParticipant
    );

    showMessage(
      "success",
      `${participant.name} checked in successfully.`
    );

    await onCheckIn?.({
      eventId,
      eventTitle,
      participant:
        updatedParticipant,
      registrationId:
        participant.id,
      checkedInAt,
      source,
    });

    return {
      success: true,
      participant:
        updatedParticipant,
    };
  };

  const handleManualCheckIn = async (
    event
  ) => {
    event.preventDefault();

    if (!manualId.trim()) {
      showMessage(
        "error",
        "Enter a registration ID."
      );
      return;
    }

    const result =
      await processCheckIn(
        manualId,
        "Manual Entry"
      );

    if (result.success) {
      setManualId("");
    }
  };

  const startCamera = async () => {
    setCameraError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
            audio: false,
          }
        );

      streamRef.current =
        stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();

        setCameraReady(true);
      }
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again."
      );

      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraReady(false);
  };

  const openScanner = async () => {
    setScannerOpen(true);

    await startCamera();
  };

  const closeScanner = () => {
    stopCamera();
    setScannerOpen(false);
  };

  const simulateScan = async (
    registrationId
  ) => {
    await processCheckIn(
      registrationId,
      "QR Scanner"
    );

    closeScanner();
  };

  const filteredParticipants =
    participantData.filter(
      (participant) => {
        const query =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !query ||
          participant.name
            .toLowerCase()
            .includes(query) ||
          participant.email
            .toLowerCase()
            .includes(query) ||
          participant.id
            .toLowerCase()
            .includes(query);

        const matchesFilter =
          statusFilter ===
            "All" ||
          (statusFilter ===
            "Checked In" &&
            participant.checkedIn) ||
          (statusFilter ===
            "Not Checked In" &&
            !participant.checkedIn);

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Camera
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Check-in
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Registration QR Scanner
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quickly verify registrations and check participants into{" "}
              {eventTitle}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            scannerOpen
              ? closeScanner
              : openScanner
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[9px] font-bold text-white hover:bg-indigo-700"
        >
          <Camera size={14} />

          {scannerOpen
            ? "Close Scanner"
            : "Open QR Scanner"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
            message.type ===
            "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400"
              : message.type ===
                "warning"
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
          }`}
        >
          {message.type ===
          "success" ? (
            <CheckCircle2
              size={15}
            />
          ) : message.type ===
            "warning" ? (
            <Clock3 size={15} />
          ) : (
            <UserX size={15} />
          )}

          <p className="flex-1 text-[9px] font-semibold">
            {message.text}
          </p>

          <button
            type="button"
            onClick={() =>
              setMessage(null)
            }
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<UsersIcon />}
          label="Registered"
          value={
            totalParticipants
          }
        />

        <SummaryCard
          icon={<UserCheck size={15} />}
          label="Checked In"
          value={
            checkedInCount
          }
        />

        <SummaryCard
          icon={<Clock3 size={15} />}
          label="Remaining"
          value={
            remainingCount
          }
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Check-in Rate"
          value={`${checkInPercentage}%`}
        />
      </div>

      {/* Progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Event Check-in Progress
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              {checkedInCount} of{" "}
              {totalParticipants}{" "}
              participants checked in
            </p>
          </div>

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {checkInPercentage}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${checkInPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Scanner */}
      {scannerOpen && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Scan Registration QR
              </h3>

              <p className="mt-1 text-[8px] text-slate-400">
                Point the camera at the participant's Eventra QR code.
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeScanner
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={15} />
            </button>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-2xl bg-slate-950">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />

            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Camera
                  size={30}
                  className="text-slate-500"
                />

                <p className="mt-3 text-[9px] font-bold text-white">
                  Camera not ready
                </p>

                <p className="mt-1 max-w-xs text-[8px] text-slate-400">
                  {cameraError ||
                    "Waiting for camera permission..."}
                </p>

                <button
                  type="button"
                  onClick={
                    startCamera
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[8px] font-bold text-slate-800"
                >
                  <RefreshCw
                    size={12}
                  />
                  Retry Camera
                </button>
              </div>
            )}

            {cameraReady && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-2xl border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            )}
          </div>

          {/* Demo scan controls */}
          <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <p className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
              Test QR Scan
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Use a registration ID below to simulate a QR result while connecting a real QR decoder.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {participantData.map(
                (participant) => (
                  <button
                    key={
                      participant.id
                    }
                    type="button"
                    onClick={() =>
                      simulateScan(
                        participant.id
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[7px] font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {participant.id}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual check-in */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Search
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            Manual Registration Verification
          </h3>
        </div>

        <form
          onSubmit={
            handleManualCheckIn
          }
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={manualId}
            onChange={(event) =>
              setManualId(
                event.target.value
              )
            }
            placeholder="Enter registration ID, e.g. REG-1001"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-[9px] font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Verify & Check In
          </button>
        </form>
      </div>

      {/* Search and filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search participant or registration ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          {[
            "All",
            "Checked In",
            "Not Checked In",
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setStatusFilter(
                  option
                )
              }
              className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold ${
                statusFilter ===
                option
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Participant table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <TableHeader>
                Participant
              </TableHeader>

              <TableHeader>
                Registration ID
              </TableHeader>

              <TableHeader>
                Event
              </TableHeader>

              <TableHeader>
                Status
              </TableHeader>

              <TableHeader>
                Check-in Time
              </TableHeader>

              <TableHeader>
                Action
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {filteredParticipants.map(
              (participant) => (
                <tr
                  key={
                    participant.id
                  }
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {getInitials(
                          participant.name
                        )}
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                          {
                            participant.name
                          }
                        </p>

                        <p className="mt-1 text-[7px] text-slate-400">
                          {
                            participant.email
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4 text-[8px] font-semibold text-slate-500">
                    {participant.id}
                  </td>

                  <td className="px-3 py-4 text-[8px] text-slate-500">
                    {participant.event}
                  </td>

                  <td className="px-3 py-4">
                    <StatusBadge
                      checkedIn={
                        participant.checkedIn
                      }
                    />
                  </td>

                  <td className="px-3 py-4 text-[8px] text-slate-500">
                    {participant.checkedInAt ||
                      "—"}
                  </td>

                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParticipant(
                          participant
                        );

                        if (
                          !participant.checkedIn
                        ) {
                          processCheckIn(
                            participant.id,
                            "Manual Table Action"
                          );
                        } else {
                          showMessage(
                            "warning",
                            `${participant.name} has already checked in.`
                          );
                        }
                      }}
                      className={`rounded-lg px-3 py-2 text-[8px] font-bold ${
                        participant.checkedIn
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {participant.checkedIn
                        ? "Already Checked In"
                        : "Check In"}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {filteredParticipants.length ===
          0 && (
          <div className="py-10 text-center">
            <Search
              size={22}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-2 text-[9px] text-slate-400">
              No participants found.
            </p>
          </div>
        )}
      </div>

      {/* Participant verification result */}
      {selectedParticipant && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {getInitials(
                  selectedParticipant.name
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {
                    selectedParticipant.name
                  }
                </p>

                <p className="mt-1 text-[8px] text-slate-400">
                  Registration:{" "}
                  {
                    selectedParticipant.id
                  }
                </p>

                <p className="mt-1 text-[8px] text-slate-400">
                  {
                    selectedParticipant.email
                  }
                </p>
              </div>
            </div>

            <StatusBadge
              checkedIn={
                selectedParticipant.checkedIn
              }
            />
          </div>
        </div>
      )}
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

const StatusBadge = ({
  checkedIn,
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-bold ${
      checkedIn
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    }`}
  >
    {checkedIn ? (
      <CheckCircle2 size={9} />
    ) : (
      <Clock3 size={9} />
    )}

    {checkedIn
      ? "Checked In"
      : "Not Checked In"}
  </span>
);

const TableHeader = ({
  children,
}) => (
  <th className="px-3 py-3 text-left text-[7px] font-bold uppercase tracking-wide text-slate-400">
    {children}
  </th>
);

const UsersIcon = () => (
  <Users
    size={15}
  />
);

const getInitials = (
  name = ""
) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ||
        ""
    )
    .join("");

export default EventRegistrationQRScanner;