import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Keyboard,
  FileText,
  User,
  Calendar,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { pushToQueue } from "../../utils/offlineQueue";
import {
  validateTicket,
  recordCheckIn,
  fetchCheckInHistory,
  fetchScannerEvents,
  fetchTicketStats,
} from "../../services/ticketService";
import "./TicketScanner.css";
const HISTORY_CACHE_KEY = "eventra_checkins_cache";

export default function TicketScanner() {
  const [devices, setDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualTicketId, setManualTicketId] = useState("");
  const [manualAttendeeName, setManualAttendeeName] = useState("");
  const [manualEventId, setManualEventId] = useState("");
  const [manualEventName, setManualEventName] = useState("");

  const [selectedEventId, setSelectedEventId] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const qrCodeInstanceRef = useRef(null);
  const isMountedRef = useRef(true);
  const readerId = "html5-qr-reader";

  const fetchStats = useCallback(async (eventId) => {
    if (!eventId) return;
    setStatsLoading(true);
    try {
      const data = await fetchTicketStats(eventId);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch event check-in stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length > 0) {
          setDevices(cameras);
          const backCam = cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes("back") ||
              cam.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCam ? backCam.id : cameras[0].id);
        } else {
          setScannerStatus("error");
          toast.error("No camera devices found.");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        setScannerStatus("error");
      });

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  useEffect(() => {
    fetchScannerEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          setManualEventId(data[0].id);
          setManualEventName(data[0].title);
          setSelectedEventId(data[0].id);
        }
      })
      .catch(() => {
        setEvents([]);
      });
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchStats(selectedEventId);
      fetchCheckInHistory(selectedEventId)
        .then((data) => {
          const items = Array.isArray(data) ? data : data.content || data.checkins || [];
          setCheckinHistory(items);
        })
        .catch((err) => {
          console.error("Failed to load check-in history:", err);
          toast.error("Failed to load check-in history. The data shown may be stale.");
        });
    }
  }, [selectedEventId, fetchStats]);

  const stopScanner = async () => {
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        await qrCodeInstanceRef.current.stop();
        if (isMountedRef.current) setScannerStatus("stopped");
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const startScanner = async (cameraId) => {
    const targetId = cameraId || selectedCameraId;
    if (!targetId) {
      toast.error("Please select a camera device first.");
      return;
    }

    await stopScanner();
    setScanResult(null);
    setScannerStatus("starting");

    try {
      const qrCode = new Html5Qrcode(readerId);
      qrCodeInstanceRef.current = qrCode;

      await qrCode.start(
        targetId,
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.65;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );
      setScannerStatus("scanning");
    } catch (err) {
      console.error("Scanner failed to start:", err);
      setScannerStatus("error");
      toast.error("Could not access camera. Please verify permissions.");
    }
  };

  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (scannerStatus === "scanning") startScanner(newId);
  };

  const addToHistory = useCallback((entry) => {
    setCheckinHistory((prev) => [entry, ...prev].slice(0, 50));
    try {
      const updated = [entry, ...safeJsonParse(localStorage.getItem(HISTORY_CACHE_KEY), [])].slice(
        0,
        50
      );
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }, []);

  const handleScanSuccess = async (decodedText) => {
    await stopScanner();

    let ticketData = null;
    try {
      ticketData = JSON.parse(decodedText);
    } catch {
      if (decodedText.startsWith("eyJ") && decodedText.split(".").length === 3) {
        const activeEvent = events.find((e) => String(e.id) === String(selectedEventId));
        ticketData = {
          ticketId: decodedText,
          eventId: selectedEventId,
          userName: "Attendee",
          eventName: activeEvent ? activeEvent.title : "Active Event",
        };
      } else {
        setScanResult({
          status: "flagged",
          message: "Invalid QR Code format. Only secure Eventra ticket QR codes are accepted.",
          raw: decodedText,
        });
        toast.error("Security Alert: Invalid Ticket QR Code scanned!");
        addToHistory({
          id: `flagged-${Date.now()}`,
          ticketId: "N/A",
          name: "Unknown",
          event: "Unknown",
          status: "Flagged",
          time: new Date().toISOString(),
        });
        return;
      }
    }

    if (!ticketData || typeof ticketData !== "object" || !ticketData.ticketId) {
      setScanResult({
        status: "flagged",
        message: "Invalid QR Code format. Ticket is secure and cannot be verified.",
        raw: decodedText,
      });
      toast.error("Security Alert: Invalid Ticket QR Code scanned!");
      addToHistory({
        id: `flagged-${Date.now()}`,
        ticketId: decodedText.slice(0, 20),
        name: "Unknown",
        event: "Unknown",
        status: "Flagged",
        time: new Date().toISOString(),
      });
      return;
    }

    if (!ticketData.eventId) {
      ticketData.eventId = selectedEventId;
    }

    await processTicket(ticketData);
  };

  const processTicket = async (ticketData) => {
    const { ticketId, userName, eventId, eventName } = ticketData;

    if (!isOnline) {
      setScanResult({
        status: "verified",
        data: ticketData,
        message: "Check-in queued offline — will sync when connection resumes.",
      });
      toast.info(`Offline check-in queued for ${userName}.`);
      await pushToQueue({
        actionType: "TICKET_CHECK_IN",
        ticketId,
        eventId: eventId || "unknown",
        payload: ticketData,
      });
      addToHistory({
        id: `offline-${Date.now()}`,
        ticketId,
        name: userName,
        event: eventName,
        status: "Queued",
        time: new Date().toISOString(),
      });
      return;
    }

    try {
      const result = await validateTicket(ticketId, eventId);

      // On successful validation or duplicate check, update names/ids retrieved from backend
      if (result && result.valid) {
        ticketData.userName = result.userName || userName;
        ticketData.ticketId = result.registrationId || ticketId;
      }

      if (result.alreadyCheckedIn) {
        setScanResult({
          status: "duplicate",
          data: ticketData,
          message: "This ticket has already been checked in!",
        });
        toast.warning(`Duplicate Attempt: ${ticketData.userName} is already checked in.`);
        addToHistory({
          id: `dup-${Date.now()}`,
          ticketId: ticketData.ticketId,
          name: ticketData.userName,
          event: eventName,
          status: "Flagged",
          time: new Date().toISOString(),
        });
        if (selectedEventId) fetchStats(selectedEventId);
        return;
      }

      if (!result.valid) {
        setScanResult({
          status: "flagged",
          data: ticketData,
          message: result.message || "This ticket is not valid for entry.",
        });
        toast.error(`Invalid Ticket: ${ticketData.userName}`);
        addToHistory({
          id: `invalid-${Date.now()}`,
          ticketId: ticketData.ticketId,
          name: ticketData.userName,
          event: eventName,
          status: "Flagged",
          time: new Date().toISOString(),
        });
        return;
      }

      await recordCheckIn(ticketId, eventId, { validatedAt: new Date().toISOString() });

      setScanResult({
        status: "verified",
        data: ticketData,
        message: "Attendee check-in verified successfully!",
      });
      toast.success(`Check-In Verified: Welcome, ${ticketData.userName}!`);
      addToHistory({
        id: `verified-${Date.now()}`,
        ticketId: ticketData.ticketId,
        name: ticketData.userName,
        event: eventName,
        status: "Verified",
        time: new Date().toISOString(),
      });
      if (selectedEventId) fetchStats(selectedEventId);
    } catch (error) {
      setScanResult({
        status: "flagged",
        data: ticketData,
        message: error.message || "Ticket validation failed. Please try again.",
      });
      toast.error(`Validation Error: ${error.message}`);
      addToHistory({
        id: `error-${Date.now()}`,
        ticketId: ticketId,
        name: userName,
        event: eventName,
        status: "Flagged",
        time: new Date().toISOString(),
      });
    }
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim() || !manualAttendeeName.trim() || !manualEventId) {
      toast.error("Please fill in Ticket Code, Attendee Name, and select an Event.");
      return;
    }

    const manualData = {
      ticketId: manualTicketId.trim().toUpperCase(),
      userName: manualAttendeeName.trim(),
      eventId: manualEventId,
      eventName: manualEventName,
    };

    processTicket(manualData);
    setManualTicketId("");
    setManualAttendeeName("");
  };

  const handleResetScan = () => {
    setScanResult(null);
    startScanner(selectedCameraId);
  };

  const handleEventSelect = (e) => {
    const idx = e.target.selectedIndex;
    const option = e.target.options[idx];
    setManualEventId(option.value);
    setManualEventName(option.text);
  };

  return (
    <div className="ts-root rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
      {/* Network status banner */}
      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <WifiOff size={14} />
          You are offline. Check-ins will be queued and synced when connection resumes.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-slate-850 flex items-center gap-2 text-xl font-black tracking-tight dark:text-slate-100">
            <Camera className="h-5 w-5 animate-pulse text-indigo-500" />
            Active Door Pass Scanner
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Access device camera to scan dynamic attendee QR codes instantly or enter ticket codes
            manually.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi size={14} className="text-emerald-500" />
          ) : (
            <WifiOff size={14} className="text-amber-500" />
          )}
          <div className="flex self-start rounded-xl bg-slate-100 p-1 sm:self-auto dark:bg-slate-950">
            <button
              onClick={() => {
                setManualMode(false);
                setScanResult(null);
                startScanner(selectedCameraId);
              }}
              aria-pressed={!manualMode}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                !manualMode
                  ? "dark:bg-slate-850 bg-white text-indigo-600 shadow-sm dark:text-indigo-400"
                  : "dark:hover:text-slate-350 text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Camera Scanner
            </button>
            <button
              onClick={() => {
                setManualMode(true);
                stopScanner();
                setScanResult(null);
              }}
              aria-pressed={manualMode}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                manualMode
                  ? "dark:bg-slate-850 bg-white text-indigo-600 shadow-sm dark:text-indigo-400"
                  : "dark:hover:text-slate-350 text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Manual Code Entry
            </button>
          </div>
        </div>
      </div>

      {/* Event Selection and Statistics Dashboard */}
      <div className="border-slate-150 dark:border-slate-850/60 mb-6 rounded-2xl border bg-slate-50 p-5 dark:bg-slate-950/20">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md flex-1">
            <label
              htmlFor="active-event-select"
              className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500"
            >
              Select Active Event for Checking In
            </label>
            <select
              id="active-event-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="dark:text-slate-350 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            >
              {events.length === 0 ? (
                <option value="">No events available</option>
              ) : (
                events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))
              )}
            </select>
          </div>
          {selectedEventId && (
            <button
              onClick={() => fetchStats(selectedEventId)}
              disabled={statsLoading}
              className="text-slate-650 flex items-center gap-1.5 self-end rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold transition hover:bg-slate-100 disabled:opacity-50 md:self-auto dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              <RefreshCw size={12} className={statsLoading ? "animate-spin" : ""} />
              Refresh Stats
            </button>
          )}
        </div>

        {selectedEventId && stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border-slate-150 dark:border-slate-850 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <span className="block text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Total Registrations
                </span>
                <span className="mt-1 block text-xl font-black text-slate-800 dark:text-white">
                  {statsLoading ? "..." : stats.totalRegistrations}
                </span>
              </div>
              <div className="border-slate-150 dark:border-slate-850 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <span className="block text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Checked In
                </span>
                <span className="dark:text-emerald-450 mt-1 block text-xl font-black text-emerald-600">
                  {statsLoading ? "..." : stats.checkedInAttendees}
                </span>
              </div>
              <div className="border-slate-150 dark:border-slate-850 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <span className="block text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Remaining
                </span>
                <span className="mt-1 block text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {statsLoading ? "..." : stats.remainingAttendees}
                </span>
              </div>
              <div className="border-slate-150 dark:border-slate-850 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <span className="block text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                  Attendance Rate
                </span>
                <span className="mt-1 block text-xl font-black text-slate-800 dark:text-white">
                  {statsLoading ? "..." : `${stats.attendancePercentage}%`}
                </span>
              </div>
            </div>
            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Check-in Progress</span>
                <span>
                  {stats.checkedInAttendees} of {stats.totalRegistrations} Checked In
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${stats.attendancePercentage}%` }}
                />
              </div>
            </div>
          </div>
        ) : selectedEventId ? (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500">
            <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin opacity-50" />
            <p className="text-xs font-semibold">Loading real-time event stats...</p>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500">
            <p className="text-xs font-semibold">Please select an event to view statistics</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="border-slate-150 dark:border-slate-850 relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 p-6 lg:col-span-3 dark:bg-slate-950/40">
          {!manualMode ? (
            <div className="flex w-full flex-col items-center gap-4">
              {devices.length > 1 && (
                <div className="mb-2 flex w-full max-w-sm items-center gap-2">
                  <label
                    htmlFor="camera-select"
                    className="min-w-[70px] text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500"
                  >
                    Source:
                  </label>
                  <select
                    id="camera-select"
                    value={selectedCameraId}
                    onChange={handleCameraChange}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.label || `Camera ${devices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900 dark:border-slate-800/80">
                <div id={readerId} className="h-full w-full object-cover" />

                {scannerStatus === "scanning" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative flex h-2/3 w-2/3 animate-pulse items-center justify-center rounded-2xl border-2 border-indigo-500 bg-transparent">
                      <span className="absolute top-0 left-0 -mt-1 -ml-1 h-6 w-6 rounded-tl-lg border-t-4 border-l-4 border-indigo-500" />
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 h-6 w-6 rounded-tr-lg border-t-4 border-r-4 border-indigo-500" />
                      <span className="absolute bottom-0 left-0 -mb-1 -ml-1 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-indigo-500" />
                      <span className="absolute right-0 bottom-0 -mr-1 -mb-1 h-6 w-6 rounded-br-lg border-r-4 border-b-4 border-indigo-500" />
                      <div
                        className="absolute h-[3px] w-full animate-bounce rounded-full bg-rose-500/80 shadow-[0_0_10px_#f43f5e]"
                        style={{ top: "10%" }}
                      />
                    </div>
                  </div>
                )}

                {scannerStatus === "idle" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 p-4 text-center text-white">
                    <CameraOff className="h-10 w-10 text-slate-500" />
                    <h4 className="text-sm font-bold">Scanner is currently inactive</h4>
                    <p className="max-w-xs text-[10px] leading-relaxed text-slate-400">
                      Make sure Eventra has browser camera access permissions.
                    </p>
                    <button
                      onClick={() => startScanner(selectedCameraId)}
                      className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700"
                    >
                      Start Camera Stream
                    </button>
                  </div>
                )}

                {scannerStatus === "starting" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-white">
                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                    <span className="text-xs font-bold text-slate-400">
                      Waking up lens hardware...
                    </span>
                  </div>
                )}

                {scannerStatus === "stopped" && !scanResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-white">
                    <CameraOff className="h-8 w-8 animate-bounce text-amber-500" />
                    <span className="text-xs font-bold text-slate-300">
                      Camera paused / feed stopped
                    </span>
                    <button
                      onClick={() => startScanner(selectedCameraId)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold"
                    >
                      Resume Scan
                    </button>
                  </div>
                )}
              </div>

              {scannerStatus === "scanning" && (
                <button
                  onClick={stopScanner}
                  className="text-slate-650 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                  aria-label="Pause scanner"
                >
                  Pause Scanner
                </button>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleManualCheckIn}
              className="flex w-full max-w-sm flex-col gap-5 py-2"
            >
              <div className="mb-2 text-center">
                <Keyboard className="mx-auto mb-2 h-10 w-10 animate-bounce text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Manual Check-In Fallback
                </h4>
                <p className="mx-auto max-w-xs text-[10px] leading-normal text-slate-500 dark:text-slate-400">
                  Type in the ticket credentials directly. Use this when the guest&apos;s device
                  screen is cracked or camera access is down.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Attendee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Ranjan"
                  value={manualAttendeeName}
                  onChange={(e) => setManualAttendeeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Ticket Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. GLO-PRI-8F39A"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 uppercase focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  Event Destination
                </label>
                <select
                  value={manualEventId}
                  onChange={handleEventSelect}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  {events.length === 0 ? (
                    <option value="">No events available</option>
                  ) : (
                    events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
                aria-label="Find and verify check-in"
              >
                <Search className="h-3.5 w-3.5" />
                Find & Verify Check-In
              </button>
            </form>
          )}

          {scanResult && (
            <div className="animate-fadeIn absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-md">
              {scanResult.status === "verified" && (
                <>
                  <CheckCircle2 className="mb-3 h-16 w-16 animate-bounce text-emerald-500" />
                  <span className="mb-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                    Verified Entry
                  </span>
                </>
              )}
              {scanResult.status === "flagged" && (
                <>
                  <XCircle className="mb-3 h-16 w-16 animate-bounce text-rose-500" />
                  <span className="text-rose-455 mb-2 rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                    Flagged / Security Alert
                  </span>
                </>
              )}
              {scanResult.status === "duplicate" && (
                <>
                  <AlertTriangle className="mb-3 h-16 w-16 animate-bounce text-amber-500" />
                  <span className="mb-2 rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                    Duplicate Attempt
                  </span>
                </>
              )}

              <h3 className="max-w-xs text-lg font-black text-white">{scanResult.message}</h3>

              {scanResult.data && (
                <div className="my-5 w-full max-w-sm space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <div>
                      <span className="block text-[9px] leading-none font-bold text-slate-400 uppercase">
                        ATTENDEE
                      </span>
                      <span className="text-xs font-bold text-white">
                        {scanResult.data.userName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <div>
                      <span className="block text-[9px] leading-none font-bold text-slate-400 uppercase">
                        EVENT
                      </span>
                      <span className="text-xs font-bold text-zinc-300">
                        {scanResult.data.eventName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    <div>
                      <span className="block text-[9px] leading-none font-bold text-slate-400 uppercase">
                        TICKET CODE / UUID
                      </span>
                      <span className="text-slate-350 font-mono text-xs font-bold">
                        {scanResult.data.ticketId}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.raw && (
                <div className="text-rose-455 my-3 w-full max-w-sm truncate rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-left font-mono text-xs">
                  Raw content: {scanResult.raw}
                </div>
              )}

              <button
                onClick={handleResetScan}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25"
                aria-label="Scan next ticket"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Scan Next Ticket
              </button>
            </div>
          )}
        </div>

        <div className="border-slate-150 dark:border-slate-850 flex h-full min-h-[380px] flex-col rounded-2xl border bg-slate-50 p-5 lg:col-span-2 dark:bg-slate-950/40">
          <h3 className="mb-4 flex items-center justify-between text-xs font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 fill-indigo-500/10 text-indigo-500" />
              Scanning History Log
            </span>
            <span className="dark:bg-slate-850 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {isOnline ? "Live" : "Cached"}
            </span>
          </h3>

          <div className="max-h-[320px] flex-1 space-y-3 overflow-y-auto pr-1">
            {checkinHistory.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
                <FileText className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-xs font-bold">No tickets scanned yet</p>
                <p className="mt-1 max-w-xs text-[10px] leading-normal">
                  Scanned or manually verified check-ins on this session will show up here.
                </p>
              </div>
            ) : (
              checkinHistory.map((item) => (
                <div
                  key={item.id}
                  className="border-slate-150 dark:border-slate-850/80 flex items-center justify-between rounded-xl border bg-white p-3 transition hover:shadow-sm dark:bg-slate-900"
                >
                  <div className="flex max-w-[70%] items-center gap-2.5 truncate">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      {item.name ? item.name.charAt(0) : "U"}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-slate-450 truncate text-[9px]">{item.event}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] text-slate-400">
                      {item.ticketId?.slice(-5) || "N/A"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider uppercase ${
                        item.status === "Verified"
                          ? "dark:text-emerald-450 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40"
                          : item.status === "Queued"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "dark:text-rose-455 bg-rose-100 text-rose-800 dark:bg-rose-950/40"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
