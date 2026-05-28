import React, { useState, useEffect, useCallback } from "react";
import { 
  QrCode, Camera, ShieldCheck, ShieldAlert, Users, 
  Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, 
  Trash2, Search, ArrowLeft, Award, Sparkles, BookOpen 
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { 
  saveOfflineManifest, 
  getOfflineManifest, 
  recordCheckinLocally, 
  getOfflineCheckinLogs, 
  clearCheckinDB 
} from "../../utils/checkinStorage";
import "./TicketValidator.css";

const PRESET_EVENTS = [
  { id: "evt_ai_2026", title: "Global AI Hackathon 2026", type: "hackathon", attendeesCount: 5 },
  { id: "evt_react_adv", title: "React Advanced Masterclass", type: "workshop", attendeesCount: 4 },
  { id: "evt_eb_meetup", title: "Eventra Builders Meetup", type: "meetup", attendeesCount: 3 }
];

const MOCK_ATTENDEES = {
  evt_ai_2026: [
    { ticketId: "AI-2026-ADA", userName: "Ada Lovelace", email: "ada@computing.org", ticketType: "VIP" },
    { ticketId: "AI-2026-ALA", userName: "Alan Turing", email: "alan@enigma.net", ticketType: "General" },
    { ticketId: "AI-2026-GRA", userName: "Grace Hopper", email: "grace@nanoseconds.edu", ticketType: "VIP" },
    { ticketId: "AI-2026-CLU", userName: "Claude Shannon", email: "claude@information.bit", ticketType: "General" },
    { ticketId: "AI-2026-JOH", userName: "John von Neumann", email: "john@cellular.org", ticketType: "General" }
  ],
  evt_react_adv: [
    { ticketId: "RJS-ADV-DAN", userName: "Dan Abramov", email: "dan@overreacted.io", ticketType: "General" },
    { ticketId: "RJS-ADV-SOP", userName: "Sophie Alpert", email: "sophie@react.dev", ticketType: "VIP" },
    { ticketId: "RJS-ADV-AND", userName: "Andrew Clark", email: "andrew@fiber.net", ticketType: "General" },
    { ticketId: "RJS-ADV-SEB", userName: "Sebastian Markbåge", email: "seb@suspense.org", ticketType: "VIP" }
  ],
  evt_eb_meetup: [
    { ticketId: "EVM-MEE-HAR", userName: "Harsh Bokade", email: "harsh@eventra.com", ticketType: "VIP" },
    { ticketId: "EVM-MEE-SAN", userName: "Sandeep Vashishtha", email: "sandeep@eventra.com", ticketType: "General" },
    { ticketId: "EVM-MEE-EST", userName: "Esther Duffy", email: "esther@eventra.com", ticketType: "General" }
  ]
};

const TicketValidator = () => {
  const [selectedEventId, setSelectedEventId] = useState(PRESET_EVENTS[0].id);
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  const [payloadInput, setPayloadInput] = useState("");
  const [offlineManifest, setOfflineManifest] = useState(null);
  const [scannedLogs, setScannedLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Validation outcome feedback states
  const [scanResult, setScanResult] = useState({
    status: "AWAITING", // AWAITING, SUCCESS, EXPIRED, FORGED, DUPLICATE, INVALID
    message: "Position QR code in simulated viewfinder to begin scanning.",
    attendee: null
  });

  const activeEvent = PRESET_EVENTS.find(e => e.id === selectedEventId);

  // Load manifest and logs on component load
  const loadOfflineData = useCallback(async () => {
    const manifest = await getOfflineManifest(selectedEventId);
    setOfflineManifest(manifest);

    const logs = await getOfflineCheckinLogs();
    const eventLogs = logs.filter(log => log.eventId === selectedEventId);
    setScannedLogs(eventLogs);
  }, [selectedEventId]);

  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  // Download Manifest offline
  const handleDownloadManifest = async () => {
    const mockList = MOCK_ATTENDEES[selectedEventId] || [];
    const success = await saveOfflineManifest(selectedEventId, mockList);
    if (success) {
      toast.success(`Manifest cached offline! ${mockList.length} registered attendees preloaded.`);
      loadOfflineData();
    } else {
      toast.error("Failed to cache manifest offline.");
    }
  };

  // Perform validation on a QR Code payload string
  const validateQrPayload = async (rawPayload) => {
    if (!rawPayload || !rawPayload.trim()) {
      toast.warn("Please enter a valid QR code payload.");
      return;
    }

    try {
      const data = JSON.parse(rawPayload);
      const { ticketId, eventId, timestamp, signature } = data;

      if (!ticketId || !eventId || !timestamp || !signature) {
        setScanResult({
          status: "FORGED",
          message: "Structure validation failed. QR Code is missing vital secure headers.",
          attendee: null
        });
        await recordCheckinLocally(selectedEventId, ticketId || "UNKNOWN", null, "FORGED", "Missing vital secure headers");
        loadOfflineData();
        return;
      }

      // Check if this pass is for the selected event
      if (eventId !== selectedEventId) {
        setScanResult({
          status: "INVALID",
          message: `Ticket event mismatch! This pass belongs to event ID: "${eventId}" rather than "${selectedEventId}".`,
          attendee: null
        });
        await recordCheckinLocally(selectedEventId, ticketId, null, "INVALID", `Ticket event mismatch (${eventId})`);
        loadOfflineData();
        return;
      }

      // Cryptographic verification: Recompute event secret & HMAC signature
      const eventSecret = CryptoJS.SHA256(eventId + "-eventra-secure-salt").toString();
      const expectedSignature = CryptoJS.HmacSHA256(
        `${ticketId}-${eventId}-${timestamp}`,
        eventSecret
      ).toString();

      if (signature !== expectedSignature) {
        setScanResult({
          status: "FORGED",
          message: "HMAC signature mismatch! Ticket hash validation failed, possibly forged or tampered.",
          attendee: null
        });
        await recordCheckinLocally(selectedEventId, ticketId, null, "FORGED", "HMAC signature mismatch");
        loadOfflineData();
        return;
      }

      // Time-bound validation (Replay Protection): Check if timestamp is within 120s
      const now = Date.now();
      const timeDiff = Math.abs(now - timestamp);
      if (timeDiff > 120 * 1000) {
        const secsAgo = Math.floor(timeDiff / 1000);
        setScanResult({
          status: "EXPIRED",
          message: `Dynamic pass expired! Ticket timestamp is older by ${secsAgo}s (Replay screenshot prevention).`,
          attendee: null
        });
        await recordCheckinLocally(selectedEventId, ticketId, null, "EXPIRED", `Pass expired by ${secsAgo}s`);
        loadOfflineData();
        return;
      }

      // Registry check: Verify attendee manifest cache exists
      if (!offlineManifest) {
        setScanResult({
          status: "INVALID",
          message: "Offline manifest not downloaded. Please click 'Sync Offline Manifest' to load registry.",
          attendee: null
        });
        return;
      }

      const attendee = offlineManifest.attendees.find(a => a.ticketId === ticketId);
      if (!attendee) {
        setScanResult({
          status: "INVALID",
          message: `Ticket ID "${ticketId}" not found in offline registered manifest. Access denied.`,
          attendee: null
        });
        await recordCheckinLocally(selectedEventId, ticketId, null, "INVALID", "Ticket not in manifest");
        loadOfflineData();
        return;
      }

      // Double check-in prevention: Check local scanned logs
      const doubleCheck = scannedLogs.find(log => log.ticketId === ticketId && log.status === "SUCCESS");
      if (doubleCheck) {
        const scanTime = new Date(doubleCheck.timestamp).toLocaleTimeString();
        setScanResult({
          status: "DUPLICATE",
          message: `Duplicate check-in blocked! This pass was already approved locally at ${scanTime}.`,
          attendee: {
            userName: attendee.userName,
            email: attendee.email,
            ticketType: attendee.ticketType
          }
        });
        await recordCheckinLocally(selectedEventId, ticketId, attendee, "DUPLICATE", `Duplicate check-in blocked (first scan at ${scanTime})`);
        loadOfflineData();
        return;
      }

      // Success Check-In
      setScanResult({
        status: "SUCCESS",
        message: `VALID PASS - APPROVED! Welcome ${attendee.userName}.`,
        attendee: {
          userName: attendee.userName,
          email: attendee.email,
          ticketType: attendee.ticketType
        }
      });

      await recordCheckinLocally(selectedEventId, ticketId, attendee, "SUCCESS", "Valid ticket approved");
      loadOfflineData();
      toast.success(`Approved check-in: ${attendee.userName}!`);
    } catch (e) {
      setScanResult({
        status: "FORGED",
        message: `Failed to parse QR payload: ${e.message}. Ensure it is secure JSON format.`,
        attendee: null
      });
    }
  };

  // Mock scan triggers
  const triggerMockScan = (type) => {
    const mockList = MOCK_ATTENDEES[selectedEventId] || [];
    if (mockList.length === 0) {
      toast.warn("No mock attendees available.");
      return;
    }

    const attendee = mockList[0];
    const ticketId = attendee.ticketId;
    const eventId = selectedEventId;
    const eventSecret = CryptoJS.SHA256(eventId + "-eventra-secure-salt").toString();

    let timestamp = Date.now();
    let signature = "";

    switch (type) {
      case "SUCCESS":
        // Valid fresh ticket
        signature = CryptoJS.HmacSHA256(`${ticketId}-${eventId}-${timestamp}`, eventSecret).toString();
        break;
      case "EXPIRED":
        // 5 minutes old
        timestamp = Date.now() - 5 * 60 * 1000;
        signature = CryptoJS.HmacSHA256(`${ticketId}-${eventId}-${timestamp}`, eventSecret).toString();
        break;
      case "FORGED":
        // Invalid signature
        signature = "bad-forged-signature-hash-value-12345";
        break;
      case "DUPLICATE":
        // Already scanned ticket — we just validate the same SUCCESS payload
        signature = CryptoJS.HmacSHA256(`${ticketId}-${eventId}-${timestamp}`, eventSecret).toString();
        break;
      default:
        return;
    }

    const payload = JSON.stringify({ ticketId, eventId, timestamp, signature });
    setPayloadInput(payload);
    validateQrPayload(payload);
  };

  // Sync logs back online
  const handleSyncLogs = () => {
    if (isOfflineMode) {
      toast.info("Reconnecting network simulation to sync validation logs...");
      setIsOfflineMode(false);
    }
    
    toast.success(`Synched ${scannedLogs.length} validation logs back to Eventra cloud database!`);
  };

  // Clear Database logs
  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to clear all offline manifests and scanned logs on this device?")) {
      await clearCheckinDB();
      toast.success("Offline cache cleared.");
      loadOfflineData();
      setScanResult({
        status: "AWAITING",
        message: "Position QR code in simulated viewfinder to begin scanning.",
        attendee: null
      });
    }
  };

  // Stats computation
  const successCount = scannedLogs.filter(l => l.status === "SUCCESS").length;
  const duplicateCount = scannedLogs.filter(l => l.status === "DUPLICATE").length;
  const failedCount = scannedLogs.filter(l => ["EXPIRED", "FORGED", "INVALID"].includes(l.status)).length;

  const filteredLogs = scannedLogs.filter(log => 
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="validator-wrapper min-h-screen bg-slate-950 text-white pb-12">
      {/* Top Banner Navigation */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-white/15" />
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-400" />
              <span className="font-bold text-lg tracking-tight">Eventra Organizer Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOfflineMode(!isOfflineMode)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isOfflineMode 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>SIMULATED OFFLINE</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>ONLINE READY</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sync Deck & Live Scans */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Event Selector */}
          <div className="validator-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold">Event Controller Deck</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1.5">VALIDATION TARGET</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {PRESET_EVENTS.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>OFFLINE REGISTRY STATUS:</span>
                  <span className={`font-bold ${offlineManifest ? "text-emerald-400" : "text-amber-500"}`}>
                    {offlineManifest ? "CACHED" : "MISSING"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadManifest}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Offline Manifest</span>
                  </button>
                  <button 
                    onClick={handleClearLogs}
                    className="flex items-center justify-center p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Clear Offline Cache"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Scanner Viewfinder */}
          <div className="validator-card overflow-hidden">
            <div className="p-4 border-b border-white/15 bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Viewfinder (Simulated)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">LIVE</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-black/60 flex items-center justify-center">
              {/* Target bracket outlines */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />

              {/* Scanning red laser line */}
              <div className="absolute left-8 right-8 h-0.5 bg-red-500 shadow-[0_0_10px_red] scan-laser-animation" />

              <div className="flex flex-col items-center gap-3 text-center z-10 px-8">
                <QrCode className="w-16 h-16 text-zinc-600/70" />
                <span className="text-xs text-zinc-500 max-w-[240px]">
                  Use the quick mock scans below or enter a raw JSON payload string to simulate scanning.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-900/40">
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider mb-2">QUICK TEST SIMULATOR</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerMockScan("SUCCESS")} 
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Scan Valid Pass
                </button>
                <button 
                  onClick={() => triggerMockScan("EXPIRED")} 
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Scan Expired Pass
                </button>
                <button 
                  onClick={() => triggerMockScan("FORGED")} 
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Scan Forged Pass
                </button>
                <button 
                  onClick={() => triggerMockScan("DUPLICATE")} 
                  className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-400 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                >
                  Scan Duplicate
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Validation Console & Logs */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Real-time feedback monitor */}
          <div className="validator-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold">Real-Time Verification Monitor</h2>
            </div>

            {/* AWAITING SCAN state */}
            {scanResult.status === "AWAITING" && (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <QrCode className="w-12 h-12 text-zinc-600 mb-2" />
                <p className="text-zinc-500 text-xs text-center">{scanResult.message}</p>
              </div>
            )}

            {/* APPROVED state */}
            {scanResult.status === "SUCCESS" && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase">ENTRY GRANTED • APPROVED</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{scanResult.attendee.ticketType} PASS</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-0.5">{scanResult.attendee.userName}</h3>
                  <p className="text-xs text-zinc-400 mb-2">{scanResult.attendee.email}</p>
                  <p className="text-xs text-emerald-300/80 leading-relaxed font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">{scanResult.message}</p>
                </div>
              </div>
            )}

            {/* FAIL STATES (EXPIRED, FORGED, DUPLICATE, INVALID) */}
            {["EXPIRED", "FORGED", "DUPLICATE", "INVALID"].includes(scanResult.status) && (
              <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)] flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 flex-shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-red-400 tracking-wider uppercase">ACCESS DENIED • {scanResult.status}</span>
                    {scanResult.attendee && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">{scanResult.attendee.ticketType} PASS</span>
                    )}
                  </div>
                  {scanResult.attendee ? (
                    <>
                      <h3 className="text-lg font-bold text-white mb-0.5">{scanResult.attendee.userName}</h3>
                      <p className="text-xs text-zinc-400 mb-2">{scanResult.attendee.email}</p>
                    </>
                  ) : (
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2">Unknown/Forged Attendee Record</h3>
                  )}
                  <p className="text-xs text-red-300/80 leading-relaxed font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">{scanResult.message}</p>
                </div>
              </div>
            )}

            {/* Manual JSON input form */}
            <div className="mt-6 border-t border-white/10 pt-6">
              <label className="text-xs text-zinc-400 font-bold block mb-2 uppercase tracking-wider">MANUAL SECURE PAYLOAD INPUT</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                  placeholder='{"ticketId":"...","eventId":"...","timestamp":...}'
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button 
                  onClick={() => validateQrPayload(payloadInput)}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors text-white"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Validation Metrics Counters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="validator-card p-4 text-center border-b border-emerald-500/20">
              <div className="text-2xl font-black text-emerald-400">{successCount}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">APPROVED</div>
            </div>
            
            <div className="validator-card p-4 text-center border-b border-purple-500/20">
              <div className="text-2xl font-black text-purple-400">{duplicateCount}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">DUPLICATES</div>
            </div>

            <div className="validator-card p-4 text-center border-b border-red-500/20">
              <div className="text-2xl font-black text-red-400">{failedCount}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">REJECTED</div>
            </div>
          </div>

          {/* Scan Log History Table */}
          <div className="validator-card flex-1 flex flex-col min-h-[350px]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold">Local Scan Logs ({scannedLogs.length})</h2>
              </div>

              {/* Sync check-in logs button */}
              {scannedLogs.length > 0 && (
                <button 
                  onClick={handleSyncLogs}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors text-white uppercase tracking-wider"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Logs ({scannedLogs.length})</span>
                </button>
              )}
            </div>

            {/* Filter Search */}
            <div className="px-5 py-3 border-b border-white/5 bg-slate-900/30 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter logs by attendee name, ticket code, or status..."
                className="bg-transparent border-none text-xs text-white placeholder-zinc-600 focus:outline-none w-full"
              />
            </div>

            {/* Logs Table body */}
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-zinc-600 text-xs">
                  <BookOpen className="w-8 h-8 mb-2" />
                  <span>No matching scan logs found in offline cache.</span>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-white">{log.userName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight">{log.ticketId} • {log.ticketType}</span>
                        {log.reason && (
                          <span className="text-[10px] text-zinc-400 italic mt-0.5">Note: {log.reason}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          log.status === "SUCCESS" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : log.status === "DUPLICATE"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[9px] text-zinc-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TicketValidator;
