import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera, CameraOff, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Keyboard, FileText, User, Calendar, Sparkles, Search, Wifi, WifiOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { pushToQueue } from "../../utils/offlineQueue";
import { validateTicket, recordCheckIn, fetchCheckInHistory, fetchScannerEvents, fetchTicketStats } from "../../services/ticketService";
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
  // 🔥 FIX 1: Track component mount state to prevent orphaned camera streams
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
    isMountedRef.current = true;
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!isMountedRef.current) return;
        if (cameras && cameras.length > 0) {
          setDevices(cameras);
          const backCam = cameras.find(
            (cam) => cam.label.toLowerCase().includes("back") || cam.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCam ? backCam.id : cameras[0].id);
        } else {
          setScannerStatus("error");
          toast.error("No camera devices found.");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        if (isMountedRef.current) setScannerStatus("error");
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
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchStats(selectedEventId);
      fetchCheckInHistory(selectedEventId)
        .then((data) => {
          const items = Array.isArray(data) ? data : data.content || data.checkins || [];
          setCheckinHistory(items);
        })
        .catch(() => {});
    }
  }, [selectedEventId, fetchStats]);

  const stopScanner = async () => {
    if (qrCodeInstanceRef.current) {
      try {
        // 🔥 FIX 2: Properly await stop() and clear() to destroy the DOM video element
        if (qrCodeInstanceRef.current.isScanning) {
          await qrCodeInstanceRef.current.stop();
        }
        qrCodeInstanceRef.current.clear();
      } catch (err) {
        console.error("Failed to stop or clear scanner:", err);
      } finally {
        if (isMountedRef.current) setScannerStatus("stopped");
      }
    }
  };

  const startScanner = async (cameraId) => {
    const targetId = cameraId || selectedCameraId;
    if (!targetId) { toast.error("Please select a camera device first."); return; }

    await stopScanner();
    setScanResult(null);
    setScannerStatus("starting");

    try {
      const qrCode = new Html5Qrcode(readerId);
      qrCodeInstanceRef.current = qrCode;

      await qrCode.start(
        targetId,
        { fps: 10, qrbox: 250, aspectRatio: 1.0 },
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );

      // 🔥 FIX 3: Safety kill stream if component unmounted while camera spinning up
      if (!isMountedRef.current || manualMode) {
        await qrCode.stop();
        qrCode.clear();
        return;
      }
      setScannerStatus("scanning");
    } catch (err) {
      console.error("Scanner failed to start:", err);
      if (isMountedRef.current) { setScannerStatus("error"); toast.error("Camera access denied."); }
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
      const updated = [entry, ...JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) || "[]")].slice(0, 50);
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, []);

  const handleScanSuccess = async (decodedText) => {
    await stopScanner();
    let ticketData = null;
    try {
      ticketData = JSON.parse(decodedText);
    } catch {
      if (decodedText.startsWith("eyJ")) {
        const activeEvent = events.find(e => String(e.id) === String(selectedEventId));
        ticketData = {
          ticketId: decodedText,
          eventId: selectedEventId,
          userName: "Attendee",
          eventName: activeEvent ? activeEvent.title : "Active Event"
        };
      } else {
        setScanResult({ status: "flagged", message: "Invalid QR Code.", raw: decodedText });
        return;
      }
    }
    await processTicket(ticketData);
  };

  const processTicket = async (ticketData) => {
    const { ticketId, userName, eventId, eventName } = ticketData;
    if (!isOnline) {
      await pushToQueue({ actionType: "TICKET_CHECK_IN", ticketId, eventId, payload: ticketData });
      addToHistory({ id: `offline-${Date.now()}`, ticketId, name: userName, event: eventName, status: "Queued", time: new Date().toISOString() });
      return;
    }
    try {
      const result = await validateTicket(ticketId, eventId);
      if (result.alreadyCheckedIn) {
        addToHistory({ id: `dup-${Date.now()}`, ticketId, name: userName, event: eventName, status: "Flagged", time: new Date().toISOString() });
        return;
      }
      await recordCheckIn(ticketId, eventId, { validatedAt: new Date().toISOString() });
      addToHistory({ id: `verified-${Date.now()}`, ticketId, name: userName, event: eventName, status: "Verified", time: new Date().toISOString() });
      if (selectedEventId) fetchStats(selectedEventId);
    } catch (error) {
      toast.error("Validation error.");
    }
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    processTicket({ ticketId: manualTicketId, userName: manualAttendeeName, eventId: manualEventId, eventName: manualEventName });
    setManualTicketId(""); setManualAttendeeName("");
  };

  // ... (Keep the rest of your JSX as it was in your previous upload)
  return <div className="ts-root">...</div>;
}