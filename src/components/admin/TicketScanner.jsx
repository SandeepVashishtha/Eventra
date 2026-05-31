import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
} from "lucide-react";
import { toast } from "react-toastify";
import "./TicketScanner.css";

const LOCAL_STORAGE_KEY = "eventra_checkins";

export default function TicketScanner() {
  const [devices, setDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [scannerStatus, setScannerStatus] = useState("idle"); // idle, starting, scanning, stopped, error
  const [scanResult, setScanResult] = useState(null); // { status: 'verified'|'flagged'|'duplicate', data: { ... } }
  const [manualMode, setManualMode] = useState(false);

  // Manual form state
  const [manualTicketId, setManualTicketId] = useState("");
  const [manualAttendeeName, setManualAttendeeName] = useState("");
  const [manualEventName, setManualEventName] = useState("Global AI Hackathon");

  const qrCodeInstanceRef = useRef(null);
  const readerId = "html5-qr-reader";

  // Load cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length > 0) {
          setDevices(cameras);
          // Default to back camera or first device
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
      // Cleanup scanner on unmount
      stopScanner();
    };
  }, []);

  // Stop the active scanner
  const stopScanner = async () => {
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        await qrCodeInstanceRef.current.stop();
        setScannerStatus("stopped");
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  // Start the scanner with selected camera ID
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
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Silent failure during continuous frame scanning to avoid spamming logs
        }
      );
      setScannerStatus("scanning");
    } catch (err) {
      console.error("Scanner failed to start:", err);
      setScannerStatus("error");
      toast.error("Could not access camera. Please verify permissions.");
    }
  };

  // Switch camera handle
  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (scannerStatus === "scanning") {
      startScanner(newId);
    }
  };

  // Process a successfully decoded QR code
  const handleScanSuccess = async (decodedText) => {
    await stopScanner();

    let ticketData = null;
    try {
      ticketData = JSON.parse(decodedText);
    } catch (e) {
      // Fallback: Check if it's a raw string ticket ID instead of JSON
      if (decodedText.trim().length > 3) {
        ticketData = {
          ticketId: decodedText.trim(),
          eventName: "Official Eventra Event",
          userName: "Guest Attendee",
          eventId: "unknown",
        };
      }
    }

    if (!ticketData || !ticketData.ticketId) {
      setScanResult({
        status: "flagged",
        message: "Invalid QR Code format. Ticket is secure and cannot be verified.",
        raw: decodedText,
      });
      toast.error("Security Alert: Invalid Ticket QR Code scanned!");
      logCheckIn("Unknown Attendee", "Unknown Event", "Flagged");
      return;
    }

    processTicket(ticketData);
  };

  const processTicket = (ticketData) => {
    let savedCheckins = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      savedCheckins = Array.isArray(parsed) ? parsed : [];
    } catch {
      savedCheckins = [];
    }

    // Check if duplicate check-in
    const isDuplicate = savedCheckins.some(
      (c) => c.ticketId === ticketData.ticketId && c.status === "Verified"
    );

    if (isDuplicate) {
      setScanResult({
        status: "duplicate",
        data: ticketData,
        message: "This ticket has already been checked in!",
      });
      toast.warning(`Duplicate Attempt: ${ticketData.userName} is already checked in.`);
      logCheckIn(ticketData.userName, ticketData.eventName, "Flagged", ticketData.ticketId);
    } else {
      setScanResult({
        status: "verified",
        data: ticketData,
        message: "Attendee check-in verified successfully!",
      });
      toast.success(`Check-In Verified: Welcome, ${ticketData.userName}!`);
      logCheckIn(ticketData.userName, ticketData.eventName, "Verified", ticketData.ticketId);
    }
  };

  // Log checkin to localStorage
  const logCheckIn = (name, event, status, ticketId = null) => {
    try {
      let savedCheckins = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        savedCheckins = Array.isArray(parsed) ? parsed : [];
      } catch {
        savedCheckins = [];
      }
      const newCheckin = {
        id: `scanned-${Date.now()}`,
        ticketId: ticketId || `unknown-${Date.now()}`,
        name: name || "Unknown Guest",
        event: event || "Official Event",
        time: "Just now",
        status: status, // "Verified" or "Flagged"
      };

      const updated = [newCheckin, ...savedCheckins].slice(0, 50); // limit local history to 50
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to write check-in to localStorage:", err);
    }
  };

  // Handle manual code check-in submit
  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim() || !manualAttendeeName.trim()) {
      toast.error("Please fill in both Ticket Code and Attendee Name.");
      return;
    }

    const manualData = {
      ticketId: manualTicketId.trim().toUpperCase(),
      userName: manualAttendeeName.trim(),
      eventName: manualEventName,
      eventId: "manual",
    };

    processTicket(manualData);

    // Clear manual inputs
    setManualTicketId("");
    setManualAttendeeName("");
  };

  const handleResetScan = () => {
    setScanResult(null);
    startScanner(selectedCameraId);
  };

  return (
    <div className="ts-root bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md transition-all duration-300">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500 animate-pulse" />
            Active Door Pass Scanner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access device camera to scan dynamic attendee QR codes instantly or enter ticket codes
            manually.
          </p>
        </div>

        {/* SCAN MODE TOGGLES */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => {
              setManualMode(false);
              setScanResult(null);
              startScanner(selectedCameraId);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              !manualMode
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
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
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              manualMode
                ? "bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            Manual Code Entry
          </button>
        </div>
      </div>

      {/* SCANNING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT / CENTER PANEL: SCANNER CONTAINER or MANUAL VIEW */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 min-h-[380px] relative overflow-hidden">
          {!manualMode ? (
            /* CAMERA MODE */
            <div className="w-full flex flex-col items-center gap-4">
              {/* Camera selection dropdown */}
              {devices.length > 1 && (
                <div className="w-full max-w-sm flex items-center gap-2 mb-2">
                  <label
                    htmlFor="camera-select"
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest min-w-[70px]"
                  >
                    Source:
                  </label>
                  <select
                    id="camera-select"
                    value={selectedCameraId}
                    onChange={handleCameraChange}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.label || `Camera ${devices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reader Container Frame */}
              <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-slate-700/80 dark:border-slate-800/80 flex items-center justify-center">
                <div id={readerId} className="w-full h-full object-cover" />

                {/* Target overlay guide frame */}
                {scannerStatus === "scanning" && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-2/3 h-2/3 border-2 border-indigo-500 rounded-2xl relative animate-pulse flex items-center justify-center bg-transparent">
                      {/* Crop Corners */}
                      <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-lg" />
                      <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-lg" />
                      <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-lg" />
                      <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-lg" />

                      {/* Glowing red scanner beam line */}
                      <div
                        className="absolute w-full h-[3px] bg-rose-500/80 shadow-[0_0_10px_#f43f5e] rounded-full animate-bounce"
                        style={{ top: "10%" }}
                      />
                    </div>
                  </div>
                )}

                {/* Scanner states overlay messages */}
                {scannerStatus === "idle" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 text-white p-4 text-center">
                    <CameraOff className="w-10 h-10 text-slate-500" />
                    <h4 className="text-sm font-bold">Scanner is currently inactive</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      Make sure Eventra has browser camera access permissions.
                    </p>
                    <button
                      onClick={() => startScanner(selectedCameraId)}
                      className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all shadow-md"
                    >
                      Start Camera Stream
                    </button>
                  </div>
                )}

                {scannerStatus === "starting" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-white">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">
                      Waking up lens hardware...
                    </span>
                  </div>
                )}

                {scannerStatus === "stopped" && !scanResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-white">
                    <CameraOff className="w-8 h-8 text-amber-500 animate-bounce" />
                    <span className="text-xs font-bold text-slate-300">
                      Camera paused / feed stopped
                    </span>
                    <button
                      onClick={() => startScanner(selectedCameraId)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold"
                    >
                      Resume Scan
                    </button>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {scannerStatus === "scanning" && (
                <button
                  onClick={stopScanner}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold text-slate-650 dark:text-slate-400 transition"
                 aria-label="button">
                  Pause Scanner
                </button>
              )}
            </div>
          ) : (
            /* MANUAL MODE ENTRY FORM */
            <form
              onSubmit={handleManualCheckIn}
              className="w-full max-w-sm flex flex-col gap-5 py-2"
            >
              <div className="text-center mb-2">
                <Keyboard className="w-10 h-10 text-indigo-500 mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Manual Check-In Fallback
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                  Type in the ticket credentials directly. Use this when the guest&apos;s device screen
                  is cracked or camera access is down.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Attendee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Ranjan"
                  value={manualAttendeeName}
                  onChange={(e) => setManualAttendeeName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Ticket Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. GLO-PRI-8F39A"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Event Destination
                </label>
                <select
                  value={manualEventName}
                  onChange={(e) => setManualEventName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Global AI Hackathon">Global AI Hackathon</option>
                  <option value="React Conference 2025">React Conference 2025</option>
                  <option value="Web Dev Workshop">Web Dev Workshop</option>
                  <option value="Hack for Sustainability">Hack for Sustainability</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all rounded-xl mt-2 flex items-center justify-center gap-1.5"
               aria-label="button">
                <Search className="w-3.5 h-3.5" />
                Find & Verify Check-In
              </button>
            </form>
          )}

          {/* SCAN FEEDBACK OVERLAY CARD */}
          {scanResult && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
              {scanResult.status === "verified" && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce mb-3" />
                  <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full mb-2">
                    Verified Entry
                  </span>
                </>
              )}
              {scanResult.status === "flagged" && (
                <>
                  <XCircle className="w-16 h-16 text-rose-500 animate-bounce mb-3" />
                  <span className="text-[10px] font-black tracking-widest uppercase bg-rose-500/20 text-rose-455 px-3 py-1 rounded-full mb-2">
                    Flagged / Security Alert
                  </span>
                </>
              )}
              {scanResult.status === "duplicate" && (
                <>
                  <AlertTriangle className="w-16 h-16 text-amber-500 animate-bounce mb-3" />
                  <span className="text-[10px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full mb-2">
                    Duplicate Attempt
                  </span>
                </>
              )}

              <h3 className="text-lg font-black text-white max-w-xs">{scanResult.message}</h3>

              {scanResult.data && (
                <div className="my-5 p-4 border border-white/10 bg-white/5 rounded-2xl w-full max-w-sm text-left space-y-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                        ATTENDEE
                      </span>
                      <span className="text-xs font-bold text-white">
                        {scanResult.data.userName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                        EVENT
                      </span>
                      <span className="text-xs font-bold text-zinc-300">
                        {scanResult.data.eventName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                        TICKET CODE / UUID
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-350">
                        {scanResult.data.ticketId}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.raw && (
                <div className="my-3 p-3 border border-red-500/20 bg-red-950/20 rounded-xl w-full max-w-sm text-xs font-mono text-rose-455 text-left truncate">
                  Raw content: {scanResult.raw}
                </div>
              )}

              <button
                onClick={handleResetScan}
                className="mt-2 inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all"
               aria-label="button">
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Next Ticket
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: LIVE ACTIVITY LOG PREVIEW */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[380px] bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-5">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/10" />
              Scanning History Log
            </span>
            <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
              Live
            </span>
          </h3>

          {/* History records stack */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[320px] pr-1">
            {(() => {
              let saved = [];
              try {
                const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
                saved = Array.isArray(parsed) ? parsed : [];
              } catch {
                saved = [];
              }
              if (saved.length === 0) {
                return (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                    <FileText className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs font-bold">No tickets scanned yet</p>
                    <p className="text-[10px] mt-1 leading-normal max-w-xs">
                      Scanned or manually verified check-ins on this session will show up here.
                    </p>
                  </div>
                );
              }

              return saved.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850/80 rounded-xl hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    <div className="flex items-center justify-center w-7 h-7 text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-full shrink-0">
                      {item.name ? item.name.charAt(0) : "U"}
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </div>
                      <div className="text-[9px] text-slate-450 truncate">{item.event}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-slate-400">
                      {item.ticketId?.slice(-5) || "N/A"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                        item.status === "Verified"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
